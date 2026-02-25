"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Check, Mic } from 'lucide-react';
import { HeroSection } from "@/components/ui/hero-section";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";

const FeaturesSection = dynamic(() => import("@/components/ui/features-section").then(m => ({ default: m.FeaturesSection })), { ssr: true });
const Testimonials = dynamic(() => import("@/components/ui/testimonials").then(m => ({ default: m.Testimonials })), { ssr: true });
const FAQSection = dynamic(() => import("@/components/ui/faq-section").then(m => ({ default: m.FAQSection })), { ssr: true });
const StackFeatureSection = dynamic(() => import("@/components/ui/stack-feature-section"), { ssr: true });

function SalesforceLogo() {
  return (
    <svg viewBox="0 0 100 70" className="h-8 w-auto" fill="currentColor">
      <path d="M41.7 10.6c3.5-3.6 8.3-5.9 13.7-5.9 6.8 0 12.8 3.6 16.1 9 2.9-1.3 6.1-2 9.5-2C92.6 11.7 102 21.3 102 33.1s-9.4 21.4-21 21.4c-1.5 0-3-.2-4.4-.5-2.9 4.8-8.2 8-14.2 8-2.7 0-5.3-.7-7.5-1.8-2.9 5.8-8.9 9.8-15.8 9.8-7.6 0-14.1-4.8-16.6-11.5-1.3.3-2.7.4-4.1.4C8.2 58.9 0 50.5 0 40.1c0-7.3 4.2-13.6 10.3-16.8-.5-1.7-.8-3.6-.8-5.5C9.5 8 17.3 0 26.9 0c5.8 0 11 2.9 14.1 7.3l.7 3.3z" opacity="0.7"/>
    </svg>
  );
}

function HubSpotLogo() {
  return (
    <svg viewBox="0 0 100 100" className="h-8 w-auto" fill="currentColor">
      <path d="M72.5 38.3V25.8c2.8-1.5 4.7-4.5 4.7-7.9 0-4.9-4-8.9-8.9-8.9s-8.9 4-8.9 8.9c0 3.4 1.9 6.4 4.7 7.9v12.5c-4.2.9-8 3-11 5.9L27.4 25.4c.3-1.1.5-2.3.5-3.5 0-7-5.7-12.7-12.7-12.7S2.5 14.9 2.5 21.9s5.7 12.7 12.7 12.7c2.3 0 4.4-.6 6.3-1.7l25.3 18.5c-2.4 3.5-3.8 7.8-3.8 12.4 0 12.1 9.8 21.9 21.9 21.9s21.9-9.8 21.9-21.9c0-10.5-7.4-19.3-17.3-21.4zM64.9 76.6c-7.3 0-13.2-5.9-13.2-13.2s5.9-13.2 13.2-13.2 13.2 5.9 13.2 13.2-5.9 13.2-13.2 13.2z" opacity="0.7"/>
    </svg>
  );
}

function PipedriveLogo() {
  return (
    <svg viewBox="0 0 100 100" className="h-8 w-auto" fill="currentColor">
      <path d="M50 5C25.1 5 5 25.1 5 50s20.1 45 45 45 45-20.1 45-45S74.9 5 50 5zm0 70c-13.8 0-25-11.2-25-25s11.2-25 25-25 25 11.2 25 25-11.2 25-25 25zm0-40c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15z" opacity="0.7"/>
    </svg>
  );
}

function SlackLogo() {
  return (
    <svg viewBox="0 0 100 100" className="h-8 w-auto" fill="currentColor">
      <path d="M21.9 62.7c0 5.5-4.5 10-10 10s-10-4.5-10-10 4.5-10 10-10h10v10zm5 0c0-5.5 4.5-10 10-10s10 4.5 10 10v25c0 5.5-4.5 10-10 10s-10-4.5-10-10v-25zM36.9 21.9c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10v10h-10zm0 5c5.5 0 10 4.5 10 10s-4.5 10-10 10h-25c-5.5 0-10-4.5-10-10s4.5-10 10-10h25zM77.7 36.9c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10h-10v-10zm-5 0c0 5.5-4.5 10-10 10s-10-4.5-10-10v-25c0-5.5 4.5-10 10-10s10 4.5 10 10v25zM62.7 77.7c5.5 0 10 4.5 10 10s-4.5 10-10 10-10-4.5-10-10v-10h10zm0-5c-5.5 0-10-4.5-10-10s4.5-10 10-10h25c5.5 0 10 4.5 10 10s-4.5 10-10 10h-25z" opacity="0.7"/>
    </svg>
  );
}

