"use client";

import { Mic, BarChart3, Clock, CalendarCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
}

function StatCard({ title, value, subtitle, icon, iconBg }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg)}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-sm text-muted-text mt-1">{title}</p>
      <p className="text-xs text-muted-text mt-2">{subtitle}</p>
    </div>
  );
}

interface KpiData {
  logsThisWeek: number;
  crmFillRate: number;
  timeSavedMins: number;
  followUpsDueToday: number;
  avgTimeSavedPerRep: number;
}

export function OverviewCards({ kpi }: { kpi: KpiData }) {
  const hours = Math.floor(kpi.timeSavedMins / 60);
  const mins = kpi.timeSavedMins % 60;
  const timeSaved = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const avgH = Math.floor(kpi.avgTimeSavedPerRep / 60);
  const avgM = kpi.avgTimeSavedPerRep % 60;
  const avgTimeSaved = avgH > 0 ? `${avgH}h ${avgM}m` : `${avgM}m`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Logs This Week"
        value={kpi.logsThisWeek.toString()}
        subtitle="Voice notes submitted this week"
        icon={<Mic className="w-5 h-5 text-primary" />}
        iconBg="bg-primary/10"
      />
      <StatCard
        title="CRM Fill Rate"
        value={`${kpi.crmFillRate}%`}
        subtitle="Logs with ≥80% fields auto-filled"
        icon={<BarChart3 className="w-5 h-5 text-emerald-600" />}
        iconBg="bg-emerald-50"
      />
      <StatCard
        title="Avg Time Saved / Rep"
        value={avgTimeSaved}
        subtitle="Per rep in the last 14 days"
        icon={<Users className="w-5 h-5 text-violet-600" />}
        iconBg="bg-violet-50"
      />
      <StatCard
        title="Follow-ups Due Today"
        value={kpi.followUpsDueToday.toString()}
        subtitle="Actions extracted from voice logs"
        icon={<CalendarCheck className="w-5 h-5 text-amber-600" />}
        iconBg="bg-amber-50"
      />
    </div>
  );
}
