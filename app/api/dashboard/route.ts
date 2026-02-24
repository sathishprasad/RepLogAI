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

  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset);
  startOfWeek.setHours(0, 0, 0, 0);

  const logsThisWeek = await prisma.voiceEntry.count({
    where: { userId: dbUser.id, createdAt: { gte: startOfWeek } },
  });

  const allEntries = await prisma.voiceEntry.findMany({
    where: { userId: dbUser.id },
    select: { extractedJson: true, createdAt: true, status: true },
  });

  const schemaSnapshot = dbUser.notionDatabaseConfig?.schemaSnapshotJson as any[] | null;
  const schemaKeys = (schemaSnapshot || []).map((col: any) =>
    col.name.toLowerCase().replace(/\s+/g, "_")
  );

  let filledCount = 0;
  for (const entry of allEntries) {
    const json = entry.extractedJson as Record<string, any> | null;
    if (!json) continue;
    const keys = schemaKeys.length > 0 ? schemaKeys : Object.keys(json);
    if (keys.length === 0) continue;
    let filled = 0;
    for (const k of keys) {
      const val = json[k]?.value ?? json[k];
      if (val !== undefined && val !== null && val !== "" && val !== 0) filled++;
    }
    const ratio = filled / keys.length;
    if (ratio >= 0.8) filledCount++;
  }
  const crmFillRate = allEntries.length > 0 ? Math.round((filledCount / allEntries.length) * 100) : 0;

  const timeSavedMins = totalEntries * 8;

  const firstEntryForWindow = await prisma.voiceEntry.findFirst({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  todayMidnight.setHours(0, 0, 0, 0);
  const minDate = firstEntryForWindow
    ? new Date(firstEntryForWindow.createdAt.getFullYear(), firstEntryForWindow.createdAt.getMonth(), firstEntryForWindow.createdAt.getDate())
    : todayMidnight;
  minDate.setHours(0, 0, 0, 0);
  const fourteenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);
  fourteenDaysAgo.setHours(0, 0, 0, 0);
  const windowStart = minDate.getTime() > fourteenDaysAgo.getTime() ? minDate : fourteenDaysAgo;

  const windowEntries = await prisma.voiceEntry.findMany({
    where: { userId: dbUser.id, createdAt: { gte: windowStart } },
    select: { employeeId: true },
  });
  const repSet = new Set<string>();
  for (const e of windowEntries) {
    if (e.employeeId) repSet.add(e.employeeId);
  }
  const repCount = repSet.size;
  const totalWindowLogs = windowEntries.length;
  const avgTimeSavedPerRep = repCount > 0 ? Math.round((totalWindowLogs * 8) / repCount) : 0;

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  todayStart.setHours(0, 0, 0, 0);
  const todayStr = todayStart.toISOString().slice(0, 10);

  let followUpsDueToday = 0;
  for (const entry of allEntries) {
    const json = entry.extractedJson as Record<string, any> | null;
    if (!json) continue;
    for (const key of Object.keys(json)) {
      if (!key.match(/follow.?up|next.?date|due.?date/i)) continue;
      const val = json[key]?.value ?? json[key];
      if (!val) continue;
      if (String(val).slice(0, 10) === todayStr) { followUpsDueToday++; break; }
    }
  }

  const firstEntry = await prisma.voiceEntry.findFirst({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  today.setHours(0, 0, 0, 0);

  const chartStartDate = firstEntry
    ? new Date(firstEntry.createdAt.getFullYear(), firstEntry.createdAt.getMonth(), firstEntry.createdAt.getDate())
    : today;
  chartStartDate.setHours(0, 0, 0, 0);

  const daySpan = Math.max(1, Math.floor((today.getTime() - chartStartDate.getTime()) / 86400000) + 1);

  const chartEntries = await prisma.voiceEntry.findMany({
    where: { userId: dbUser.id, createdAt: { gte: chartStartDate } },
    select: { createdAt: true },
  });

  const chartData: { date: string; label: string; timeSaved: number }[] = [];
  let cumulative = 0;

  for (let i = 0; i < daySpan; i++) {
    const d = new Date(chartStartDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    let dayLogs = 0;
    for (const e of chartEntries) {
      if (e.createdAt.toISOString().slice(0, 10) === dateStr) dayLogs++;
    }
    cumulative += dayLogs * 8;
    chartData.push({ date: dateStr, label, timeSaved: cumulative });
  }

  const employees = await prisma.employee.findMany({
    where: { adminId: dbUser.id },
    include: { _count: { select: { voiceEntries: true } } },
  });

  const linkedReps = employees.filter(e => e.telegramChatId).length;
  const repStats = employees.map(e => ({
    id: e.id,
    name: e.name,
    employeeCode: e.employeeCode,
    linked: !!e.telegramChatId,
    entries: e._count.voiceEntries,
  }));

  const recentEntries = await prisma.voiceEntry.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { employee: true },
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
      source: e.source,
      repName: e.employee?.name || null,
    };
  });

  return NextResponse.json({
    user: { name: dbUser.name, email: dbUser.email, avatarUrl: dbUser.avatarUrl },
    stats: { totalEntries, thisMonth, synced, failed },
    kpi: { logsThisWeek, crmFillRate, timeSavedMins, followUpsDueToday, avgTimeSavedPerRep },
    chartData,
    telegram: {
      companyCode: dbUser.companyCode || "",
      companyName: dbUser.companyName || "",
      totalReps: employees.length,
      linkedReps,
      repStats,
    },
    recentEntries: entries,
    hasNotion: !!dbUser.notionConnection,
    hasDatabase: !!dbUser.notionDatabaseConfig,
    onboardingComplete: dbUser.onboardingComplete,
  });
}
