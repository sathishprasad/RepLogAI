import { NextResponse } from "next/server";
import { cleanupExpiredDemoUsers } from "@/lib/demo";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Simple auth via secret header (for Vercel cron or manual trigger)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cleaned = await cleanupExpiredDemoUsers();
    return NextResponse.json({ success: true, cleaned });
  } catch (err) {
    console.error("Demo cleanup error:", err);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
