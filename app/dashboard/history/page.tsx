"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

type EntryStatus = "SYNCED" | "PENDING_APPROVAL" | "FAILED" | "RECORDING" | "TRANSCRIBING" | "EXTRACTING" | "CANCELED";

interface HistoryEntry {
  id: string;
  title: string;
  status: EntryStatus;
  database: string;
  meetingType: string;
  duration: number;
  createdAt: string;
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
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await fetch("/api/history");
        if (res.status === 401) {
          router.push("/auth");
          return;
        }
        const data = await res.json();
        setEntries(data.entries || []);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, [router]);

  const filtered = entries.filter((e) => {
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    return true;
  });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">History</h1>
        <p className="text-muted-text mt-1">All your voice entries and their sync status</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
          <input
            type="text"
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
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
              <div>Type</div>
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
                        <p className="text-xs text-muted-text">{entry.database}</p>
                      </div>
                    </div>
                    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit", config.color)}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {config.label}
                    </span>
                    <span className="text-xs text-muted-text">{entry.meetingType}</span>
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
                <p className="text-sm mt-1">{entries.length === 0 ? "Record your first voice note to get started" : "Try adjusting your search or filter"}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
