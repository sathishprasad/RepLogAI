"use client";

import { X, Check } from "lucide-react";

export function PainSection() {
  const before = [
    "Friday night CRM updates",
    "Missed follow-ups and lost deals",
    "Messy, inconsistent notes",
  ];
  const after = [
    "Instant updates after every call",
    "Auto-scheduled follow-up tasks",
    "Clean pipeline visibility",
  ];

  return (
    <section className="py-28 bg-bg-light">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary mb-4">
            Close Deals. Not Admin Work.
          </h2>
          <p className="text-lg text-muted-text max-w-2xl mx-auto">
            Sales reps spend <span className="font-bold text-text-primary">6–10 hours/week</span> updating their CRM.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-14">
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8">
            <h3 className="text-lg font-bold text-red-600 mb-6 flex items-center gap-2">
              <X className="w-5 h-5" /> Before RepLog
            </h3>
            <ul className="space-y-4">
              {before.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                    <X className="w-3 h-3 text-red-500" />
                  </div>
                  <span className="text-text-primary">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8">
            <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
              <Check className="w-5 h-5" /> After RepLog
            </h3>
            <ul className="space-y-4">
              {after.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-text-primary">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
