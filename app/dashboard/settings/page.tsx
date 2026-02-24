"use client";

import { useState } from "react";
import {
  Shield,
  Database,
  CreditCard,
  User,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("account");

  const sections = [
    { id: "account", label: "Account", icon: User },
    { id: "notion", label: "Notion Connection", icon: Shield },
    { id: "mapping", label: "Database & Mapping", icon: Database },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "danger", label: "Danger Zone", icon: Trash2 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-muted-text mt-1">Manage your account and integrations</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <nav className="md:w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-border p-2 space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  activeSection === s.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-text hover:text-text-primary hover:bg-bg-light"
                )}
              >
                <s.icon className="w-4 h-4" />
                {s.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeSection === "account" && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
              <h2 className="text-lg font-bold text-text-primary">Account</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Full Name</label>
                  <input type="text" className="w-full bg-bg-light rounded-xl px-4 py-2.5 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                  <input type="email" className="w-full bg-bg-light rounded-xl px-4 py-2.5 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="you@example.com" disabled />
                </div>
              </div>
              <button className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-all">
                Save Changes
              </button>
            </div>
          )}

          {activeSection === "notion" && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
              <h2 className="text-lg font-bold text-text-primary">Notion Connection</h2>
              <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Connected to Notion</p>
                  <p className="text-xs text-green-600">Workspace: My Workspace</p>
                </div>
                <button className="text-sm text-green-700 hover:text-green-900 font-medium inline-flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5" /> Reconnect
                </button>
              </div>
              <button className="text-sm text-red-500 hover:text-red-700 font-medium">
                Disconnect Notion
              </button>
            </div>
          )}

          {activeSection === "mapping" && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
              <h2 className="text-lg font-bold text-text-primary">Database & Mapping</h2>
              <div className="p-4 bg-bg-light rounded-xl border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Sales Pipeline</p>
                    <p className="text-xs text-muted-text">6 columns mapped</p>
                  </div>
                  <button className="text-xs text-primary hover:text-primary-hover font-medium">Change Database</button>
                </div>
                <div className="space-y-2">
                  {["Account (title)", "Contact (rich_text)", "Stage (select)", "Follow Up (date)", "Notes (rich_text)", "Deal Size (number)"].map((col) => (
                    <div key={col} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-border">
                      <span className="text-sm text-text-primary">{col}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-checked:bg-primary rounded-full peer-focus:ring-2 peer-focus:ring-primary/20 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <button className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-all">
                Save Mapping
              </button>
            </div>
          )}

          {activeSection === "billing" && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
              <h2 className="text-lg font-bold text-text-primary">Billing</h2>
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-text-primary">Free Plan</p>
                    <p className="text-xs text-muted-text">30 entries/month · 60s max per note</p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">Current</span>
                </div>
                {/* Usage meter */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-text">
                    <span>12 / 30 entries used</span>
                    <span>40%</span>
                  </div>
                  <div className="h-2 bg-bg-light rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "40%" }} />
                  </div>
                </div>
              </div>
              <button className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-all shadow-[0_4px_14px_0_rgba(79,124,255,0.39)]">
                Upgrade to Pro — $79/mo
              </button>
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
                  <button className="px-4 py-2 rounded-full border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium transition-all">
                    Delete
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 border border-red-100 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Delete account</p>
                    <p className="text-xs text-muted-text">Permanently remove your account and all data</p>
                  </div>
                  <button className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all">
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
