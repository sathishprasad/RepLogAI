import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: { notionDatabaseConfig: true },
  });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const entries = await prisma.voiceEntry.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { employee: true },
  });

  const formatted = entries.map((e) => {
    const extracted = e.extractedJson as any;
    const title = extracted?.account?.value || extracted?.summary?.value || `${e.meetingType || "Voice"} Entry`;
    return {
      id: e.id,
      title,
      status: e.status,
      database: dbUser.notionDatabaseConfig?.databaseName || "Not configured",
      meetingType: e.meetingType || "Call",
      duration: Math.round(e.audioDurationSecs || 0),
      createdAt: e.createdAt.toISOString(),
      source: e.source,
      repName: e.employee?.name || null,
    };
  });

  return NextResponse.json({ entries: formatted });
}
