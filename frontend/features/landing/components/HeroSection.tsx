"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"

export default function HeroSection() {
  return (
    <section id="hero" className="pt-28 pb-16 md:pt-32 md:pb-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          {/* Eyebrow badge */}
          <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-semibold px-4 py-1.5 rounded-full border border-emerald-200 mb-6">
            Aprendé inglés con lo que ya mirás
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-on-surface mb-6 leading-tight">
            Llevás años viendo YouTube en inglés.
            <br />
            <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
              Ya es hora de que te quede algo.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-8">
            Convierte cualquier video de YouTube en tu clase de inglés personalizada.
            Pegas la URL. La IA genera las tarjetas. Tú estudias. Gratis para empezar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="#generador"
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-container text-white px-8 py-4 rounded-full font-bold text-base hover:opacity-90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Generar mi primer mazo
            </Link>
          </div>

          <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mt-4">
            Sin tarjeta. Sin registro. Solo pega el enlace.
          </p>
        </div>
      </div>
    </section>
  )
}
