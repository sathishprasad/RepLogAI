"use client";

import { useEffect, useState } from "react";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { ArrowRight, Clock, CheckCircle2, XCircle, FileAudio, AlertTriangle, Loader2, Bot, Copy, Check, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const statusConfig = {
  SYNCED: { label: "Synced", color: "bg-green-50 text-green-700", icon: CheckCircle2 },
  PENDING_APPROVAL: { label: "Pending", color: "bg-amber-50 text-amber-700", icon: Clock },
  FAILED: { label: "Failed", color: "bg-red-50 text-red-700", icon: XCircle },
  RECORDING: { label: "Recording", color: "bg-blue-50 text-blue-700", icon: FileAudio },
  TRANSCRIBING: { label: "Transcribing", color: "bg-purple-50 text-purple-700", icon: FileAudio },
  EXTRACTING: { label: "Extracting", color: "bg-indigo-50 text-indigo-700", icon: FileAudio },
  APPROVED: { label: "Approved", color: "bg-green-50 text-green-600", icon: CheckCircle2 },
  CANCELED: { label: "Canceled", color: "bg-gray-50 text-gray-500", icon: XCircle },
};

interface RepStat {
  id: string;
  name: string;
  employeeCode: string;
  linked: boolean;
  entries: number;
}

interface ChartDay {
  date: string;
  label: string;
  timeSaved: number;
}

interface DashboardData {
  user: { name: string; email: string; avatarUrl: string | null };
  stats: { totalEntries: number; thisMonth: number; synced: number; failed: number };
  kpi: { logsThisWeek: number; crmFillRate: number; timeSavedMins: number; followUpsDueToday: number };
  chartData: ChartDay[];
  telegram: { companyCode: string; companyName: string; totalReps: number; linkedReps: number; repStats: RepStat[] };
  recentEntries: { id: string; title: string; status: string; date: string; database: string; source?: string; repName?: string | null }[];
  hasNotion: boolean;
  hasDatabase: boolean;
  onboardingComplete: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (res.status === 401) { router.push("/auth"); return; }
        if (!res.ok) { const err = await res.json(); setError(err.error || "Failed to load"); return; }
        const json = await res.json();
        if (!json.onboardingComplete) { router.push("/onboarding"); return; }
        setData(json);
      } catch (err: any) { setError(err.message || "Network error"); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [router]);

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  if (error) return (
    <div className="max-w-lg mx-auto text-center py-24 space-y-4">
      <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
      <h2 className="text-xl font-bold text-text-primary">Something went wrong</h2>
      <p className="text-muted-text">{error}</p>
      <button onClick={() => window.location.reload()} className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold text-sm">Retry</button>
    </div>
  );
  if (!data) return null;

  const formatRelativeDate = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const deepLink = data.telegram.companyCode ? `https://t.me/RepLogAIBot?start=${data.telegram.companyCode}` : "";

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {data.user.name ? `Welcome back, ${data.user.name.split(" ")[0]}` : "Dashboard"}
          </h1>
          <p className="text-muted-text mt-1">Your voice-to-CRM command center</p>
        </div>
        {deepLink && (
          <button
            onClick={() => { navigator.clipboard.writeText(deepLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-full px-6 py-3 font-semibold transition-all shadow-[0_4px_14px_0_rgba(79,124,255,0.39)]"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copied ? "Copied!" : "Copy Bot Link"}
          </button>
        )}
      </div>

      {!data.hasNotion && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800">Notion not connected</p>
              <p className="text-xs text-amber-600">Connect Notion to start syncing voice entries</p>
            </div>
          </div>
          <Link href="/onboarding?step=connect" className="px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm">Connect Now</Link>
        </div>
      )}

      <OverviewCards kpi={data.kpi} />

      {/* Time Saved — Cumulative Line Chart */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="text-lg font-bold text-text-primary mb-1">Time Saved</h2>
        <p className="text-sm text-muted-text mb-6">Cumulative minutes saved vs manual CRM entry (last 14 days)</p>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.chartData}>
              <defs>
                <linearGradient id="timeSavedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F7CFF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4F7CFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tickFormatter={(v: number) => v >= 60 ? `${Math.floor(v / 60)}h` : `${v}m`}
              />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                formatter={(value: number) => {
                  const h = Math.floor(value / 60);
                  const m = value % 60;
                  return [h > 0 ? `${h}h ${m}m` : `${m}m`, "Time Saved"];
                }}
              />
              <Area
                type="monotone"
                dataKey="timeSaved"
                stroke="#4F7CFF"
                strokeWidth={2.5}
                fill="url(#timeSavedGradient)"
                dot={{ r: 3, fill: "#4F7CFF", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#4F7CFF", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Telegram & Rep Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary">Telegram Bot</h3>
              <p className="text-xs text-muted-text">@RepLogAIBot</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-bg-light rounded-xl text-center">
              <p className="text-2xl font-bold text-text-primary">{data.telegram.totalReps}</p>
              <p className="text-xs text-muted-text">Total Reps</p>
            </div>
            <div className="p-3 bg-bg-light rounded-xl text-center">
              <p className="text-2xl font-bold text-green-600">{data.telegram.linkedReps}</p>
              <p className="text-xs text-muted-text">Linked via Telegram</p>
            </div>
          </div>
          {deepLink && (
            <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/10">
              <p className="text-xs text-muted-text mb-1">Share with reps:</p>
              <code className="text-xs font-mono text-primary break-all">{deepLink}</code>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-bold text-text-primary">Rep Activity</h3>
            </div>
            <Link href="/dashboard/settings" className="text-xs text-primary font-medium">Manage</Link>
          </div>
          {data.telegram.repStats.length === 0 ? (
            <div className="text-center py-6 text-muted-text">
              <p className="text-sm">No reps added yet</p>
              <Link href="/dashboard/settings" className="text-xs text-primary mt-1 inline-block">Add employees →</Link>
            </div>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {data.telegram.repStats.sort((a, b) => b.entries - a.entries).map((rep) => (
                <div key={rep.id} className="flex items-center justify-between p-2.5 bg-bg-light rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("w-2 h-2 rounded-full", rep.linked ? "bg-green-500" : "bg-gray-300")} />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{rep.name}</p>
                      <p className="text-xs text-muted-text font-mono">{rep.employeeCode}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-text-primary">{rep.entries}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-white rounded-2xl border border-border">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">Recent Entries</h2>
          <Link href="/dashboard/history" className="text-sm text-primary hover:text-primary-hover font-medium inline-flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {data.recentEntries.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-text">
            <FileAudio className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No entries yet</p>
            <p className="text-sm mt-1">Share the bot link with your reps to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.recentEntries.map((entry) => {
              const config = statusConfig[entry.status as keyof typeof statusConfig] || statusConfig.SYNCED;
              const StatusIcon = config.icon;
              return (
                <Link
                  key={entry.id}
                  href={`/dashboard/history/${entry.id}`}
                  className="flex items-center justify-between p-4 px-6 hover:bg-bg-light transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileAudio className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{entry.title}</p>
                      <p className="text-xs text-muted-text mt-0.5">
                        {entry.repName ? `${entry.repName} · ` : ""}{entry.database} · {formatRelativeDate(entry.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.source === "TELEGRAM" && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">TG</span>
                    )}
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {config.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/integrations" className="bg-white rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0B0F17] flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-text-primary group-hover:text-primary transition-colors">Manage Integrations</p>
              <p className="text-sm text-muted-text">Connect Notion, CRMs, and more</p>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/settings" className="bg-white rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-text-primary group-hover:text-primary transition-colors">Settings</p>
              <p className="text-sm text-muted-text">Telegram, employees, billing</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
