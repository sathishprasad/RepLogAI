"use client";

import { cn } from "../../lib/utils";
import { Mic, Zap, Database } from "lucide-react";
import type React from "react";

interface HowItWorksProps extends React.HTMLAttributes<HTMLElement> {}

export const HowItWorks: React.FC<HowItWorksProps> = ({ className, ...props }) => {
  const steps = [
    { icon: <Mic className="h-6 w-6" />, label: "Speak", description: "Record a 60-second voice note after any meeting." },
    { icon: <Zap className="h-6 w-6" />, label: "AI Extracts", description: "AI pulls deal stage, contacts, objections, and next steps.", highlighted: true },
    { icon: <Database className="h-6 w-6" />, label: "CRM Updates Instantly", description: "Your CRM is updated with zero manual entry." },
  ];

  return (
    <section id="how-it-works" className={cn("w-full bg-bg-light py-28", className)} {...props}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-text-primary">
            How It Works
          </h2>
          <p className="mt-2 text-lg text-muted-text">Three steps. Zero typing.</p>
        </div>

        <div className="relative mx-auto max-w-5xl">
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-px bg-border -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className={cn(
                  "relative rounded-2xl border bg-white p-8 text-center transition-all duration-300 hover:-translate-y-1",
                  step.highlighted
                    ? "border-primary shadow-[0_0_25px_rgba(79,124,255,0.15)] scale-[1.02]"
                    : "border-border shadow-sm hover:shadow-md"
                )}
              >
                <div className={cn(
                  "mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl",
                  step.highlighted
                    ? "bg-primary text-white shadow-[0_0_15px_rgba(79,124,255,0.3)]"
                    : "bg-primary/10 text-primary border border-primary/20"
                )}>
                  {step.icon}
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Step {index + 1}</div>
                <h3 className="text-xl font-bold text-text-primary mb-3">{step.label}</h3>
                <p className="text-muted-text leading-relaxed text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center mt-12 text-lg font-medium text-muted-text italic">
          Done before you leave the parking lot.
        </p>
      </div>
    </section>
  );
};
