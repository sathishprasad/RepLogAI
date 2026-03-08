import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { DEMO_COOKIE, DEMO_USER_EMAIL, getOrCreateDemoUser } from "@/lib/demo";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Verify this is a demo user
  const demoCookie = request.headers.get("cookie")?.match(/replog-demo-session=([^;]+)/)?.[1];
  if (!demoCookie) {
    return NextResponse.json({ error: "Not a demo session" }, { status: 403 });
  }

  try {
    const demoUser = await prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });
    if (!demoUser) {
      return NextResponse.json({ error: "Demo user not found" }, { status: 404 });
    }

    // Delete all demo data in order (respecting foreign keys)
    await prisma.voiceEntry.deleteMany({ where: { userId: demoUser.id } });
    await prisma.employee.deleteMany({ where: { adminId: demoUser.id } });
    await prisma.notionDatabaseConfig.deleteMany({ where: { userId: demoUser.id } });
    await prisma.notionConnection.deleteMany({ where: { userId: demoUser.id } });
    await prisma.usageEvent.deleteMany({ where: { userId: demoUser.id } });
    await prisma.user.delete({ where: { id: demoUser.id } });

    // Re-seed fresh
    const newUser = await getOrCreateDemoUser();

    const response = NextResponse.json({ success: true, message: "Demo reset complete" });

    // Update cookie with new user ID
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
