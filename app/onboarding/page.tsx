"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mic, Check, ChevronRight, Database, Shield, Loader2, Search, BarChart3, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: "welcome", label: "Welcome" },
  { id: "connect", label: "Connect" },
  { id: "database", label: "Database" },
  { id: "schema", label: "Schema" },
];

interface NotionDB {
  id: string;
  title: string;
  icon: string | null;
  lastEditedTime: string;
}

interface SchemaProperty {
  name: string;
  type: string;
  options?: string[];
  fillable: boolean;
}

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlStep = searchParams.get("step");

  const [currentStep, setCurrentStep] = useState(urlStep || "welcome");
  const [databases, setDatabases] = useState<NotionDB[]>([]);
  const [selectedDb, setSelectedDb] = useState<NotionDB | null>(null);
  const [schema, setSchema] = useState<SchemaProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbSearch, setDbSearch] = useState("");

  useEffect(() => {
    if (urlStep) setCurrentStep(urlStep);
  }, [urlStep]);

  const handleConnectNotion = () => {
    window.location.href = "/api/oauth/notion/start";
  };

  const fetchDatabases = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notion/databases");
      const data = await res.json();
      setDatabases(data.databases || []);
    } catch (err) {
      console.error("Failed to fetch databases:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchema = async (dbId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notion/schema?databaseId=${dbId}`);
      const data = await res.json();
      setSchema(
        (data.properties || []).map((p: any) => ({ ...p, fillable: true }))
      );
    } catch (err) {
      console.error("Failed to fetch schema:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDb = (db: NotionDB) => {
    setSelectedDb(db);
    fetchSchema(db.id);
    setCurrentStep("schema");
  };

  const handleSaveMapping = async () => {
    if (!selectedDb) return;
    setLoading(true);
    try {
      await fetch("/api/notion/schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          databaseId: selectedDb.id,
          databaseName: selectedDb.title,
          schema: schema.filter((s) => s.fillable),
          mapping: Object.fromEntries(
            schema
              .filter((s) => s.fillable)
              .map((s) => [s.name.toLowerCase().replace(/\s+/g, "_"), s.name])
          ),
        }),
      });
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to save mapping:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStep === "database") fetchDatabases();
  }, [currentStep]);

  const stepIndex = steps.findIndex((s) => s.id === currentStep);

  const otherIntegrations = [
    { name: "Salesforce", icon: <Database className="w-5 h-5" />, color: "bg-blue-600" },
    { name: "HubSpot", icon: <BarChart3 className="w-5 h-5" />, color: "bg-orange-500" },
    { name: "Pipedrive", icon: <Database className="w-5 h-5" />, color: "bg-green-600" },
    { name: "Slack", icon: <MessageSquare className="w-5 h-5" />, color: "bg-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-[400px] flex-col p-10 border-r border-white/10">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(79,124,255,0.4)]">
            <Mic className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold">RepLog AI</span>
        </div>

        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-4">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                  i < stepIndex
                    ? "bg-primary border-primary text-white"
                    : i === stepIndex
                    ? "border-primary text-primary"
                    : "border-white/20 text-white/30"
                )}
              >
                {i < stepIndex ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn("text-sm font-medium", i <= stepIndex ? "text-white" : "text-white/30")}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-xl">
          {/* Step: Welcome */}
          {currentStep === "welcome" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-3">Welcome to RepLog AI 👋</h1>
                <p className="text-gray-400 text-lg">Let's connect your workspace so you can start turning voice notes into structured CRM data.</p>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">What you'll set up:</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <Shield className="w-5 h-5 text-primary" />
                    <span>Connect your Notion workspace</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <Database className="w-5 h-5 text-primary" />
                    <span>Choose your Notion database (CRM)</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Review column mapping</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCurrentStep("connect")}
                className="w-full py-3.5 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold transition-all flex items-center justify-center gap-2"
              >
                Get Started <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step: Connect */}
          {currentStep === "connect" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-3">Connect Your Tools</h1>
                <p className="text-gray-400">Connect Notion to get started. More integrations coming soon.</p>
              </div>

              {/* Notion - Primary */}
              <div className="p-6 bg-white/5 rounded-2xl border border-primary/30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0B0F17] border border-white/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Notion</h3>
                    <p className="text-sm text-gray-400">Connect to read & write your CRM database</p>
                  </div>
                </div>
                <button
                  onClick={handleConnectNotion}
                  className="w-full py-3 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold transition-all"
                >
                  Connect Notion
                </button>
              </div>

              {/* Other Integrations - Coming Soon */}
              <div className="space-y-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Coming Soon</p>
                {otherIntegrations.map((int) => (
                  <div key={int.name} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 opacity-50">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white", int.color)}>
                      {int.icon}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">{int.name}</span>
                    </div>
                    <span className="text-xs bg-white/10 text-gray-400 px-2.5 py-1 rounded-full font-medium">Beta · Future</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step: Database */}
          {currentStep === "database" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-3">Select Database</h1>
                <p className="text-gray-400">Choose which Notion database RepLog should write to.</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search databases..."
                  value={dbSearch}
                  onChange={(e) => setDbSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {databases
                    .filter((db) => db.title.toLowerCase().includes(dbSearch.toLowerCase()))
                    .map((db) => (
                      <button
                        key={db.id}
                        onClick={() => handleSelectDb(db)}
                        className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-primary/30 transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-lg">
                          {db.icon || "📋"}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{db.title}</p>
                          <p className="text-xs text-gray-500">Last edited: {new Date(db.lastEditedTime).toLocaleDateString()}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Step: Schema */}
          {currentStep === "schema" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-3">Review Column Mapping</h1>
                <p className="text-gray-400">Toggle which columns RepLog can fill from voice notes.</p>
              </div>
              {selectedDb && (
                <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-xl border border-primary/20">
                  <Database className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">{selectedDb.title}</span>
                </div>
              )}
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {schema.map((prop, i) => (
                    <div key={prop.name} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                      <div>
                        <p className="text-sm font-medium">{prop.name}</p>
                        <p className="text-xs text-gray-500">{prop.type}{prop.options ? ` (${prop.options.length} options)` : ""}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={prop.fillable}
                          onChange={() => {
                            const updated = [...schema];
                            updated[i] = { ...updated[i], fillable: !updated[i].fillable };
                            setSchema(updated);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-white/20 peer-checked:bg-primary rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={handleSaveMapping}
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                Save & Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
