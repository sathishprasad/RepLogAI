"use client";

import { OverviewCards } from "@/components/dashboard/overview-cards";
import { Mic, ArrowRight, Clock, CheckCircle2, XCircle, FileAudio } from "lucide-react";
import Link from "next/link";

const recentEntries = [
  { id: "1", title: "Call with Acme Corp", status: "SYNCED" as const, date: "2 hours ago", database: "Sales Pipeline" },
  { id: "2", title: "Demo with StartupX", status: "PENDING_APPROVAL" as const, date: "5 hours ago", database: "Sales Pipeline" },
  { id: "3", title: "Follow-up: Enterprise Deal", status: "FAILED" as const, date: "1 day ago", database: "Sales Pipeline" },
  { id: "4", title: "Quarterly review prep", status: "SYNCED" as const, date: "2 days ago", database: "Meeting Notes" },
];

const statusConfig = {
  SYNCED: { label: "Synced", color: "bg-green-50 text-green-700", icon: CheckCircle2 },
  PENDING_APPROVAL: { label: "Pending", color: "bg-amber-50 text-amber-700", icon: Clock },
  FAILED: { label: "Failed", color: "bg-red-50 text-red-700", icon: XCircle },
  RECORDING: { label: "Recording", color: "bg-blue-50 text-blue-700", icon: FileAudio },
};

export default function DashboardPage() {
  const stats = { totalEntries: 47, thisMonth: 12, synced: 42, failed: 2 };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-muted-text mt-1">Your voice-to-CRM command center</p>
        </div>
        <Link
          href="/dashboard/capture"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-full px-6 py-3 font-semibold transition-all shadow-[0_4px_14px_0_rgba(79,124,255,0.39)] hover:shadow-[0_6px_20px_rgba(79,124,255,0.23)]"
        >
          <Mic className="w-5 h-5" />
          Record New
        </Link>
      </div>

      {/* Stats */}
      <OverviewCards stats={stats} />

      {/* Recent Entries */}
      <div className="bg-white rounded-2xl border border-border">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">Recent Entries</h2>
          <Link
            href="/dashboard/history"
            className="text-sm text-primary hover:text-primary-hover font-medium inline-flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentEntries.map((entry) => {
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
                    <p className="text-xs text-muted-text mt-0.5">{entry.database} · {entry.date}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.color}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {config.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/integrations"
          className="bg-white rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-md transition-all group"
        >
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
        <Link
          href="/dashboard/settings"
          className="bg-white rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-text-primary group-hover:text-primary transition-colors">Settings</p>
              <p className="text-sm text-muted-text">Database mapping, account, billing</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
