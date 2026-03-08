import { NextResponse } from "next/server";
import { createDemoUser, DEMO_COOKIE, DEMO_EMAIL_SUFFIX, deleteDemoUser } from "@/lib/demo";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // If user already has a demo session, clean up their old demo user
    const existingDemoCookie = request.headers.get("cookie")?.match(/replog-demo-session=([^;]+)/)?.[1];
    if (existingDemoCookie) {
      const existingUser = await prisma.user.findUnique({ where: { id: existingDemoCookie } });
      if (existingUser?.email.endsWith(DEMO_EMAIL_SUFFIX)) {
        await deleteDemoUser(existingUser.id);
      }
    }

    // Create a fresh isolated demo user
    const demoUser = await createDemoUser();

    const response = NextResponse.json({
      success: true,
      user: { id: demoUser.id, name: demoUser.name, email: demoUser.email },
    });

    // Set demo session cookie (24h expiry)
    response.cookies.set(DEMO_COOKIE, demoUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    // Client-readable flag for UI (non-httpOnly)
    response.cookies.set("replog-demo-mode", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Demo login error:", err);
    return NextResponse.json({ error: "Failed to create demo session" }, { status: 500 });
  }
}
