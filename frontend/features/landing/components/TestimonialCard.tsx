import { Star } from "lucide-react"

interface Testimonial {
  name: string
  city: string
  level: string
  quote: string
}

export default function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10">
      <div className="flex text-amber-400 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4" fill="currentColor" />
        ))}
      </div>
      <p className="text-sm text-on-surface leading-relaxed mb-4 italic">
        &quot;{testimonial.quote}&quot;
      </p>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
          {testimonial.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-on-surface">{testimonial.name}</p>
          <p className="text-xs text-on-surface-variant">
            {testimonial.city} · {testimonial.level}
          </p>
        </div>
      </div>
    </div>
  )
}
