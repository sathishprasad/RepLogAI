"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, Search, Download, Calendar, X, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

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
  from: string;
  to: string;
  plan: "FREE" | "PRO";
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
  const [search, setSearch] = useState("");
  const [preset, setPreset] = useState<"14d" | "custom">("14d");
  const [fromDate, setFromDate] = useState(() => format(subDays(new Date(), 13), "yyyy-MM-dd"));
  const [toDate, setToDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedRep, setSelectedRep] = useState("all");
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setIsDemo(document.cookie.includes("replog-demo-mode=true"));
  }, []);

  const fetchData = async (from: string, to: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?from=${from}&to=${to}`);
      if (res.status === 401) { router.push("/auth"); return; }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (preset === "14d") {
      const from = format(subDays(new Date(), 13), "yyyy-MM-dd");
      const to = format(new Date(), "yyyy-MM-dd");
      setFromDate(from);
      setToDate(to);
      fetchData(from, to);
    } else {
      fetchData(fromDate, toDate);
    }
  }, [preset]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyCustomRange = () => {
    setPreset("custom");
    setShowDatePicker(false);
    fetchData(fromDate, toDate);
  };

  const allRepNames = data?.reps.map((r) => r.name) || [];

  const filteredReps = data?.reps.filter((r) => {
    const matchesSearch = search === "" ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase());
    const matchesRep = selectedRep === "all" || r.name === selectedRep;
    return matchesSearch && matchesRep;
  }) || [];

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
      const base: (string | number)[] = [r.name, r.code, r.totalCalls, r.fillRate, r.timeSaved, r.followUps];
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
    a.download = `analytics_${fromDate}_${toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  if (!data) return null;

  const isFree = data.plan === "FREE" && !isDemo;

  const stageKPIs: { colName: string; option: string; count: number; total: number; color: string }[] = [];
  const kpiColors = [
    "bg-primary/10 text-primary",
    "bg-emerald-50 text-emerald-600",
    "bg-violet-50 text-violet-600",
    "bg-amber-50 text-amber-600",
    "bg-rose-50 text-rose-600",
    "bg-cyan-50 text-cyan-600",
    "bg-indigo-50 text-indigo-600",
    "bg-teal-50 text-teal-600",
  ];
  let colorIdx = 0;
  for (const [, breakdown] of Object.entries(data.stageBreakdowns)) {
    const total = Object.values(breakdown.counts).reduce((s, c) => s + c, 0);
    for (const [opt, count] of Object.entries(breakdown.counts)) {
      stageKPIs.push({
        colName: breakdown.label,
        option: opt,
        count,
        total,
        color: kpiColors[colorIdx % kpiColors.length],
      });
      colorIdx++;
    }
  }

  const dateLabel = preset === "14d"
    ? "Last 14 days"
    : `${format(new Date(fromDate), "MMM d")} — ${format(new Date(toDate), "MMM d, yyyy")}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
            <span className="px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-primary to-purple-500 text-white rounded-full">PRO</span>
          </div>
          <p className="text-muted-text mt-1">Rep performance and pipeline breakdown — included with Pro & Scale plans</p>
        </div>
        <p className="text-sm text-muted-text mt-1">{dateLabel}</p>
      </div>

      {isFree && (
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-text-primary">Unlock Full Analytics</h3>
            <p className="text-sm text-muted-text mt-1">Upgrade to Pro to access all KPIs, full rep data, and CSV exports.</p>
          </div>
          <a href="/dashboard/settings#pricing" onClick={(e) => { e.preventDefault(); router.push("/dashboard/settings#pricing"); }} className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-all shadow-[0_4px_14px_0_rgba(79,124,255,0.39)] hover:scale-105">
            Upgrade to Pro
          </a>
        </div>
      )}

      {/* Company-Specific KPIs from Notion Schema */}
      <div className="relative">
        {isFree && (
          <div className="absolute inset-0 z-10 backdrop-blur-[6px] bg-white/40 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-bold text-text-primary">Pro Feature</p>
              <p className="text-sm text-muted-text">Pipeline KPIs are available on the Pro plan</p>
            </div>
          </div>
        )}
        {stageKPIs.length > 0 ? (
          <div>
            <p className="text-xs font-semibold text-muted-text uppercase tracking-wider mb-3">Pipeline Breakdown</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {stageKPIs.map((kpi, i) => (
                <div key={i} className="bg-white rounded-2xl border border-border p-4 hover:shadow-sm transition-shadow">
                  <div className={cn("inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide mb-2", kpi.color)}>
                    {kpi.colName}
                  </div>
                  <p className="text-2xl font-bold text-text-primary">{kpi.count}</p>
                  <p className="text-sm text-muted-text">{kpi.option}</p>
                  {kpi.total > 0 && (
                    <div className="mt-2">
                      <div className="w-full h-1.5 bg-bg-light rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${Math.round((kpi.count / kpi.total) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-primary font-medium mt-1">
                        {Math.round((kpi.count / kpi.total) * 100)}%
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border p-8 text-center">
            <p className="text-muted-text text-sm">No pipeline data yet. KPIs will appear automatically based on your Notion database select/multi-select columns.</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-border p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Filter */}
          <div className="relative" ref={datePickerRef}>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPreset("14d")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  preset === "14d"
                    ? "bg-primary text-white"
                    : "bg-bg-light text-muted-text hover:text-text-primary"
                )}
              >
                Last 14 days
              </button>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5",
                  preset === "custom"
                    ? "bg-primary text-white"
                    : "bg-bg-light text-muted-text hover:text-text-primary"
                )}
              >
                <Calendar className="w-3.5 h-3.5" />
                {preset === "custom" ? dateLabel : "Custom Range"}
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {showDatePicker && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-xl border border-border shadow-lg p-4 z-50 min-w-[300px]">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-text block mb-1">From</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      max={toDate}
                      className="w-full px-3 py-2 bg-bg-light rounded-lg text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-text block mb-1">To</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      min={fromDate}
                      max={format(new Date(), "yyyy-MM-dd")}
                      className="w-full px-3 py-2 bg-bg-light rounded-lg text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <button
                    onClick={applyCustomRange}
                    className="w-full px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          <select
            value={selectedRep}
            onChange={(e) => setSelectedRep(e.target.value)}
            className="px-3 py-2 bg-bg-light rounded-lg text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Reps</option>
            {allRepNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

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
            onClick={isFree ? undefined : exportCSV}
            disabled={isFree}
            title={isFree ? "Upgrade to Pro to export data" : undefined}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isFree
                ? "bg-bg-light text-muted-text cursor-not-allowed opacity-50"
                : "bg-bg-light text-text-primary hover:bg-border"
            )}
          >
            <Download className="w-4 h-4" />
            {isFree ? "Pro Only" : "Export CSV"}
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
                filteredReps.map((rep, rowIdx) => (
                  <tr key={rep.id} className={cn("hover:bg-bg-light/50 transition-colors", isFree && rowIdx > 0 && "blur-[5px] select-none pointer-events-none")}>
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
              <tfoot className={cn(isFree && "blur-[5px] select-none pointer-events-none")}>
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
