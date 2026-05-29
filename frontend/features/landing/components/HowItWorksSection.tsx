"use client"

import { useIntersectionObserver } from "../hooks/useIntersectionObserver"
import { Link as LinkIcon, Brain, Download } from "lucide-react"
import LoopAnimation from "./LoopAnimation"

const STEP_ICONS = [LinkIcon, Brain, Download]

const STEPS_DATA = [
  { title: "1. Pega el enlace", desc: "Cualquier video de YouTube que te guste. Sin límites." },
  { title: "2. La IA analiza", desc: "Extraemos frases reales, pronunciación y contexto cultural." },
  { title: "3. Descarga y estudia", desc: "Importa a Anki en un clic y empieza a memorizar de verdad." },
]

export default function HowItWorksSection() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.2 })

  return (
    <section className="section-padding" ref={ref}>
      <div className="container-limit">
        <h2 className="text-3xl font-extrabold text-on-surface mb-16 text-center">Así funciona</h2>

        {/* 3 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {STEPS_DATA.map((step, idx) => {
            const Icon = STEP_ICONS[idx]
            return (
              <div
                key={idx}
                className={`flex flex-col items-center text-center transition-all duration-400 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                }`}
                style={{ transitionDelay: `${idx * 150}ms` }}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg ${
                    idx === 2
                      ? "bg-secondary text-white shadow-secondary/30"
                      : "bg-primary text-white shadow-primary/30"
                  }`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-on-surface">{step.title}</h3>
                <p className="text-on-surface-variant">{step.desc}</p>
              </div>
            )
          })}
        </div>

        {/* Loop Animation */}
        <LoopAnimation enabled={isVisible} />
      </div>
    </section>
  )
}
