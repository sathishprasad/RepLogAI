"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileAudio,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  ChevronDown,
  Loader2,
  Download,
  Calendar,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCachedFetch } from "@/lib/use-cached-fetch";

type EntryStatus = "SYNCED" | "PENDING_APPROVAL" | "FAILED" | "RECORDING" | "TRANSCRIBING" | "EXTRACTING" | "CANCELED";

interface HistoryEntry {
  id: string;
  title: string;
  status: EntryStatus;
  database: string;
  meetingType: string;
  duration: number;
  createdAt: string;
  source?: "WEB" | "TELEGRAM";
  repName?: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  SYNCED: { label: "Synced", color: "bg-green-50 text-green-700", icon: CheckCircle2 },
  PENDING_APPROVAL: { label: "Pending", color: "bg-amber-50 text-amber-700", icon: Clock },
  FAILED: { label: "Failed", color: "bg-red-50 text-red-700", icon: XCircle },
  RECORDING: { label: "Recording", color: "bg-blue-50 text-blue-700", icon: FileAudio },
  TRANSCRIBING: { label: "Transcribing", color: "bg-purple-50 text-purple-700", icon: FileAudio },
  EXTRACTING: { label: "Extracting", color: "bg-indigo-50 text-indigo-700", icon: FileAudio },
  CANCELED: { label: "Canceled", color: "bg-gray-50 text-gray-500", icon: XCircle },
};

export default function HistoryPage() {
  const router = useRouter();
  const { data: historyData, loading } = useCachedFetch<{ entries: HistoryEntry[] }>("/api/history");
  const entries = historyData?.entries || [];
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [repFilter, setRepFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const repNames = useMemo(() => {
    const names = new Set<string>();
    entries.forEach((e) => { if (e.repName) names.add(e.repName); });
    return Array.from(names).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.repName?.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (repFilter !== "all" && (e.repName || "Unknown") !== repFilter) return false;
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (new Date(e.createdAt) < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(e.createdAt) > to) return false;
      }
      return true;
    });
  }, [entries, search, statusFilter, repFilter, dateFrom, dateTo]);

  const hasActiveFilters = statusFilter !== "all" || repFilter !== "all" || dateFrom || dateTo;

  const clearFilters = () => {
    setStatusFilter("all");
    setRepFilter("all");
    setDateFrom("");
    setDateTo("");
    setSearch("");
  };

  const exportToExcel = () => {
    const headers = ["Title", "Rep Name", "Status", "Source", "Duration (s)", "Date", "Database"];
    const rows = filtered.map((e) => [
      e.title,
      e.repName || "—",
      e.status,
      e.source || "WEB",
      e.duration.toString(),
      new Date(e.createdAt).toLocaleString(),
      e.database,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `replog-history-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">History</h1>
          <p className="text-muted-text mt-1">All your voice entries and their sync status</p>
        </div>
        <button
          onClick={exportToExcel}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-border hover:bg-bg-light text-text-primary text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
            <input
              type="text"
              placeholder="Search entries or rep names..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-white rounded-xl text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="SYNCED">Synced</option>
              <option value="PENDING_APPROVAL">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELED">Canceled</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text pointer-events-none" />
          </div>
          {repNames.length > 0 && (
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
              <select
                value={repFilter}
                onChange={(e) => setRepFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 bg-white rounded-xl text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
              >
                <option value="all">All Reps</option>
                {repNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text pointer-events-none" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-text" />
            <span className="text-xs text-muted-text font-medium">From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 bg-white rounded-xl text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-text font-medium">To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 bg-white rounded-xl text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 border border-red-200 transition-all"
            >
              <X className="w-3 h-3" /> Clear Filters
            </button>
          )}
          <span className="text-xs text-muted-text ml-auto">{filtered.length} of {entries.length} entries</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <>
            <div className="hidden sm:grid grid-cols-[1fr_120px_100px_80px_100px] gap-4 px-6 py-3 border-b border-border text-xs font-semibold text-muted-text uppercase tracking-wider">
              <div>Entry</div>
              <div>Status</div>
              <div>Source</div>
              <div>Duration</div>
              <div>Date</div>
            </div>
            <div className="divide-y divide-border">
              {filtered.map((entry) => {
                const config = statusConfig[entry.status] || statusConfig.SYNCED;
                const StatusIcon = config.icon;
                return (
                  <Link
                    key={entry.id}
                    href={`/dashboard/history/${entry.id}`}
                    className="flex flex-col sm:grid sm:grid-cols-[1fr_120px_100px_80px_100px] gap-2 sm:gap-4 px-6 py-4 hover:bg-bg-light transition-colors items-start sm:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileAudio className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary leading-tight">{entry.title}</p>
                        <p className="text-xs text-muted-text">
                          {entry.repName ? `${entry.repName} · ` : ""}{entry.database}
                        </p>
                      </div>
                    </div>
                    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit", config.color)}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {config.label}
                    </span>
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full w-fit",
                      entry.source === "TELEGRAM" ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-600"
                    )}>
                      {entry.source === "TELEGRAM" ? "Telegram" : "Web"}
                    </span>
                    <span className="text-xs text-muted-text">{entry.duration}s</span>
                    <span className="text-xs text-muted-text">{formatDate(entry.createdAt)}</span>
                  </Link>
                );
              })}
            </div>
            {filtered.length === 0 && (
              <div className="px-6 py-12 text-center text-muted-text">
                <FileAudio className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No entries found</p>
                <p className="text-sm mt-1">{entries.length === 0 ? "Share the bot link with reps to get started" : "Try adjusting your search or filters"}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
