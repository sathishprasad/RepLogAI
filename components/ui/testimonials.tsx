"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  company: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "Our CRM compliance went from 40% to 98% in the first month. Reps actually enjoy updating their pipeline now.",
    name: "Sarah Mitchell",
    title: "VP of Sales",
    company: "CloudReach Solutions",
  },
  {
    quote: "I save 7 hours a week on admin work. That's 7 more hours of selling. RepLog paid for itself in the first week.",
    name: "James Rodriguez",
    title: "Senior Account Executive",
    company: "Nextera Group",
  },
  {
    quote: "Forecast accuracy improved 25% because every deal is updated in real-time. No more guessing on pipeline reviews.",
    name: "Emily Chen",
    title: "Director of Revenue Operations",
    company: "ScaleWorks Inc.",
  },
];

function Stars() {
  return (
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <div>
      <div className="text-center mb-14">
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Testimonials</p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary mb-4">
          Loved by Top Sales Teams
        </h2>
        <p className="text-muted-text text-lg max-w-2xl mx-auto">
          See how RepLog AI is saving hours of admin work for reps everywhere.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
            className="rounded-2xl border border-border bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20"
          >
            <Stars />
            <p className="text-text-primary leading-relaxed mb-6 text-[15px]">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div>
              <p className="font-semibold text-text-primary">{t.name}</p>
              <p className="text-sm text-muted-text">{t.title}, {t.company}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
