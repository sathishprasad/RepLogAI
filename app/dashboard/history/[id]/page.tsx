"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileAudio,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Copy,
  Calendar,
  Clock,
  Database,
  Loader2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EntryDetail {
  id: string;
  title: string;
  status: string;
  database: string;
  meetingType: string;
  duration: number;
  createdAt: string;
  transcript: string;
  extractedFields: Record<string, any>;
  notionPageUrl: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  SYNCED: { label: "Synced", color: "bg-green-50 text-green-700", icon: CheckCircle2 },
  PENDING_APPROVAL: { label: "Pending Review", color: "bg-amber-50 text-amber-700", icon: Clock },
  FAILED: { label: "Failed", color: "bg-red-50 text-red-700", icon: XCircle },
  RECORDING: { label: "Recording", color: "bg-blue-50 text-blue-700", icon: FileAudio },
  TRANSCRIBING: { label: "Transcribing", color: "bg-purple-50 text-purple-700", icon: FileAudio },
  EXTRACTING: { label: "Extracting", color: "bg-indigo-50 text-indigo-700", icon: FileAudio },
};

export default function EntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [entry, setEntry] = useState<EntryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const res = await fetch(`/api/history/${id}`);
        if (res.status === 401) {
          router.push("/auth");
          return;
        }
        if (!res.ok) {
          setError("Entry not found");
          return;
        }
        const data = await res.json();
        setEntry(data);
      } catch (err) {
        setError("Failed to load entry");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEntry();
  }, [id, router]);

  const formatFieldValue = (value: any): string => {
    if (typeof value === "object" && value !== null) {
      return value.value || JSON.stringify(value);
    }
    return String(value);
  };

  const formatFieldName = (key: string): string => {
    return key.replace(/_/g, " ");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="max-w-4xl mx-auto text-center py-24">
        <AlertCircle className="w-12 h-12 text-muted-text mx-auto mb-4 opacity-40" />
        <h2 className="text-lg font-bold text-text-primary mb-2">{error || "Entry not found"}</h2>
        <button onClick={() => router.back()} className="text-primary text-sm font-medium hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const config = statusConfig[entry.status] || statusConfig.SYNCED;
  const StatusIcon = config.icon;

  const fields = entry.extractedFields || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-bg-light rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-text" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">{entry.title}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-text">
            <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(entry.createdAt).toLocaleDateString()}</span>
            <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {entry.duration}s</span>
            <span className="inline-flex items-center gap-1"><Database className="w-3.5 h-3.5" /> {entry.database}</span>
          </div>
        </div>
        <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full", config.color)}>
          <StatusIcon className="w-3.5 h-3.5" /> {config.label}
        </span>
      </div>

      {entry.notionPageUrl && (
        <a
          href={entry.notionPageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-white rounded-2xl border border-border p-4 hover:border-primary/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0B0F17] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" /></svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-text-primary">View in Notion</p>
            <p className="text-xs text-muted-text">Open this entry in your Notion database</p>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-text" />
        </a>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary">Transcript</h2>
            <button
              onClick={() => navigator.clipboard.writeText(entry.transcript)}
              className="p-1.5 hover:bg-bg-light rounded-lg transition-colors"
              title="Copy transcript"
            >
              <Copy className="w-4 h-4 text-muted-text" />
            </button>
          </div>
          {entry.transcript ? (
            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{entry.transcript}</p>
          ) : (
            <p className="text-sm text-muted-text italic">No transcript available</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">Extracted Fields</h2>
          {Object.keys(fields).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(fields).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1 p-3 bg-bg-light rounded-xl">
                  <span className="text-xs font-semibold text-muted-text uppercase tracking-wider">
                    {formatFieldName(key)}
                  </span>
                  <span className="text-sm text-text-primary">{formatFieldValue(value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-text italic">No extracted fields</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigator.clipboard.writeText(JSON.stringify(fields, null, 2))}
          className="px-5 py-2.5 rounded-full bg-white border border-border hover:bg-bg-light text-text-primary font-semibold text-sm transition-all inline-flex items-center gap-2"
        >
          <Copy className="w-4 h-4" /> Copy JSON
        </button>
      </div>
    </div>
  );
}
