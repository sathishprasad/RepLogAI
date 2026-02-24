import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: {
      notionConnection: true,
      notionDatabaseConfig: true,
    },
  });

  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalEntries = await prisma.voiceEntry.count({ where: { userId: dbUser.id } });
  const thisMonth = await prisma.voiceEntry.count({
    where: { userId: dbUser.id, createdAt: { gte: startOfMonth } },
  });
  const synced = await prisma.voiceEntry.count({
    where: { userId: dbUser.id, status: "SYNCED" },
  });
  const failed = await prisma.voiceEntry.count({
    where: { userId: dbUser.id, status: "FAILED" },
  });

  const recentEntries = await prisma.voiceEntry.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      meetingType: true,
      status: true,
      createdAt: true,
      databaseId: true,
      transcriptText: true,
      extractedJson: true,
    },
  });

  const entries = recentEntries.map((e) => {
    const extracted = e.extractedJson as any;
    const title = extracted?.account?.value || extracted?.summary?.value || `${e.meetingType || "Voice"} Entry`;
    return {
      id: e.id,
      title,
      status: e.status,
      date: e.createdAt.toISOString(),
      database: dbUser.notionDatabaseConfig?.databaseName || "Not configured",
    };
  });

  return NextResponse.json({
    user: { name: dbUser.name, email: dbUser.email, avatarUrl: dbUser.avatarUrl },
    stats: { totalEntries, thisMonth, synced, failed },
    recentEntries: entries,
    hasNotion: !!dbUser.notionConnection,
    hasDatabase: !!dbUser.notionDatabaseConfig,
    onboardingComplete: dbUser.onboardingComplete,
  });
}
