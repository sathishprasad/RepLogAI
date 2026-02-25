"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FaSlack, FaGoogle, FaChartBar
} from "react-icons/fa";
import {
  SiNotion, SiSalesforce, SiHubspot
} from "react-icons/si";
import { Mic, Zap, Database, BarChart3, Users, Shield, Calendar, MessageSquare } from "lucide-react";

const orbitIcons = [
  { type: "react-icon" as const, Icon: SiSalesforce, color: "#00A1E0" },
  { type: "lucide" as const, LIcon: Zap, color: "#4F7CFF" },
  { type: "react-icon" as const, Icon: SiHubspot, color: "#FF7A59" },
  { type: "lucide" as const, LIcon: Database, color: "#4F7CFF" },
  { type: "react-icon" as const, Icon: SiNotion, color: "#FFFFFF" },
  { type: "lucide" as const, LIcon: Users, color: "#4F7CFF" },
  { type: "react-icon" as const, Icon: FaSlack, color: "#E01E5A" },
  { type: "lucide" as const, LIcon: BarChart3, color: "#4F7CFF" },
  { type: "react-icon" as const, Icon: FaGoogle, color: "#4285F4" },
  { type: "lucide" as const, LIcon: Shield, color: "#4F7CFF" },
  { type: "react-icon" as const, Icon: FaChartBar, color: "#10B981" },
  { type: "lucide" as const, LIcon: Calendar, color: "#4F7CFF" },
  { type: "lucide" as const, LIcon: MessageSquare, color: "#4F7CFF" },
];

export default function StackFeatureSection() {
  const orbitCount = 3;
  const orbitGap = 8;
  const iconsPerOrbit = Math.ceil(orbitIcons.length / orbitCount);

  return (
    <section className="relative w-full bg-[#0B0F17] overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-24 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Ready?</p>
          <h2 className="text-3xl sm:text-5xl font-bold mb-4 text-white leading-tight">
            Stop Updating CRM <br className="hidden sm:block" />Manually.
          </h2>
          <p className="text-gray-400 mb-8 max-w-md text-lg leading-relaxed mx-auto lg:mx-0">
            Join teams using RepLog AI to turn voice notes into structured CRM entries. Set up in 2 minutes.
          </p>
          <Button asChild size="lg" className="rounded-full px-10 h-14 font-semibold text-base shadow-[0_0_20px_rgba(79,124,255,0.3)] hover:shadow-[0_0_30px_rgba(79,124,255,0.5)] hover:scale-105 transition-all">
            <Link href="/auth">Start Free — No Credit Card</Link>
          </Button>
        </div>

        <div className="relative w-[28rem] h-[28rem] lg:w-[34rem] lg:h-[34rem] flex-shrink-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-[#161B26] border border-white/10 shadow-[0_0_30px_rgba(79,124,255,0.2)] flex items-center justify-center">
            <Mic className="w-8 h-8 text-primary" />
          </div>

          {[...Array(orbitCount)].map((_, orbitIdx) => {
            const size = `${10 + orbitGap * (orbitIdx + 1)}rem`;
            const icons = orbitIcons.slice(
              orbitIdx * iconsPerOrbit,
              orbitIdx * iconsPerOrbit + iconsPerOrbit
            );
            const angleStep = (2 * Math.PI) / icons.length;

            return (
              <div
                key={orbitIdx}
                className="absolute rounded-full border border-dashed border-white/10"
                style={{
                  width: size,
                  height: size,
                  animation: `${orbitIdx % 2 === 0 ? 'spin-orbit' : 'spin-orbit-reverse'} ${18 + orbitIdx * 8}s linear infinite`,
                }}
              >
                {icons.map((cfg, iconIdx) => {
                  const angle = iconIdx * angleStep;
                  const x = 50 + 50 * Math.cos(angle);
                  const y = 50 + 50 * Math.sin(angle);

                  return (
                    <div
                      key={iconIdx}
                      className="absolute bg-[#161B26] border border-white/10 rounded-full p-2 shadow-md"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: "translate(-50%, -50%)",
                        animation: `${orbitIdx % 2 === 0 ? 'spin-orbit-reverse' : 'spin-orbit'} ${18 + orbitIdx * 8}s linear infinite`,
                      }}
                    >
                      {cfg.type === "react-icon" && cfg.Icon ? (
                        <cfg.Icon className="w-6 h-6" style={{ color: cfg.color }} />
                      ) : cfg.type === "lucide" && cfg.LIcon ? (
                        <cfg.LIcon className="w-6 h-6" style={{ color: cfg.color }} />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
