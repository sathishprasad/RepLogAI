"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mic, Check, ChevronRight, Database, Shield, Loader2, Search, BarChart3, MessageSquare, Upload, Copy, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: "welcome", label: "Welcome" },
  { id: "connect", label: "Connect" },
  { id: "database", label: "Database" },
  { id: "schema", label: "Schema" },
  { id: "company", label: "Company" },
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

function OnboardingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlStep = searchParams.get("step");

  const [currentStep, setCurrentStep] = useState(urlStep || "welcome");
  const [databases, setDatabases] = useState<NotionDB[]>([]);
  const [selectedDb, setSelectedDb] = useState<NotionDB | null>(null);
  const [schema, setSchema] = useState<SchemaProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbSearch, setDbSearch] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [rosterText, setRosterText] = useState("");
  const [rosterFile, setRosterFile] = useState<File | null>(null);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (urlStep) setCurrentStep(urlStep);
  }, [urlStep]);

  const handleSkipOnboarding = async () => {
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingComplete: true }),
      });
      router.push("/dashboard");
    } catch (err) {
      console.error("Skip onboarding error:", err);
      router.push("/dashboard");
    }
  };

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
      setCurrentStep("company");
    } catch (err) {
      console.error("Failed to save mapping:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const prefix = companyName.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, "X");
    const suffix = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `${prefix}${suffix}`;
  };

  const parseRoster = (text: string) => {
    const lines = text.trim().split("\n").filter(Boolean);
    const employees: { employeeCode: string; name: string }[] = [];
    for (const line of lines) {
      const parts = line.split(/[,\t]+/).map((s) => s.trim());
      if (parts.length >= 2) {
        employees.push({ employeeCode: parts[0], name: parts[1] });
      }
    }
    return employees;
  };

  const handleCompanySetup = async () => {
    setLoading(true);
    try {
      const code = companyCode || generateCode();
      setCompanyCode(code);

      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, companyCode: code }),
      });

      let rosterData = rosterText;
      if (rosterFile) {
        rosterData = await rosterFile.text();
      }

      if (rosterData.trim()) {
        const employees = parseRoster(rosterData);
        if (employees.length > 0) {
          const res = await fetch("/api/employees", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bulk: true, employees }),
          });
          const data = await res.json();
          setEmployeeCount(data.count || employees.length);
        }
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Company setup error:", err);
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
              <button
                onClick={handleSkipOnboarding}
                className="w-full py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 font-medium text-sm transition-all"
              >
                Skip for now — I'll set up later
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
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-lg overflow-hidden">
                          {db.icon && db.icon.startsWith("http") ? (
                            <img src={db.icon} alt="" className="w-6 h-6 object-contain" />
                          ) : (
                            db.icon || "📋"
                          )}
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
                Save & Continue
              </button>
            </div>
          )}

          {/* Step: Company Setup */}
          {currentStep === "company" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-3">Company Setup</h1>
                <p className="text-gray-400">Set up your company so reps can send voice notes via Telegram.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      if (!companyCode && e.target.value.length >= 3) {
                        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                        const prefix = e.target.value.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, "X");
                        const suffix = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
                        setCompanyCode(`${prefix}${suffix}`);
                      }
                    }}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Company Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={companyCode}
                      onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                      placeholder="Auto-generated"
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      onClick={() => setCompanyCode(generateCode())}
                      className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-all"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>

                {companyCode && (
                  <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                    <p className="text-xs text-gray-400 mb-2">Share this link with your reps:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm font-mono text-primary break-all">
                        t.me/{process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "RepLogAIBot"}?start={companyCode}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "RepLogAIBot"}?start=${companyCode}`
                          );
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <label className="text-sm font-medium text-gray-300">Employee Roster</label>
                </div>
                <p className="text-xs text-gray-500">CSV or tab-separated: Employee ID, Name (one per line)</p>
                <textarea
                  value={rosterText}
                  onChange={(e) => setRosterText(e.target.value)}
                  placeholder={"EMP-001, John Smith\nEMP-002, Jane Doe\nEMP-003, Bob Wilson"}
                  rows={5}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 cursor-pointer transition-all text-sm">
                    <Upload className="w-4 h-4" />
                    {rosterFile ? rosterFile.name : "Upload CSV"}
                    <input
                      type="file"
                      accept=".csv,.txt,.tsv"
                      onChange={(e) => setRosterFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  {employeeCount > 0 && (
                    <span className="text-sm text-green-400">✅ {employeeCount} employees added</span>
                  )}
                </div>
              </div>

              <button
                onClick={handleCompanySetup}
                disabled={loading || !companyName}
                className="w-full py-3.5 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                Complete Setup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24 min-h-screen bg-[#0B0F17]"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>}>
      <OnboardingPageInner />
    </Suspense>
  );
}
