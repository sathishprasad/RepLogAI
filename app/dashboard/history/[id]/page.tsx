"use client";

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
} from "lucide-react";

export default function EntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const entry = {
    id,
    title: "Call with Acme Corp — Q2 renewal",
    status: "SYNCED",
    database: "Sales Pipeline",
    meetingType: "Call",
    duration: 45,
    createdAt: "2026-02-24T10:30:00Z",
    transcript: "Had a great call with John from Acme Corp today. We discussed the Q2 renewal and they're looking to expand their current plan. The main concern is pricing for the additional seats. I offered a 15% discount for annual commitment. John will get back to me by Friday. Next step is to send a formal proposal by end of week.",
    extractedFields: {
      account: "Acme Corp",
      contact: "John",
      summary: "Q2 renewal discussion. Client wants to expand, concerned about pricing for additional seats.",
      stage: "Negotiation",
      next_steps: "Send formal proposal by end of week",
      follow_up_date: "2026-02-28",
    },
    notionPageUrl: "https://notion.so/example-page",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
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
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-green-50 text-green-700">
            <CheckCircle2 className="w-3.5 h-3.5" /> Synced
          </span>
        </div>
      </div>

      {/* Notion Link */}
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
        {/* Transcript */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary">Transcript</h2>
            <button className="p-1.5 hover:bg-bg-light rounded-lg transition-colors" title="Copy">
              <Copy className="w-4 h-4 text-muted-text" />
            </button>
          </div>
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{entry.transcript}</p>
        </div>

        {/* Extracted Fields */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">Extracted Fields</h2>
          <div className="space-y-3">
            {Object.entries(entry.extractedFields).map(([key, value]) => (
              <div key={key} className="flex flex-col gap-1 p-3 bg-bg-light rounded-xl">
                <span className="text-xs font-semibold text-muted-text uppercase tracking-wider">
                  {key.replace(/_/g, " ")}
                </span>
                <span className="text-sm text-text-primary">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-all inline-flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> Re-sync to Notion
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(JSON.stringify(entry.extractedFields, null, 2))}
          className="px-5 py-2.5 rounded-full bg-white border border-border hover:bg-bg-light text-text-primary font-semibold text-sm transition-all inline-flex items-center gap-2"
        >
          <Copy className="w-4 h-4" /> Copy JSON
        </button>
      </div>
    </div>
  );
}
