import { PRICING_PLANS } from "../data"
import PricingCard from "./PricingCard"

export default function PricingSection() {
  return (
    <section id="pricing" className="section-padding bg-surface-container-low">
      <div className="container-limit">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-6 tracking-tight">
            Elegí tu nivel de compromiso
          </h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            No es un plan. Es el nivel al que vas a llegar.
            <br />
            Empieza gratis — actualiza cuando quieras más.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
          {PRICING_PLANS.map((plan) => (
            <PricingCard
              key={plan.name}
              name={plan.name}
              identity={plan.identity}
              identityColor={plan.identityColor}
              price={plan.price}
              period={plan.period}
              tagline={plan.tagline}
              features={plan.features}
              cta={plan.cta}
              ctaStyle={plan.ctaStyle}
              featured={plan.featured}
            />
          ))}
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-8">
          Sin tarjeta de crédito para empezar · Cancela cuando quieras · Precio en pesos colombianos
        </p>
        <p className="text-center text-sm text-on-surface-variant mt-1">
          ¿Dudas? Escríbenos por WhatsApp — respondemos ese día.
        </p>
      </div>
    </section>
  )
}
