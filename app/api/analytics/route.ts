import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30", 10);

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: { notionDatabaseConfig: true },
  });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const now = new Date();
  const since = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const schema = dbUser.notionDatabaseConfig?.schemaSnapshotJson as any[] | null;
  const schemaKeys = (schema || []).map((col: any) => ({
    key: col.name.toLowerCase().replace(/\s+/g, "_"),
    name: col.name,
    type: col.type,
    options: col.options || [],
  }));

  const selectColumns = schemaKeys.filter(
    (c) => c.type === "select" || c.type === "multi_select"
  );

  const entries = await prisma.voiceEntry.findMany({
    where: { userId: dbUser.id, createdAt: { gte: since } },
    select: {
      id: true,
      extractedJson: true,
      status: true,
      employeeId: true,
      createdAt: true,
      employee: { select: { name: true, employeeCode: true } },
    },
  });

  const repMap = new Map<
    string,
    {
      name: string;
      code: string;
      totalCalls: number;
      filledEntries: number;
      followUps: number;
      stages: Record<string, Record<string, number>>;
    }
  >();

  for (const entry of entries) {
    const repId = entry.employeeId || "__admin__";
    const repName = entry.employee?.name || "Admin (You)";
    const repCode = entry.employee?.employeeCode || "—";

    if (!repMap.has(repId)) {
      const stageInit: Record<string, Record<string, number>> = {};
      for (const col of selectColumns) {
        stageInit[col.key] = {};
        for (const opt of col.options) {
          stageInit[col.key][opt] = 0;
        }
      }
      repMap.set(repId, {
        name: repName,
        code: repCode,
        totalCalls: 0,
        filledEntries: 0,
        followUps: 0,
        stages: stageInit,
      });
    }

    const rep = repMap.get(repId)!;
    rep.totalCalls++;

    const json = entry.extractedJson as Record<string, any> | null;
    if (!json) continue;

    const keys = schemaKeys.length > 0 ? schemaKeys.map((s) => s.key) : Object.keys(json);
    if (keys.length > 0) {
      let filled = 0;
      for (const k of keys) {
        const val = json[k]?.value ?? json[k];
        if (val !== undefined && val !== null && val !== "" && val !== 0) filled++;
      }
      if (filled / keys.length >= 0.8) rep.filledEntries++;
    }

    for (const key of Object.keys(json)) {
      if (key.match(/follow.?up|next.?date|due.?date/i)) {
        const val = json[key]?.value ?? json[key];
        if (val) { rep.followUps++; break; }
      }
    }

    for (const col of selectColumns) {
      const val = json[col.key]?.value ?? json[col.key];
      if (val && typeof val === "string") {
        if (!rep.stages[col.key]) rep.stages[col.key] = {};
        rep.stages[col.key][val] = (rep.stages[col.key][val] || 0) + 1;
      }
    }
  }

  const reps = Array.from(repMap.entries()).map(([id, r]) => ({
    id,
    name: r.name,
    code: r.code,
    totalCalls: r.totalCalls,
    fillRate: r.totalCalls > 0 ? Math.round((r.filledEntries / r.totalCalls) * 100) : 0,
    timeSaved: r.totalCalls * 8,
    followUps: r.followUps,
    stages: r.stages,
  }));

  reps.sort((a, b) => b.totalCalls - a.totalCalls);

  const totals = {
    totalCalls: entries.length,
    avgFillRate: reps.length > 0 ? Math.round(reps.reduce((s, r) => s + r.fillRate, 0) / reps.length) : 0,
    totalTimeSaved: entries.length * 8,
    totalFollowUps: reps.reduce((s, r) => s + r.followUps, 0),
  };

  const stageBreakdowns: Record<string, { label: string; counts: Record<string, number> }> = {};
  for (const col of selectColumns) {
    const counts: Record<string, number> = {};
    for (const opt of col.options) counts[opt] = 0;
    for (const r of reps) {
      for (const [val, cnt] of Object.entries(r.stages[col.key] || {})) {
        counts[val] = (counts[val] || 0) + cnt;
      }
    }
    stageBreakdowns[col.key] = { label: col.name, counts };
  }

  return NextResponse.json({
    reps,
    totals,
    selectColumns: selectColumns.map((c) => ({ key: c.key, name: c.name, options: c.options })),
    stageBreakdowns,
    days,
  });
}
