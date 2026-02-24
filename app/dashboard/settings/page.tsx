"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield,
  Database,
  CreditCard,
  User,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Loader2,
  XCircle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsData {
  account: { name: string; email: string; avatarUrl: string | null; createdAt: string };
  notion: { connected: boolean; workspaceName?: string; workspaceIcon?: string; connectedAt?: string };
  database: { configured: boolean; databaseId?: string; databaseName?: string; columns?: { name: string; type: string; fillable: boolean }[] };
  billing: { plan: string; entriesUsed: number; limits: { maxEntries: number; maxAudioSecs: number }; currentPeriodEnd: string | null; hasSubscription: boolean };
}

function SettingsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState("account");
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const billingStatus = searchParams.get("billing");

  useEffect(() => {
    if (billingStatus === "success") {
      setToast({ type: "success", message: "🎉 Subscription activated! You're now on the Pro plan." });
      setActiveSection("billing");
    }
  }, [billingStatus]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.status === 401) { router.push("/auth"); return; }
        const d = await res.json();
        setData(d);
        setName(d.account.name);
      } catch { setToast({ type: "error", message: "Failed to load settings" }); }
      finally { setLoading(false); }
    };
    fetchSettings();
  }, [router]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveName = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      showToast("success", "Name updated");
    } catch { showToast("error", "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDisconnectNotion = async () => {
    if (!confirm("Disconnect Notion? This will remove your database mapping and you'll need to re-onboard.")) return;
    setActionLoading("disconnect-notion");
    try {
      await fetch("/api/settings/notion/disconnect", { method: "POST" });
      showToast("success", "Notion disconnected");
      router.push("/onboarding");
    } catch { showToast("error", "Failed to disconnect"); }
    finally { setActionLoading(""); }
  };

  const handleReconnectNotion = () => { window.location.href = "/api/oauth/notion/start"; };

  const handleUpgrade = async () => {
    setActionLoading("upgrade");
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const { url, error } = await res.json();
      if (url) window.location.href = url;
      else showToast("error", error || "Failed to create checkout session");
    } catch { showToast("error", "Failed to start checkout"); }
    finally { setActionLoading(""); }
  };

  const handleManageBilling = async () => {
    setActionLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url, error } = await res.json();
      if (url) window.location.href = url;
      else showToast("error", error || "No billing account found");
    } catch { showToast("error", "Failed to open billing portal"); }
    finally { setActionLoading(""); }
  };

  const handleDeleteTranscripts = async () => {
    if (!confirm("Delete ALL transcripts and voice entries? This cannot be undone.")) return;
    setActionLoading("delete-transcripts");
    try {
      await fetch("/api/settings/danger/delete-transcripts", { method: "POST" });
      showToast("success", "All transcripts deleted");
    } catch { showToast("error", "Failed to delete transcripts"); }
    finally { setActionLoading(""); }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("PERMANENTLY delete your account and ALL data? This CANNOT be undone.")) return;
    if (!confirm("Are you absolutely sure? Type 'delete' in the next prompt to confirm.")) return;
    setActionLoading("delete-account");
    try {
      await fetch("/api/settings/danger/delete-account", { method: "POST" });
      router.push("/auth");
    } catch { showToast("error", "Failed to delete account"); }
    finally { setActionLoading(""); }
  };

  const handleChangeDatabase = () => { router.push("/onboarding?step=database"); };

  const sections = [
    { id: "account", label: "Account", icon: User },
    { id: "notion", label: "Notion Connection", icon: Shield },
    { id: "mapping", label: "Database & Mapping", icon: Database },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "danger", label: "Danger Zone", icon: Trash2 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const d = data!;
  const usagePercent = Math.min(100, Math.round((d.billing.entriesUsed / d.billing.limits.maxEntries) * 100));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toast && (
        <div className={cn(
          "fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-2",
          toast.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
        )}>
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-muted-text mt-1">Manage your account and integrations</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <nav className="md:w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-border p-2 space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  activeSection === s.id ? "bg-primary/10 text-primary" : "text-muted-text hover:text-text-primary hover:bg-bg-light"
                )}
              >
                <s.icon className="w-4 h-4" />
                {s.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="flex-1 space-y-6">
          {activeSection === "account" && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
              <h2 className="text-lg font-bold text-text-primary">Account</h2>
              <div className="flex items-center gap-4 mb-4">
                {d.account.avatarUrl ? (
                  <img src={d.account.avatarUrl} alt="" className="w-14 h-14 rounded-full" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    {d.account.name?.charAt(0) || d.account.email.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-text-primary">{d.account.name || "No name set"}</p>
                  <p className="text-sm text-muted-text">{d.account.email}</p>
                  <p className="text-xs text-muted-text">Member since {new Date(d.account.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-bg-light rounded-xl px-4 py-2.5 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                  <input type="email" value={d.account.email} disabled className="w-full bg-bg-light rounded-xl px-4 py-2.5 text-sm border border-border text-muted-text" />
                </div>
              </div>
              <button
                onClick={handleSaveName}
                disabled={saving}
                className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-all disabled:opacity-50 inline-flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          )}

          {activeSection === "notion" && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
              <h2 className="text-lg font-bold text-text-primary">Notion Connection</h2>
              {d.notion.connected ? (
                <>
                  <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">Connected to Notion</p>
                      <p className="text-xs text-green-600">
                        Workspace: {d.notion.workspaceName}
                        {d.notion.connectedAt && ` · Connected ${new Date(d.notion.connectedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <button
                      onClick={handleReconnectNotion}
                      className="text-sm text-green-700 hover:text-green-900 font-medium inline-flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reconnect
                    </button>
                  </div>
                  <button
                    onClick={handleDisconnectNotion}
                    disabled={actionLoading === "disconnect-notion"}
                    className="text-sm text-red-500 hover:text-red-700 font-medium inline-flex items-center gap-2"
                  >
                    {actionLoading === "disconnect-notion" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Disconnect Notion
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800">Not connected</p>
                    <p className="text-xs text-amber-600">Connect Notion to start using RepLog</p>
                  </div>
                  <button
                    onClick={handleReconnectNotion}
                    className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium"
                  >
                    Connect
                  </button>
                </div>
              )}
            </div>
          )}

          {activeSection === "mapping" && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
              <h2 className="text-lg font-bold text-text-primary">Database & Mapping</h2>
              {d.database.configured ? (
                <div className="p-4 bg-bg-light rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{d.database.databaseName}</p>
                      <p className="text-xs text-muted-text">{d.database.columns?.length || 0} columns mapped</p>
                    </div>
                    <button onClick={handleChangeDatabase} className="text-xs text-primary hover:text-primary-hover font-medium">
                      Change Database
                    </button>
                  </div>
                  <div className="space-y-2">
                    {d.database.columns?.map((col) => (
                      <div key={col.name} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-border">
                        <div>
                          <span className="text-sm text-text-primary">{col.name}</span>
                          <span className="text-xs text-muted-text ml-2">({col.type})</span>
                        </div>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", col.fillable ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500")}>
                          {col.fillable ? "Active" : "Ignored"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Database className="w-10 h-10 text-muted-text mx-auto mb-3 opacity-40" />
                  <p className="text-sm text-muted-text mb-4">No database configured</p>
                  <button onClick={() => router.push("/onboarding?step=database")} className="px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-sm">
                    Set Up Database
                  </button>
                </div>
              )}
            </div>
          )}

          {activeSection === "billing" && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
              <h2 className="text-lg font-bold text-text-primary">Billing</h2>
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-text-primary flex items-center gap-2">
                      {d.billing.plan === "PRO" && <Zap className="w-4 h-4 text-primary" />}
                      {d.billing.plan === "PRO" ? "Pro Plan" : "Free Plan"}
                    </p>
                    <p className="text-xs text-muted-text">
                      {d.billing.limits.maxEntries} entries/month · {d.billing.limits.maxAudioSecs}s max per note
                      {d.billing.currentPeriodEnd && ` · Renews ${new Date(d.billing.currentPeriodEnd).toLocaleDateString()}`}
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">Current</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-text">
                    <span>{d.billing.entriesUsed} / {d.billing.limits.maxEntries} entries used</span>
                    <span>{usagePercent}%</span>
                  </div>
                  <div className="h-2 bg-bg-light rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", usagePercent > 80 ? "bg-red-500" : "bg-primary")}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {d.billing.plan === "FREE" ? (
                  <button
                    onClick={handleUpgrade}
                    disabled={actionLoading === "upgrade"}
                    className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-all shadow-[0_4px_14px_0_rgba(79,124,255,0.39)] inline-flex items-center gap-2"
                  >
                    {actionLoading === "upgrade" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    Upgrade to Pro — $79/mo
                  </button>
                ) : (
                  <button
                    onClick={handleManageBilling}
                    disabled={actionLoading === "portal"}
                    className="px-5 py-2.5 rounded-full bg-white border border-border hover:bg-bg-light text-text-primary font-semibold text-sm transition-all inline-flex items-center gap-2"
                  >
                    {actionLoading === "portal" && <Loader2 className="w-4 h-4 animate-spin" />}
                    Manage Subscription
                  </button>
                )}
              </div>

              {d.billing.plan === "FREE" && (
                <div className="p-4 bg-bg-light rounded-xl border border-border">
                  <h3 className="text-sm font-bold text-text-primary mb-2">Pro Plan includes:</h3>
                  <ul className="space-y-1.5 text-sm text-muted-text">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> 1,000 entries per month</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> 5 min max per voice note</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Priority AI processing</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> WhatsApp voice notes (coming soon)</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Email support</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeSection === "danger" && (
            <div className="bg-white rounded-2xl border border-red-200 p-6 space-y-6">
              <h2 className="text-lg font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Danger Zone
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-100 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Delete all transcripts</p>
                    <p className="text-xs text-muted-text">Remove all stored voice transcripts and extracted data</p>
                  </div>
                  <button
                    onClick={handleDeleteTranscripts}
                    disabled={actionLoading === "delete-transcripts"}
                    className="px-4 py-2 rounded-full border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium transition-all inline-flex items-center gap-2"
                  >
                    {actionLoading === "delete-transcripts" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Delete
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 border border-red-100 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Reset onboarding</p>
                    <p className="text-xs text-muted-text">Disconnect Notion and re-run the setup wizard</p>
                  </div>
                  <button
                    onClick={handleDisconnectNotion}
                    disabled={actionLoading === "disconnect-notion"}
                    className="px-4 py-2 rounded-full border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium transition-all inline-flex items-center gap-2"
                  >
                    {actionLoading === "disconnect-notion" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Reset
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 border border-red-100 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Delete account</p>
                    <p className="text-xs text-muted-text">Permanently remove your account and all data</p>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={actionLoading === "delete-account"}
                    className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all inline-flex items-center gap-2"
                  >
                    {actionLoading === "delete-account" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>}>
      <SettingsPageInner />
    </Suspense>
  );
}
