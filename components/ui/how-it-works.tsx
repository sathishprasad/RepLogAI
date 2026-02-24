"use client";

import { cn } from "../../lib/utils";
import { Mic, Database, Zap } from "lucide-react";
import type React from "react";

interface HowItWorksProps extends React.HTMLAttributes<HTMLElement> {}

interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
}

const StepCard: React.FC<StepCardProps> = ({
  icon,
  title,
  description,
  benefits,
}) => (
  <div
    className={cn(
      "relative rounded-2xl border border-border bg-white p-6 text-text-primary transition-all duration-300 ease-in-out shadow-sm",
      "hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)] hover:border-primary/30"
    )}
  >
    {/* Icon */}
    <div className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
      {icon}
    </div>
    {/* Title and Description */}
    <h3 className="relative z-10 mb-2 text-xl font-bold">{title}</h3>
    <p className="relative z-10 mb-6 text-muted-text leading-relaxed">{description}</p>
    {/* Benefits List */}
    <ul className="relative z-10 space-y-3">
      {benefits.map((benefit, index) => (
        <li key={index} className="flex items-center gap-3">
          <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
          </div>
          <span className="text-muted-text text-sm font-medium">{benefit}</span>
        </li>
      ))}
    </ul>
  </div>
);

export const HowItWorks: React.FC<HowItWorksProps> = ({
  className,
  ...props
}) => {
  const stepsData = [
    {
      icon: <Mic className="h-6 w-6" />,
      title: "1. Capture",
      description: "Speak your update in seconds. Our voice-first assistant captures all the nuances of your sales meeting on the go.",
      benefits: [
        "No typing required",
        "Captures tone and context",
        "Works seamlessly on mobile"
      ],
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "2. Structure",
      description: "AI automatically extracts key fields like contact info, deal stage, objections, and next steps from your voice note.",
      benefits: [
        "Identifies action items instantly",
        "Maps to custom CRM fields",
        "High accuracy transcription"
      ],
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "3. Sync",
      description: "Your CRM is updated instantly. Tasks are created and summaries are logged without a single keystroke of manual entry.",
      benefits: [
        "Zero manual data entry",
        "Automated follow-up tasks",
        "Real-time pipeline visibility"
      ],
    },
  ];

  return (
    <section
      id="how-it-works"
      className={cn("w-full bg-bg-light py-24", className)}
      {...props}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-text-primary">
            How It Works: AI That Simplifies Data
          </h2>
          <p className="mt-4 text-lg text-muted-text">
            Our AI-driven CRM automates routine work, centralizes customer data, and delivers insights so you can focus on selling.
          </p>
        </div>

        {/* Step Indicators with Connecting Line */}
        <div className="relative mx-auto mb-12 w-full max-w-4xl hidden md:block">
          <div
            aria-hidden="true"
            className="absolute left-[16.6667%] top-1/2 h-px w-[66.6667%] -translate-y-1/2 bg-border"
          ></div>
          <div className="relative grid grid-cols-3">
            {stepsData.map((_, index) => (
              <div
                key={index}
                className="flex h-10 w-10 items-center justify-center justify-self-center rounded-full bg-white font-bold text-primary ring-4 ring-bg-light border border-border z-10 shadow-sm"
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Steps Grid */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
          {stepsData.map((step, index) => (
            <StepCard
              key={index}
              icon={step.icon}
              title={step.title}
              description={step.description}
              benefits={step.benefits}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
