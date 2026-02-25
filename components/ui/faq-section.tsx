"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How does billing work?",
    answer: "You're billed monthly or annually based on your plan. Free plan has no charges. Pro is $49/mo (or $39/mo billed annually). Scale is $29/rep/month (or $23/rep/mo annually). All plans are billed at the start of each cycle.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, absolutely. There are no long-term contracts. You can cancel your subscription at any time from your account settings. Your access continues until the end of your current billing period.",
  },
  {
    question: "How is my data protected?",
    answer: "We use enterprise-grade encryption (AES-256 at rest, TLS 1.3 in transit), SOC2-ready infrastructure, and secure OAuth connections. Your voice data is processed and never stored after extraction.",
  },
  {
    question: "Which CRMs do you support?",
    answer: "We currently support Salesforce, HubSpot, Pipedrive, and Notion with native integrations. Slack integration is available for notifications and summaries. More CRMs are added regularly.",
  },
  {
    question: "How long does setup take?",
    answer: "Most teams are up and running in under 2 minutes. Just connect your CRM via OAuth, invite your reps, and start recording voice notes. No IT involvement or complex configuration required.",
  },
  {
    question: "What happens to my voice recordings?",
    answer: "Voice notes are transcribed and processed in real-time, then immediately deleted from our servers. We never store raw audio. Only the extracted structured data (deal updates, tasks, summaries) is saved to your CRM.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-28 bg-[#0B0F17] border-y border-white/10">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border border-white/10 bg-[#161B26] overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
              >
                <span className="font-semibold text-white">{faq.question}</span>
                <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-4", openIndex === index && "rotate-180")} />
              </button>
              <div className={cn("overflow-hidden transition-all duration-300", openIndex === index ? "max-h-40 pb-5 px-5" : "max-h-0")}>
                <p className="text-gray-400 leading-relaxed text-sm">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
