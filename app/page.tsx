import React from 'react';
import { Database, BarChart3, Shield, Check, MessageSquare, Mic } from 'lucide-react';
import { HeroSection } from "@/components/ui/hero-section";
import { Testimonials } from "@/components/ui/testimonials";
import { HowItWorks } from "@/components/ui/how-it-works";
import { FadeIn } from "@/components/ui/fade-in";

const tData = [
  { image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1780&auto=format&fit=crop', text: 'RepLog AI has completely transformed how I manage my pipeline. No more late Friday data entry!', name: 'Alice Johnson', username: '@alicejohnson', social: '#' },
  { image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1780&auto=format&fit=crop', text: 'The voice transcription accuracy is incredible. It even catches my specific deal stages.', name: 'David Smith', username: '@davidsmith', social: '#' },
  { image: 'https://i.imgur.com/kaDy9hV.jpeg', text: 'I literally speak into my phone after a client meeting, and my CRM is updated instantly. Magic.', name: 'Emma Brown', username: '@emmabrown', social: '#' },
  { image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1780&auto=format&fit=crop', text: 'Our sales team adopted it in a day. We have 100% CRM compliance now without nagging anyone.', name: 'James Wilson', username: '@jameswilson', social: '#' },
  { image: 'https://i.imgur.com/TQIqsob.png', text: 'Implementing this voice assistant was a game-changer for our team. Forecast accuracy is up 20%!', name: 'Sophia Lee', username: '@sophialee', social: '#' },
  { image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1780&auto=format&fit=crop', text: 'The best part is how it automatically creates follow-up tasks. I never drop the ball on a prospect.', name: 'Emily Chen', username: '@emilychen', social: '#' },
  { image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1780&auto=format&fit=crop', text: 'The integration with Salesforce is seamless. It maps my spoken notes to custom fields perfectly.', name: 'Robert Lee', username: '@robertlee', social: '#' },
  { image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1780&auto=format&fit=crop', text: 'Saved me at least 5 hours a week in admin work. I can focus on closing deals instead of typing.', name: 'Sarah Taylor', username: '@sarahtaylor', social: '#' }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg-light text-text-primary overflow-hidden">
      {/* 1. Hero (Dark) */}
      <HeroSection />

      {/* 2. How It Works (Light) */}
      <FadeIn>
        <HowItWorks />
      </FadeIn>

      {/* 3. Integrations (Dark) */}
      <FadeIn>
        <section id="integrations" className="py-24 bg-[#0B0F17] text-white border-y border-white/10 text-center">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">One Assistant. Every CRM.</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-16">Effortlessly connect your essential tools and consolidate your business operations into a single, intelligent hub.</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 mb-12">
              <div className="flex items-center gap-3 text-xl font-bold text-gray-500 hover:text-white transition-colors cursor-pointer"><Database className="w-8 h-8"/> Salesforce</div>
              <div className="flex items-center gap-3 text-xl font-bold text-gray-500 hover:text-white transition-colors cursor-pointer"><BarChart3 className="w-8 h-8"/> HubSpot</div>
              <div className="flex items-center gap-3 text-xl font-bold text-gray-500 hover:text-white transition-colors cursor-pointer"><Database className="w-8 h-8"/> Pipedrive</div>
              <div className="flex items-center gap-3 text-xl font-bold text-gray-500 hover:text-white transition-colors cursor-pointer"><MessageSquare className="w-8 h-8"/> Slack</div>
              <div className="flex items-center gap-3 text-xl font-bold text-gray-500 hover:text-white transition-colors cursor-pointer"><Shield className="w-8 h-8"/> Notion</div>
            </div>
            <button className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-full px-8 py-3.5 font-semibold transition-all">View Integrations</button>
          </div>
        </section>
      </FadeIn>

      {/* 4. Pricing (Light) */}
      <FadeIn>
        <section id="pricing" className="py-24 bg-bg-light px-6">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 tracking-tight">Pricing Built for Growth</h2>
              <p className="text-muted-text text-lg max-w-2xl mx-auto">Flexible plans tailored for your team's needs.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="bg-white rounded-2xl p-8 border border-border shadow-sm hover:-translate-y-1 transition-transform">
                <h3 className="text-xl font-semibold text-text-primary mb-2">Starter</h3>
                <div className="text-3xl font-bold text-text-primary mb-6">$29<span className="text-sm text-muted-text font-normal">/mo</span></div>
                <ul className="space-y-4 mb-8 text-sm">
                  <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> Core CRM tools</li>
                  <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> Standard email support</li>
                  <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> Up to 3 team members</li>
                </ul>
                <a href="/auth" className="block w-full bg-muted-surface text-text-primary hover:bg-gray-200 rounded-full py-2.5 font-semibold transition-colors text-center">Choose Starter</a>
              </div>
              <div className="bg-white rounded-2xl p-8 border-2 border-primary shadow-xl relative transform md:-translate-y-4 hover:-translate-y-5 transition-transform">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Most Popular</div>
                <h3 className="text-2xl font-bold text-text-primary mb-2">Pro</h3>
                <div className="text-4xl font-bold text-text-primary mb-6">$79<span className="text-lg text-muted-text font-normal">/mo</span></div>
                <ul className="space-y-4 mb-8 text-sm">
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary" /> Unlimited voice minutes</li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary" /> Advanced integrations</li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary" /> Custom automation rules</li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary" /> Priority support</li>
                </ul>
                <a href="/auth" className="block w-full bg-primary hover:bg-primary-hover text-white rounded-full py-3 font-semibold transition-all shadow-[0_4px_14px_0_rgba(79,124,255,0.39)] hover:shadow-[0_6px_20px_rgba(79,124,255,0.23)] text-center">Get Started</a>
              </div>
              <div className="bg-white rounded-2xl p-8 border border-border shadow-sm hover:-translate-y-1 transition-transform">
                <h3 className="text-xl font-semibold text-text-primary mb-2">Business</h3>
                <div className="text-3xl font-bold text-text-primary mb-6">Custom</div>
                <ul className="space-y-4 mb-8 text-sm">
                  <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> Dedicated success manager</li>
                  <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> Unlimited pipelines</li>
                  <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> Advanced team roles</li>
                </ul>
                <a href="/auth" className="block w-full bg-muted-surface text-text-primary hover:bg-gray-200 rounded-full py-2.5 font-semibold transition-colors text-center">Contact Sales</a>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* 5. Testimonials (Dark) */}
      <FadeIn>
        <section id="testimonials" className="py-24 bg-[#0B0F17] text-white px-6 border-y border-white/10">
          <div className="max-w-[1200px] mx-auto">
            <Testimonials testimonials={tData} />
          </div>
        </section>
      </FadeIn>

      {/* 6. Footer (Light) */}
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
            <p>© 2026 RepLog AI. All rights reserved.</p>
          </div>
        </footer>
      </FadeIn>
    </main>
  );
}
