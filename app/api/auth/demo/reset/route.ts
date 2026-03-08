import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { DEMO_COOKIE, DEMO_EMAIL_SUFFIX, deleteDemoUser, createDemoUser } from "@/lib/demo";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const demoCookie = request.headers.get("cookie")?.match(/replog-demo-session=([^;]+)/)?.[1];
  if (!demoCookie) {
    return NextResponse.json({ error: "Not a demo session" }, { status: 403 });
  }

  try {
    // Delete old demo user
    const oldUser = await prisma.user.findUnique({ where: { id: demoCookie } });
    if (oldUser?.email.endsWith(DEMO_EMAIL_SUFFIX)) {
      await deleteDemoUser(oldUser.id);
    }

    // Create fresh demo user
    const newUser = await createDemoUser();

    const response = NextResponse.json({ success: true, message: "Demo reset complete" });

    response.cookies.set(DEMO_COOKIE, newUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Demo reset error:", err);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
