"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink, Database, BarChart3, Shield, MessageSquare, Plug, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Integration {
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "connected" | "coming_soon" | "in_progress" | "not_connected";
  color: string;
}

const statusBadge: Record<string, { label: string; className: string }> = {
  connected: { label: "Connected", className: "bg-green-50 text-green-700 border-green-200" },
  not_connected: { label: "Not Connected", className: "bg-amber-50 text-amber-700 border-amber-200" },
  coming_soon: { label: "Coming Soon · Beta", className: "bg-gray-50 text-gray-500 border-gray-200" },
  in_progress: { label: "In Progress", className: "bg-amber-50 text-amber-700 border-amber-200" },
};

export default function IntegrationsPage() {
  const router = useRouter();
  const [notionConnected, setNotionConnected] = useState<boolean | null>(null);
  const [notionWorkspace, setNotionWorkspace] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setNotionConnected(data.notion.connected);
          setNotionWorkspace(data.notion.workspaceName || "");
        }
      } catch {}
      finally { setLoading(false); }
    };
    fetchStatus();
  }, []);

  const integrations: Integration[] = [
    {
      name: "Notion",
      description: "Write structured data directly to your Notion databases. The primary integration for RepLog AI.",
      icon: <Shield className="w-7 h-7" />,
      status: notionConnected ? "connected" : "not_connected",
      color: "bg-[#0B0F17]",
    },
    {
      name: "Salesforce",
      description: "Sync voice notes to Salesforce opportunities, contacts, and custom objects.",
      icon: <Database className="w-7 h-7" />,
      status: "coming_soon",
      color: "bg-blue-600",
    },
    {
      name: "HubSpot",
      description: "Automatically log meeting notes and update deal stages in HubSpot CRM.",
      icon: <BarChart3 className="w-7 h-7" />,
      status: "coming_soon",
      color: "bg-orange-500",
    },
    {
      name: "Pipedrive",
      description: "Push voice-extracted data into Pipedrive deals and activities.",
      icon: <Database className="w-7 h-7" />,
      status: "coming_soon",
      color: "bg-green-600",
    },
    {
      name: "Slack",
      description: "Get notifications and summaries posted to your Slack channels.",
      icon: <MessageSquare className="w-7 h-7" />,
      status: "coming_soon",
      color: "bg-purple-600",
    },
    {
      name: "WhatsApp Voice",
      description: "Send voice notes via WhatsApp and get structured CRM entries back.",
      icon: <MessageSquare className="w-7 h-7" />,
      status: "in_progress",
      color: "bg-green-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Integrations</h1>
        <p className="text-muted-text mt-1">Connect your tools to RepLog AI</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => {
          const badge = statusBadge[integration.status];
          return (
            <div
              key={integration.name}
              className={cn(
                "bg-white rounded-2xl border p-6 transition-all",
                integration.status === "connected"
                  ? "border-primary/30 shadow-sm"
                  : "border-border",
                integration.status === "coming_soon" && "opacity-80"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white", integration.color)}>
                  {integration.icon}
                </div>
                <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", badge.className)}>
                  {badge.label}
                </span>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">{integration.name}</h3>
              <p className="text-sm text-muted-text mb-4 leading-relaxed">{integration.description}</p>

              {integration.name === "Notion" && integration.status === "connected" ? (
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    {notionWorkspace || "Active"}
                  </span>
                  <button
                    onClick={() => router.push("/dashboard/settings")}
                    className="text-sm text-primary hover:text-primary-hover font-medium inline-flex items-center gap-1"
                  >
                    Manage <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : integration.name === "Notion" && integration.status === "not_connected" ? (
                <button
                  onClick={() => window.location.href = "/api/oauth/notion/start"}
                  className="px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold"
                >
                  Connect Notion
                </button>
              ) : integration.status === "in_progress" ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-sm text-amber-600 font-medium">Under development</span>
                </div>
              ) : (
                <button disabled className="text-sm text-gray-400 font-medium cursor-not-allowed">
                  Available in future release
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 text-center">
        <Plug className="w-8 h-8 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-bold text-text-primary mb-2">Need a different integration?</h3>
        <p className="text-sm text-muted-text mb-4">We&apos;re building new integrations based on user demand.</p>
        <button className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold transition-all text-sm">
          Request Integration
        </button>
      </div>
    </div>
  );
}
