"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, Phone, BarChart3, Clock, CalendarCheck, Search, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PERIOD_OPTIONS = [
  { label: "Last 14 days", value: 14 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 60 days", value: 60 },
  { label: "Last 90 days", value: 90 },
];

interface RepRow {
  id: string;
  name: string;
  code: string;
  totalCalls: number;
  fillRate: number;
  timeSaved: number;
  followUps: number;
  stages: Record<string, Record<string, number>>;
}

interface SelectCol {
  key: string;
  name: string;
  options: string[];
}

interface AnalyticsData {
  reps: RepRow[];
  totals: { totalCalls: number; avgFillRate: number; totalTimeSaved: number; totalFollowUps: number };
  selectColumns: SelectCol[];
  stageBreakdowns: Record<string, { label: string; counts: Record<string, number> }>;
  days: number;
}

function formatTime(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [search, setSearch] = useState("");

  const fetchData = async (d: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?days=${d}`);
      if (res.status === 401) { router.push("/auth"); return; }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(days); }, [days]);

  const filteredReps = data?.reps.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.code.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const exportCSV = () => {
    if (!data) return;
    const stCols = data.selectColumns;
    const headers = ["Rep Name", "Employee ID", "Total Calls", "Fill Rate %", "Time Saved (min)", "Follow-ups"];
    for (const col of stCols) {
      for (const opt of col.options) {
        headers.push(`${col.name}: ${opt}`);
      }
    }
    const rows = filteredReps.map((r) => {
      const base = [r.name, r.code, r.totalCalls, r.fillRate, r.timeSaved, r.followUps];
      for (const col of stCols) {
        for (const opt of col.options) {
          base.push(r.stages[col.key]?.[opt] || 0);
        }
      }
      return base;
    });
    const csv = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_${days}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  if (!data) return null;

  const topStageKPIs: { label: string; value: number; total: number }[] = [];
  for (const [, breakdown] of Object.entries(data.stageBreakdowns)) {
    const total = Object.values(breakdown.counts).reduce((s, c) => s + c, 0);
    for (const [opt, count] of Object.entries(breakdown.counts)) {
      if (count > 0) {
        topStageKPIs.push({ label: opt, value: count, total });
      }
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
        <p className="text-muted-text mt-1">Rep performance and pipeline breakdown</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <Phone className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-text-primary">{data.totals.totalCalls}</p>
          <p className="text-sm text-muted-text">Total Calls</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-text-primary">{data.totals.avgFillRate}%</p>
          <p className="text-sm text-muted-text">Avg Fill Rate</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
            <Clock className="w-4 h-4 text-violet-600" />
          </div>
          <p className="text-2xl font-bold text-text-primary">{formatTime(data.totals.totalTimeSaved)}</p>
          <p className="text-sm text-muted-text">Total Time Saved</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
            <CalendarCheck className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-text-primary">{data.totals.totalFollowUps}</p>
          <p className="text-sm text-muted-text">Follow-ups Scheduled</p>
        </div>
      </div>

      {/* Stage Breakdown KPIs */}
      {topStageKPIs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {topStageKPIs.map((kpi, i) => (
            <div key={i} className="bg-white rounded-xl border border-border p-4">
              <p className="text-lg font-bold text-text-primary">{kpi.value}</p>
              <p className="text-xs text-muted-text">{kpi.label}</p>
              {kpi.total > 0 && (
                <p className="text-xs text-primary font-medium mt-1">
                  {Math.round((kpi.value / kpi.total) * 100)}%
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-border p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1.5">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  days === opt.value
                    ? "bg-primary text-white"
                    : "bg-bg-light text-muted-text hover:text-text-primary"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
            <input
              type="text"
              placeholder="Search reps..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-light rounded-lg text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-light text-sm font-medium text-text-primary hover:bg-border transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Rep Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-bg-light/50">
                <th className="text-left text-xs font-semibold text-muted-text px-4 py-3">Rep</th>
                <th className="text-center text-xs font-semibold text-muted-text px-3 py-3">Calls</th>
                <th className="text-center text-xs font-semibold text-muted-text px-3 py-3">Fill Rate</th>
                <th className="text-center text-xs font-semibold text-muted-text px-3 py-3">Time Saved</th>
                <th className="text-center text-xs font-semibold text-muted-text px-3 py-3">Follow-ups</th>
                {data.selectColumns.map((col) =>
                  col.options.map((opt) => (
                    <th key={`${col.key}-${opt}`} className="text-center text-xs font-semibold text-muted-text px-3 py-3 whitespace-nowrap">
                      {opt}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredReps.length === 0 ? (
                <tr>
                  <td colSpan={99} className="text-center py-12 text-muted-text text-sm">
                    No data for this period
                  </td>
                </tr>
              ) : (
                filteredReps.map((rep) => (
                  <tr key={rep.id} className="hover:bg-bg-light/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-text-primary">{rep.name}</p>
                      <p className="text-xs text-muted-text font-mono">{rep.code}</p>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className="text-sm font-bold text-text-primary">{rep.totalCalls}</span>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className={cn(
                        "text-sm font-semibold",
                        rep.fillRate >= 80 ? "text-emerald-600" :
                        rep.fillRate >= 50 ? "text-amber-600" : "text-red-500"
                      )}>
                        {rep.fillRate}%
                      </span>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className="text-sm text-text-primary">{formatTime(rep.timeSaved)}</span>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className="text-sm text-text-primary">{rep.followUps}</span>
                    </td>
                    {data.selectColumns.map((col) =>
                      col.options.map((opt) => (
                        <td key={`${rep.id}-${col.key}-${opt}`} className="text-center px-3 py-3">
                          <span className="text-sm text-text-primary">
                            {rep.stages[col.key]?.[opt] || 0}
                          </span>
                        </td>
                      ))
                    )}
                  </tr>
                ))
              )}
            </tbody>
            {filteredReps.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-border bg-bg-light/30">
                  <td className="px-4 py-3 text-sm font-bold text-text-primary">Total</td>
                  <td className="text-center px-3 py-3 text-sm font-bold text-text-primary">
                    {filteredReps.reduce((s, r) => s + r.totalCalls, 0)}
                  </td>
                  <td className="text-center px-3 py-3 text-sm font-bold text-text-primary">
                    {filteredReps.length > 0
                      ? Math.round(filteredReps.reduce((s, r) => s + r.fillRate, 0) / filteredReps.length)
                      : 0}%
                  </td>
                  <td className="text-center px-3 py-3 text-sm font-bold text-text-primary">
                    {formatTime(filteredReps.reduce((s, r) => s + r.timeSaved, 0))}
                  </td>
                  <td className="text-center px-3 py-3 text-sm font-bold text-text-primary">
                    {filteredReps.reduce((s, r) => s + r.followUps, 0)}
                  </td>
                  {data.selectColumns.map((col) =>
                    col.options.map((opt) => (
                      <td key={`total-${col.key}-${opt}`} className="text-center px-3 py-3 text-sm font-bold text-text-primary">
                        {filteredReps.reduce((s, r) => s + (r.stages[col.key]?.[opt] || 0), 0)}
                      </td>
                    ))
                  )}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
