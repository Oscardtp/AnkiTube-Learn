import { CheckCircle2 } from "lucide-react"
import { FEATURES } from "../data"
import CardFlip from "./CardFlip"

export default function DemoCardSection() {
  return (
    <section id="features" className="section-padding overflow-hidden bg-surface-container-low">
      <div className="container-limit">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Text content */}
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-6 leading-tight">
              No es traducción.
              <br />
              <span className="text-secondary">Es contexto colombiano.</span>
            </h2>
            <p className="text-lg text-on-surface-variant mb-8">
              Nuestra IA no traduce como un robot. Entiende cómo hablamos nosotros para que cuando
              escuches una expresión, sepas exactamente qué significa en tu mundo.
            </p>
            <div className="space-y-4">
              {FEATURES.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
                  <p className="text-on-surface">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive CardFlip */}
          <div className="flex-1 w-full max-w-md">
            <CardFlip />
          </div>
        </div>
      </div>
    </section>
  )
}
