"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Send,
  RotateCcw,
  ExternalLink,
  Loader2,
  FileText,
  Target,
  Calendar,
  MessageSquare,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExtractedField {
  key: string;
  label: string;
  value: string;
  type: "text" | "select" | "date" | "rich_text";
  confidence: number;
  icon: React.ReactNode;
  options?: string[];
}

const defaultFields: ExtractedField[] = [
  { key: "account", label: "Account / Company", value: "", type: "text", confidence: 0, icon: <Target className="w-4 h-4" /> },
  { key: "contact", label: "Contact Person", value: "", type: "text", confidence: 0, icon: <FileText className="w-4 h-4" /> },
  { key: "summary", label: "Meeting Summary", value: "", type: "rich_text", confidence: 0, icon: <MessageSquare className="w-4 h-4" /> },
  { key: "stage", label: "Deal Stage", value: "", type: "select", confidence: 0, icon: <TrendingUp className="w-4 h-4" />, options: ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"] },
  { key: "next_steps", label: "Next Steps", value: "", type: "rich_text", confidence: 0, icon: <FileText className="w-4 h-4" /> },
  { key: "follow_up_date", label: "Follow Up Date", value: "", type: "date", confidence: 0, icon: <Calendar className="w-4 h-4" /> },
];

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const entryId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; url?: string; error?: string } | null>(null);
  const [transcript, setTranscript] = useState("");
  const [fields, setFields] = useState<ExtractedField[]>(defaultFields);
  const [editingField, setEditingField] = useState<string | null>(null);

  useEffect(() => {
    if (!entryId) return;
    const fetchEntry = async () => {
      try {
        const res = await fetch(`/api/voice/extract?id=${entryId}`);
        const data = await res.json();
        if (data.transcript) setTranscript(data.transcript);
        if (data.fields) {
          setFields((prev) =>
            prev.map((f) => {
              const extracted = data.fields[f.key];
              if (extracted) {
                return { ...f, value: extracted.value || "", confidence: extracted.confidence || 0 };
              }
              return f;
            })
          );
        }
      } catch (err) {
        console.error("Failed to fetch entry:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [entryId]);

  const handleFieldChange = (key: string, value: string) => {
    setFields((prev) => prev.map((f) => (f.key === key ? { ...f, value } : f)));
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const payload = {
        entryId,
        transcript,
        fields: Object.fromEntries(fields.map((f) => [f.key, f.value])),
      };
      const res = await fetch("/api/notion/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      setSyncResult(data);
    } catch (err) {
      setSyncResult({ success: false, error: "Network error. Please try again." });
    } finally {
      setSyncing(false);
    }
  };

  const confidenceColor = (c: number) => {
    if (c >= 0.8) return "text-green-600 bg-green-50";
    if (c >= 0.5) return "text-amber-600 bg-amber-50";
    return "text-red-500 bg-red-50";
  };

  if (syncResult) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-12">
        {syncResult.success ? (
          <>
            <div className="w-20 h-20 rounded-full bg-green-50 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Row Created in Notion ✅</h1>
            <p className="text-muted-text">Your voice note has been synced successfully.</p>
            {syncResult.url && (
              <a
                href={syncResult.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium"
              >
                Open in Notion <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-red-50 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Sync Failed</h1>
            <p className="text-muted-text">{syncResult.error || "Something went wrong."}</p>
            <button onClick={() => { setSyncResult(null); handleSync(); }} className="text-primary hover:text-primary-hover font-medium inline-flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Retry
            </button>
          </>
        )}
        <div className="pt-4 flex gap-4 justify-center">
          <button onClick={() => router.push("/dashboard/capture")} className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold transition-all">
            Record Another
          </button>
          <button onClick={() => router.push("/dashboard/history")} className="px-6 py-2.5 rounded-full bg-bg-light border border-border text-text-primary hover:bg-gray-100 font-semibold transition-all">
            View History
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-bg-light rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-text" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Review & Edit</h1>
            <p className="text-muted-text text-sm">Verify extracted fields before syncing to Notion</p>
          </div>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-full px-6 py-3 font-semibold transition-all shadow-[0_4px_14px_0_rgba(79,124,255,0.39)] disabled:opacity-50"
        >
          {syncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          Write to Notion
        </button>
      </div>

      {/* Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transcript */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary">Transcript</h2>
            <Edit3 className="w-4 h-4 text-muted-text" />
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full h-[400px] bg-bg-light rounded-xl p-4 text-sm text-text-primary border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 resize-none leading-relaxed"
            placeholder="Transcript will appear here after processing..."
          />
        </div>

        {/* Extracted Fields */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">Extracted Fields</h2>
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.key} className="border border-border rounded-xl p-4 hover:border-primary/20 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">{field.icon}</span>
                    <label className="text-sm font-medium text-text-primary">{field.label}</label>
                  </div>
                  {field.confidence > 0 && (
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", confidenceColor(field.confidence))}>
                      {Math.round(field.confidence * 100)}%
                    </span>
                  )}
                </div>
                {field.type === "select" && field.options ? (
                  <select
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="w-full bg-bg-light rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select...</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === "date" ? (
                  <input
                    type="date"
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="w-full bg-bg-light rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                ) : field.type === "rich_text" ? (
                  <textarea
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    rows={3}
                    className="w-full bg-bg-light rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                  />
                ) : (
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="w-full bg-bg-light rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