function NotionLogo() {
  return (
    <svg viewBox="0 0 100 100" className="h-8 w-auto" fill="currentColor">
      <path d="M17.5 8.2l48.7-3.6c6 .5 7.5.2 11.2 2.9l15.5 10.8c2.5 1.8 3.4 2.3 3.4 4.3v60.9c0 3.8-1.4 6-6.2 6.3l-56.6 3.3c-3.6.2-5.3-.4-7.1-2.7L11.9 71.5c-2.1-2.9-3-5.1-3-7.7V14.1c0-3.3 1.4-5.6 5.3-5.9h3.3zm51.1 10.6c0 1.7-.2 3.1-2 3.3l-2.7.5v45c-2.3 1.2-4.5 1.9-6.3 1.9-2.9 0-3.6-.9-5.8-3.6L33.3 35v29.7l5.6 1.3s0 3.1-4.3 3.1l-11.9.7c-.4-.7 0-2.5 1.2-2.8l3.1-.8V27.3l-4.3-.4c-.4-1.7.6-4.2 3.4-4.4l12.8-.8 19.5 29.8V24.4l-4.7-.5c-.4-2 1-3.4 2.9-3.6l12.8-.7.1 9.2z" opacity="0.7"/>
    </svg>
  );
}

function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  const proMonthly = 49;
  const proAnnual = Math.round(proMonthly * 0.8);
  const scaleMonthly = 29;
  const scaleAnnual = Math.round(scaleMonthly * 0.8);

  return (
    <section id="pricing" className="py-28 bg-bg-light px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 tracking-tight">Pricing Built for Growth</h2>
          <p className="text-muted-text text-lg max-w-2xl mx-auto">Simple, transparent pricing. No hidden fees.</p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-14">
          <span className={cn("text-sm font-medium transition-colors", !isAnnual ? "text-text-primary" : "text-muted-text")}>Monthly</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={cn(
              "relative w-14 h-7 rounded-full transition-colors duration-300",
              isAnnual ? "bg-primary" : "bg-gray-300"
            )}
          >
            <div className={cn(
              "absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300",
              isAnnual && "translate-x-7"
            )} />
          </button>
          <span className={cn("text-sm font-medium transition-colors", isAnnual ? "text-text-primary" : "text-muted-text")}>
            Annual <span className="text-primary font-semibold text-xs ml-1">Save 20%</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Free */}
          <div className="bg-white rounded-2xl p-8 border border-border shadow-sm hover:-translate-y-1 transition-transform">
            <h3 className="text-xl font-semibold text-text-primary mb-1">Free</h3>
            <div className="text-3xl font-bold text-text-primary mb-1">$0<span className="text-sm text-muted-text font-normal">/mo</span></div>
            <p className="text-sm text-muted-text mb-6">For individuals getting started</p>
            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary flex-shrink-0" /> Up to 3 reps</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary flex-shrink-0" /> 10 updates/day per rep</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary flex-shrink-0" /> Core CRM sync</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary flex-shrink-0" /> 1 integration</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary flex-shrink-0" /> Community support</li>
            </ul>
            <a href="/auth" className="block w-full bg-muted-surface text-text-primary hover:bg-gray-200 rounded-full py-3 font-semibold transition-all text-center hover:scale-105 duration-200">Get Started Free</a>
          </div>

          {/* Pro */}
          <div className="bg-white rounded-2xl p-8 border-2 border-primary shadow-xl relative transform md:-translate-y-4 hover:-translate-y-5 transition-transform">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Most Popular</div>
            <h3 className="text-2xl font-bold text-text-primary mb-1">Pro</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold text-text-primary">${isAnnual ? proAnnual : proMonthly}</span>
              <span className="text-lg text-muted-text font-normal">/mo</span>
              {isAnnual && <span className="text-xs text-primary font-medium ml-2 line-through decoration-muted-text">${proMonthly}/mo</span>}
            </div>
            <p className="text-sm text-muted-text mb-6">{isAnnual ? "Billed annually" : "14-day free trial included"}</p>
            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary flex-shrink-0" /> Up to 10 reps</li>
              <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary flex-shrink-0" /> Unlimited updates</li>
              <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary flex-shrink-0" /> All integrations</li>
              <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary flex-shrink-0" /> Analytics dashboard</li>
              <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary flex-shrink-0" /> Priority support</li>
            </ul>
            <a href="/auth" className="block w-full bg-primary hover:bg-primary-hover text-white rounded-full py-3.5 font-semibold transition-all animate-subtle-pulse hover:shadow-[0_6px_20px_rgba(79,124,255,0.23)] hover:scale-105 duration-200 text-center">Start Free Trial</a>
          </div>

          {/* Scale */}
          <div className="bg-white rounded-2xl p-8 border border-border shadow-sm hover:-translate-y-1 transition-transform">
            <h3 className="text-xl font-semibold text-text-primary mb-1">Scale</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold text-text-primary">${isAnnual ? scaleAnnual : scaleMonthly}</span>
              <span className="text-sm text-muted-text font-normal">/rep/mo</span>
              {isAnnual && <span className="text-xs text-primary font-medium ml-2 line-through decoration-muted-text">${scaleMonthly}/rep/mo</span>}
            </div>
            <p className="text-sm text-muted-text mb-6">{isAnnual ? "Billed annually" : "For teams of 11+ reps"}</p>
            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary flex-shrink-0" /> Everything in Pro</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary flex-shrink-0" /> Dedicated account manager</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary flex-shrink-0" /> SSO login</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary flex-shrink-0" /> Advanced analytics</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary flex-shrink-0" /> Custom onboarding & SLA</li>
            </ul>
            <a href="#" className="block w-full bg-muted-surface text-text-primary hover:bg-gray-200 rounded-full py-3 font-semibold transition-all text-center hover:scale-105 duration-200">Book a Demo</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg-light text-text-primary overflow-hidden">
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Features (How It Works + Demo + Before/After) */}
      <FadeIn>
        <FeaturesSection />
      </FadeIn>

      {/* 3. Integrations */}
      <FadeIn>
        <section id="integrations" className="py-28 bg-[#0B0F17] text-white border-y border-white/10 text-center">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">One Assistant. Every CRM.</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-16">No switching required. Takes 60 seconds to connect.</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 mb-12 text-white/70">
              <div className="flex flex-col items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <SalesforceLogo />
                <span className="text-sm font-medium">Salesforce</span>
              </div>
              <div className="flex flex-col items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <HubSpotLogo />
                <span className="text-sm font-medium">HubSpot</span>
              </div>
              <div className="flex flex-col items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <PipedriveLogo />
                <span className="text-sm font-medium">Pipedrive</span>
              </div>
              <div className="flex flex-col items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <SlackLogo />
                <span className="text-sm font-medium">Slack</span>
              </div>
              <div className="flex flex-col items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <NotionLogo />
                <span className="text-sm font-medium">Notion</span>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* 4. Pricing */}
      <FadeIn>
        <PricingSection />
      </FadeIn>

      {/* 5. FAQ (dark, separate from pricing) */}
      <FAQSection />

      {/* 6. Testimonials */}
      <FadeIn>
        <section id="testimonials" className="py-28 bg-bg-light px-6">
          <div className="max-w-[1200px] mx-auto">
            <Testimonials />
          </div>
        </section>
      </FadeIn>

      {/* 7. Final CTA with Orbit Animation */}
      <FadeIn>
        <section className="bg-[#0B0F17] border-t border-white/10">
          <StackFeatureSection />
        </section>
      </FadeIn>

      {/* 8. Footer */}
      <FadeIn>
        <footer className="bg-surface py-16 border-t border-border px-6 text-text-primary">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Mic className="text-white w-5 h-5" />
                </div>
                <span className="font-bold text-xl">RepLog AI</span>
              </div>
              <p className="text-muted-text text-sm leading-relaxed">The intelligent voice assistant that bridges the gap between sales conversations and CRM data.</p>
            </div>
            <div className="col-span-1">
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-muted-text">
                <li><a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
                <li><a href="#integrations" className="hover:text-primary transition-colors">Integrations</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div className="col-span-1">
              <h4 className="font-bold mb-6">Resources</h4>
              <ul className="space-y-4 text-sm text-muted-text">
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Sales Guides</a></li>
              </ul>
            </div>
            <div className="col-span-1">
              <h4 className="font-bold mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-muted-text">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-[1200px] mx-auto mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between text-sm text-muted-text">
            <p>© {new Date().getFullYear()} RepLog AI. All rights reserved.</p>
          </div>
        </footer>
      </FadeIn>
    </main>
  );
}
