import { NextResponse } from "next/server";
import { getOrCreateDemoUser, DEMO_COOKIE } from "@/lib/demo";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const demoUser = await getOrCreateDemoUser();

    const response = NextResponse.json({
      success: true,
      user: { id: demoUser.id, name: demoUser.name, email: demoUser.email },
    });

    // Set demo session cookie (24h expiry)
    response.cookies.set(DEMO_COOKIE, demoUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
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
