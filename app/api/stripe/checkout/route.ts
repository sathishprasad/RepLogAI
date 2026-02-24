import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST() {
  const stripe = getStripe();
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: { stripeCustomer: true },
  });

  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let customerId = dbUser.stripeCustomer?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      name: user.user_metadata?.full_name,
      metadata: { userId: dbUser.id },
    });
    customerId = customer.id;

    await prisma.stripeCustomer.create({
      data: {
        userId: dbUser.id,
        stripeCustomerId: customerId,
      },
    });
  }

  const priceId = process.env.STRIPE_PRO_PRICE_ID;

  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = priceId
    ? { price: priceId, quantity: 1 }
    : {
        price_data: {
          currency: "usd",
          product_data: {
            name: "RepLog AI Pro",
            description: "1,000 entries/month · 5 min voice notes · Priority AI processing",
          },
          unit_amount: 7900,
          recurring: { interval: "month" },
        },
        quantity: 1,
      };

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [lineItem],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?billing=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?billing=canceled`,
  });

  return NextResponse.json({ url: session.url });
}
