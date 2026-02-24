"use client";

import { Mic, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({ title, value, subtitle, icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full",
              trendUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
            )}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-sm text-muted-text mt-1">{title}</p>
      <p className="text-xs text-muted-text mt-2">{subtitle}</p>
    </div>
  );
}

interface OverviewCardsProps {
  stats: {
    totalEntries: number;
    thisMonth: number;
    synced: number;
    failed: number;
  };
}

export function OverviewCards({ stats }: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Entries"
        value={stats.totalEntries.toString()}
        subtitle="All time voice logs"
        icon={<Mic className="w-5 h-5 text-primary" />}
        trend="+12%"
        trendUp
      />
      <StatCard
        title="This Month"
        value={stats.thisMonth.toString()}
        subtitle="Entries this billing cycle"
        icon={<TrendingUp className="w-5 h-5 text-primary" />}
      />
      <StatCard
        title="Synced to Notion"
        value={stats.synced.toString()}
        subtitle="Successfully written"
        icon={<CheckCircle className="w-5 h-5 text-green-500" />}
      />
      <StatCard
        title="Failed"
        value={stats.failed.toString()}
        subtitle="Needs attention"
        icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
      />
    </div>
  );
}
