import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

const PRICES = {
  pro: { monthly: 4900, annual: 3900 },
  scale: { monthly: 2900, annual: 2300 },
};

export async function POST(request: Request) {
  const stripe = getStripe();
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: { stripeCustomer: true },
  });

  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const planType: "pro" | "scale" = body.plan === "scale" ? "scale" : "pro";
  const scaleReps = Math.max(1, parseInt(body.reps) || 1);
  const billingInterval: "month" | "year" = body.interval === "year" ? "year" : "month";
  const isAnnual = billingInterval === "year";

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

  let lineItem: Stripe.Checkout.SessionCreateParams.LineItem;
  const unitAmount = isAnnual ? PRICES[planType].annual : PRICES[planType].monthly;

  if (planType === "scale") {
    const scalePriceId = isAnnual ? process.env.STRIPE_SCALE_ANNUAL_PRICE_ID : process.env.STRIPE_SCALE_MONTHLY_PRICE_ID;
    lineItem = scalePriceId
      ? { price: scalePriceId, quantity: scaleReps }
      : {
          price_data: {
            currency: "usd",
            product_data: {
              name: "RepLog AI Scale",
              description: `${scaleReps} reps · Everything in Pro + dedicated account manager, SSO, advanced analytics`,
            },
            unit_amount: isAnnual ? unitAmount * 12 : unitAmount,
            recurring: { interval: billingInterval },
          },
          quantity: scaleReps,
        };
  } else {
    const proPriceId = isAnnual ? process.env.STRIPE_PRO_ANNUAL_PRICE_ID : process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
    lineItem = proPriceId
      ? { price: proPriceId, quantity: 1 }
      : {
          price_data: {
            currency: "usd",
            product_data: {
              name: "RepLog AI Pro",
              description: "Up to 10 reps · Unlimited updates · All integrations · Analytics dashboard · Priority support",
            },
            unit_amount: isAnnual ? unitAmount * 12 : unitAmount,
            recurring: { interval: billingInterval },
          },
          quantity: 1,
        };
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [lineItem],
    metadata: { plan: planType, reps: String(scaleReps), interval: billingInterval },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?billing=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?billing=canceled`,
  });

  return NextResponse.json({ url: session.url });
}
