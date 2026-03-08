"use client";

import { useEffect, useState } from "react";
import { ExternalLink, X, Sparkles, RotateCcw } from "lucide-react";

const NOTION_PUBLIC_URL = "https://dust-columnist-618.notion.site/311cdf46f1e5804a915bef2d5d0858c8?v=311cdf46f1e58085a9e0000c613d9843";

export function DemoBanner() {
  const [isDemo, setIsDemo] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    // Only show demo banner if demo cookie exists AND no Supabase session
    // (if user signs up after demo, Supabase cookie takes priority)
    const hasDemo = document.cookie.includes("replog-demo-mode=true");
    const hasSupabase = document.cookie.includes("sb-");
    setIsDemo(hasDemo && !hasSupabase);
  }, []);

  const handleReset = async () => {
    setResetting(true);
    try {
      const res = await fetch("/api/auth/demo/reset", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Reset failed:", err);
    } finally {
      setResetting(false);
    }
  };

  if (!isDemo || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm">
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-text-primary font-medium">
            You&apos;re in <span className="text-primary font-bold">Demo Mode</span> — Record a voice note and watch it appear in Notion!
          </span>
          <a
            href={NOTION_PUBLIC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-primary hover:text-primary-hover font-semibold whitespace-nowrap"
          >
            View Notion CRM <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={resetting}
            className="inline-flex items-center gap-1.5 text-xs text-muted-text hover:text-text-primary px-2.5 py-1.5 rounded-lg hover:bg-white/50 transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
            {resetting ? "Resetting..." : "Reset Demo"}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-muted-text hover:text-text-primary p-1 rounded-lg hover:bg-white/50 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
