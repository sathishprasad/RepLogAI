"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"

interface Testimonial {
  image: string
  name: string
  username: string
  text: string
  social: string
}

interface TestimonialsProps {
  testimonials: Testimonial[]
  className?: string
  title?: string
  description?: string
  maxDisplayed?: number
}

export function Testimonials({
  testimonials,
  className,
  title = "Loved by top sales teams",
  description = "See how RepLog AI is saving hours of admin work for reps everywhere.",
  maxDisplayed = 6,
}: TestimonialsProps) {
  const [showAll, setShowAll] = useState(false)

  const openInNewTab = (url: string) => {
    window.open(url, "_blank")?.focus()
  }

  return (
    <div className={className}>
      <div className="flex flex-col items-center justify-center pt-5">
        <div className="flex flex-col gap-4 mb-12">
          <h2 className="text-center text-3xl md:text-4xl font-bold tracking-tight text-white">{title}</h2>
          <p className="text-center text-text-light max-w-2xl mx-auto text-lg">
            {description.split("<br />").map((line, i) => (
              <span key={i}>
                {line}
                {i !== description.split("<br />").length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>
      </div>

      <div className="relative">
        <div
          className={cn(
            "flex justify-center items-start gap-6 flex-wrap",
            !showAll &&
              testimonials.length > maxDisplayed &&
              "max-h-[700px] overflow-hidden",
          )}
        >
          {testimonials
            .slice(0, showAll ? undefined : maxDisplayed)
            .map((testimonial, index) => (
              <Card
                key={index}
                className="w-[340px] h-auto p-6 relative hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="flex items-center mb-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover h-12 w-12 border border-white/10"
                  />
                  <div className="flex flex-col pl-4">
                    <span className="font-semibold text-base text-white leading-tight">
                      {testimonial.name}
                    </span>
                    <span className="text-sm text-primary mt-0.5">
                      {testimonial.username}
                    </span>
                  </div>
                </div>
                <div className="mb-2">
                  <p className="text-text-light font-medium leading-relaxed">
                    "{testimonial.text}"
                  </p>
                </div>
                <button
                  onClick={() => openInNewTab(testimonial.social)}
                  className="absolute top-6 right-6 hover:text-primary transition-colors text-white/30"
                >
                  <Icons.twitter className="h-4 w-4" aria-hidden="true" />
                </button>
              </Card>
            ))}
        </div>

        {testimonials.length > maxDisplayed && !showAll && (
          <>
            <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-bg-dark to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
              <Button variant="outline" className="rounded-full px-8 py-6 font-semibold border-white/20 hover:bg-white/10 text-white shadow-xl" onClick={() => setShowAll(true)}>
                Load More Testimonials
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
