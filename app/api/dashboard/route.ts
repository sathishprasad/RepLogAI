import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { nowEST, todayEST, toEST, startOfDayEST, endOfDayEST, daysAgoEST } from "@/lib/date-utils";
import { getAuthenticatedUser } from "@/lib/demo";
export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: auth.user.id },
    include: {
      notionConnection: true,
      notionDatabaseConfig: true,
    },
  });

  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const estNow = nowEST();
  const estToday = todayEST();
  const startOfMonth = startOfDayEST(`${estNow.getFullYear()}-${String(estNow.getMonth() + 1).padStart(2, "0")}-01`);

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

  const dayOfWeek = estNow.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const mondayDate = new Date(estNow);
  mondayDate.setDate(estNow.getDate() - mondayOffset);
  const mondayStr = `${mondayDate.getFullYear()}-${String(mondayDate.getMonth() + 1).padStart(2, "0")}-${String(mondayDate.getDate()).padStart(2, "0")}`;
  const startOfWeek = startOfDayEST(mondayStr);

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

  const firstEntry = await prisma.voiceEntry.findFirst({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });
  const firstDateStr = firstEntry ? toEST(firstEntry.createdAt) : estToday;
  const firstDate = startOfDayEST(firstDateStr);
  const fourteenDaysAgo = startOfDayEST(daysAgoEST(14));
  const windowStart = firstDate.getTime() > fourteenDaysAgo.getTime() ? firstDate : fourteenDaysAgo;

  const windowEntries = await prisma.voiceEntry.findMany({
    where: { userId: dbUser.id, createdAt: { gte: windowStart } },
    select: { employeeId: true },
  });
  const repSet = new Set<string>();
  for (const e of windowEntries) {
    if (e.employeeId) repSet.add(e.employeeId);
  }
  const repCount = repSet.size;
  const avgTimeSavedPerRep = repCount > 0 ? Math.round((windowEntries.length * 8) / repCount) : 0;

  let followUpsDueToday = 0;
  for (const entry of allEntries) {
    const json = entry.extractedJson as Record<string, any> | null;
    if (!json) continue;
    for (const key of Object.keys(json)) {
      if (!key.match(/follow.?up|next.?date|due.?date/i)) continue;
      const val = json[key]?.value ?? json[key];
      if (!val) continue;
      if (String(val).slice(0, 10) === estToday) { followUpsDueToday++; break; }
    }
  }

  const chartStartDate = startOfDayEST(firstDateStr);
  const todayDate = startOfDayEST(estToday);
  const daySpan = Math.max(1, Math.floor((todayDate.getTime() - chartStartDate.getTime()) / 86400000) + 1);

  const chartEntries = await prisma.voiceEntry.findMany({
    where: { userId: dbUser.id, createdAt: { gte: chartStartDate } },
    select: { createdAt: true },
  });

  const chartData: { date: string; label: string; timeSaved: number }[] = [];
  let cumulative = 0;

  for (let i = 0; i < daySpan; i++) {
    const d = new Date(chartStartDate.getTime() + i * 86400000);
    const dateStr = toEST(d);
    const label = new Date(`${dateStr}T12:00:00-05:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

    let dayLogs = 0;
    for (const e of chartEntries) {
      if (toEST(e.createdAt) === dateStr) dayLogs++;
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
