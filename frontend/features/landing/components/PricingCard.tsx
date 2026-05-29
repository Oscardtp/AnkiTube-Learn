import { CheckCircle2, Lock } from "lucide-react"

interface PricingFeature {
  text: string
  included: boolean
}

interface PricingCardProps {
  name: string
  identity: string
  identityColor: string
  price: string
  period: string
  tagline: string
  features: PricingFeature[]
  cta: string
  ctaStyle: "primary" | "secondary"
  featured: boolean
}

export default function PricingCard({
  name,
  identity,
  identityColor,
  price,
  period,
  tagline,
  features,
  cta,
  ctaStyle,
  featured,
}: PricingCardProps) {
  return (
    <div
      className={`bg-surface-container-lowest rounded-3xl p-8 flex flex-col relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-on-surface/5 ${
        featured ? "border-2 border-primary" : ""
      }`}
      style={{ boxShadow: "0 8px 24px rgba(25, 28, 30, 0.06)" }}
    >
      {/* Badge "Más popular" */}
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg z-10 whitespace-nowrap">
          Más popular
        </div>
      )}

      {/* Identity label */}
      <div
        className="text-xs font-semibold uppercase tracking-widest mb-2"
        style={{ color: identityColor }}
      >
        {identity}
      </div>

      {/* Plan name */}
      <h3 className="text-xl font-bold text-on-surface mb-2">{name}</h3>

      {/* Price */}
      <div className="flex items-baseline gap-1 mb-2">
        <span className={`text-4xl font-extrabold ${featured ? "text-primary" : "text-on-surface"}`}>
          {price}
        </span>
        <span className="text-on-surface-variant text-sm">{period}</span>
      </div>

      {/* Tagline */}
      <p className="text-sm text-on-surface-variant mb-6 min-h-[36px]">{tagline}</p>

      {/* Features */}
      <ul className="space-y-0 mb-8 flex-grow">
        {features.map((f, i) => (
          <li
            key={i}
            className="flex items-start gap-3 py-2 border-b border-outline-variant/20 last:border-b-0"
          >
            {f.included ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            ) : (
              <Lock className="w-4 h-4 text-on-surface-variant/40 flex-shrink-0 mt-1" />
            )}
            <span className={`text-sm ${f.included ? "text-on-surface" : "text-on-surface-variant/60"}`}>
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        className={`w-full py-3.5 rounded-full font-bold text-sm transition-all ${
          ctaStyle === "primary"
            ? "bg-primary text-white hover:opacity-90"
            : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline-variant/30"
        }`}
      >
        {cta}
      </button>
    </div>
  )
}
