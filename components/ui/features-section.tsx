"use client";

import { Mic, Zap, Database } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: <Mic className="w-5 h-5" />,
    label: "Speak",
    bullets: [
      "Record a 60-second voice note after any meeting",
      "Works on the go, from your phone or desktop",
      "No templates, no typing — just talk",
    ],
    highlighted: false,
  },
  {
    num: "02",
    icon: <Zap className="w-5 h-5" />,
    label: "AI Extracts",
    bullets: [
      "AI pulls deal stage, contacts, and objections",
      "Follow-up tasks are captured automatically",
      "Custom fields mapped to your CRM schema",
    ],
    highlighted: true,
  },
  {
    num: "03",
    icon: <Database className="w-5 h-5" />,
    label: "CRM Updates",
    bullets: [
      "Your CRM is updated instantly — zero manual entry",
      "Pipeline stays clean without manager follow-ups",
      "Full audit trail of every voice note",
    ],
    highlighted: false,
  },
];

export function FeaturesSection() {
  return (
    <section id="how-it-works" className="bg-bg-light">
      <div className="py-28">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold md:text-4xl text-text-primary tracking-tight max-w-3xl mx-auto">
              <span className="text-muted-text">Sales reps spend 6–10 hours/week on CRM.</span>{" "}
              RepLog fixes that in 3 steps.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-stretch">
            <div className="lg:col-span-3 flex flex-col">
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#161B26] flex-1 flex flex-col shadow-lg">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-[#1A1F2E]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-gray-400 font-mono">replog.ai — demo</span>
                  </div>
                </div>
                <div id="demo" className="flex-1 flex items-center bg-black">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full"
                    src="/replog-demo.mov"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col justify-between relative">
              <div className="absolute left-[1.65rem] top-[3.5rem] bottom-[4rem] w-px border-l-2 border-dashed border-primary/20" />

              <div className="space-y-6">
                {steps.map((s, i) => (
                  <div
                    key={i}
                    className={`relative rounded-2xl p-5 transition-all ${
                      s.highlighted
                        ? "bg-white border border-primary/30 shadow-[0_4px_24px_rgba(79,124,255,0.12)] ring-1 ring-primary/10"
                        : "bg-white border border-border/60 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        s.highlighted
                          ? "bg-primary text-white shadow-[0_0_12px_rgba(79,124,255,0.3)]"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {s.num}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-text-primary leading-tight">{s.label}</h3>
                        <ul className="mt-2 space-y-1">
                          {s.bullets.map((b, bi) => (
                            <li key={bi} className="text-sm text-muted-text leading-relaxed flex items-start gap-2">
                              <span className="text-primary mt-1 text-[8px]">●</span>
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted-text italic mt-6 text-center">Done before you leave the parking lot.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
