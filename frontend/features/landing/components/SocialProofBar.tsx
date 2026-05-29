"use client"

import { TESTIMONIALS } from "../data"
import TestimonialCard from "./TestimonialCard"

interface SocialProofBarProps {
  isAuthenticated?: boolean
}

export default function SocialProofBar({ isAuthenticated = false }: SocialProofBarProps) {
  if (isAuthenticated) return null

  return (
    <section className="bg-surface-container-low py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-sm font-semibold text-on-surface-variant mb-6 tracking-wide">
          +2.400 personas ya aprenden así
        </p>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden overflow-x-auto snap-x snap-mandatory -mx-6 px-6">
          <div className="flex gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="snap-center shrink-0 w-[280px]">
                <TestimonialCard testimonial={t} />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={i} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  )
}
