"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X, Mic, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const menuItems = [
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Integrations', href: '#integrations' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Testimonials', href: '#testimonials' },
];

const HeroHeader = () => {
  const [menuState, setMenuState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <nav data-state={menuState && 'active'} className="w-full px-2 group mt-2">
        <div className={cn('mx-auto max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'fixed top-2 left-0 right-0 bg-[#161B26]/80 max-w-4xl rounded-full border border-white/10 backdrop-blur-lg lg:px-5 py-1 z-50')}>
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-2">
            <div className="flex w-full justify-between lg:w-auto">
              <Link href="/" className="flex items-center space-x-2 z-50">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(79,124,255,0.5)]">
                  <Mic className="text-white w-5 h-5" />
                </div>
                <span className="text-white font-bold text-xl tracking-tight">RepLog AI</span>
              </Link>
              <button onClick={() => setMenuState(!menuState)} className="relative z-50 -m-2.5 -mr-4 block p-2.5 lg:hidden text-white">
                <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>
            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm font-medium">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link href={item.href} className="text-gray-300 hover:text-white transition-colors">
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#161B26] group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-white/10 p-6 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0">
              <div className="lg:hidden mt-8">
                <ul className="space-y-6 text-base font-medium">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link href={item.href} onClick={() => setMenuState(false)} className="text-gray-300 hover:text-white block transition-colors">
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-4 sm:space-y-0 md:w-fit items-center mt-6 lg:mt-0">
                <Link href="/auth" className="text-sm font-medium text-gray-300 hover:text-white hidden lg:block">Log in</Link>
                <Button asChild size="sm" className="rounded-full px-6 bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
                  <Link href="/auth"><span>Start Free</span></Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export function HeroSection() {
  return (
    <div className="bg-[#0B0F17] text-white flex flex-col relative overflow-hidden">
      <HeroHeader />

      <section
        id="hero"
        className="relative mx-auto w-full pt-40 px-6 text-center md:px-8 min-h-[calc(100vh-40px)] overflow-hidden flex flex-col items-center justify-center rounded-b-xl"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0B0F17] via-[#101830] to-[#0B0F17] animate-gradient" />

        <div className="absolute -z-10 inset-0 opacity-30 h-[600px] w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:6rem_5rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <div className="absolute left-1/2 top-[calc(100%-90px)] lg:top-[calc(100%-150px)] h-[500px] w-[700px] md:h-[500px] md:w-[1100px] lg:h-[750px] lg:w-[140%] -translate-x-1/2 rounded-[100%] border-t border-primary/40 bg-[#0B0F17] bg-[radial-gradient(closest-side,#0B0F17_82%,#4F7CFF_150%)] shadow-[0_-20px_50px_rgba(79,124,255,0.15)]" />

        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center pb-24">
          <h1 className="animate-fade-in -translate-y-4 text-balance bg-gradient-to-br from-white from-30% to-white/50 bg-clip-text py-6 text-5xl font-bold leading-[1.1] tracking-tight text-transparent opacity-0 sm:text-6xl md:text-7xl lg:text-[5.5rem]" style={{ animationFillMode: "forwards" }}>
            Your CRM Updates Itself <br className="hidden md:block" />
            After Every Meeting.
          </h1>

          <p className="animate-fade-in mb-10 -translate-y-4 text-balance mx-auto max-w-2xl opacity-0 leading-relaxed" style={{ animationDelay: '100ms', animationFillMode: "forwards", fontSize: '20px', color: '#CBD5E1' }}>
            RepLog turns 60-second voice notes into structured CRM entries — deal stage, follow-up tasks, objections, and summaries. Automatically.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 opacity-0 animate-fade-in w-full sm:w-auto mb-8" style={{ animationDelay: '200ms', animationFillMode: "forwards" }}>
            <Button asChild size="lg" className="w-full sm:w-auto h-14 px-10 rounded-full font-semibold tracking-wide text-base shadow-[0_0_20px_rgba(79,124,255,0.3)] hover:shadow-[0_0_30px_rgba(79,124,255,0.5)] hover:scale-105 transition-all">
              <a href="/auth">Start Free — 2 Minute Setup</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto h-14 px-10 rounded-full font-semibold tracking-wide text-base border-white/20 bg-transparent hover:bg-white/10 hover:text-white hover:scale-105 transition-all">
              <a href="/auth">
                Try Free Demo <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
          </div>

          <div className="opacity-0 animate-fade-in flex flex-col items-center gap-3" style={{ animationDelay: '400ms', animationFillMode: "forwards" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/60 to-primary border-2 border-[#0B0F17] flex items-center justify-center text-[10px] font-bold text-white">
                    {["S", "J", "E", "M"][i]}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-300">
                <span className="text-white font-semibold">500+</span> sales teams already onboard
              </p>
            </div>
            <p className="text-sm text-gray-400 tracking-wide">
              Works with Salesforce, HubSpot, Pipedrive, Notion, Slack
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Secure OAuth. SOC2-ready infrastructure.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0B0F17] to-transparent z-20 pointer-events-none" />
      </section>
    </div>
  )
}
