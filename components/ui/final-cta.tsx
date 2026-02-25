"use client";

import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="py-28 bg-[#0B0F17] text-white text-center border-t border-white/10">
      <div className="max-w-[800px] mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
          Ready to Stop Updating <br className="hidden md:block" /> CRM Manually?
        </h2>
        <Button asChild size="lg" className="h-14 px-10 rounded-full font-semibold tracking-wide text-base shadow-[0_0_20px_rgba(79,124,255,0.3)] hover:shadow-[0_0_30px_rgba(79,124,255,0.5)] hover:scale-105 transition-all mt-4">
          <a href="/auth">Start Free — No Credit Card Required</a>
        </Button>
      </div>
    </section>
  );
}
