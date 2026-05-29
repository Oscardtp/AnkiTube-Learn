"use client"

import { useLoopAnimation } from "../hooks/useLoopAnimation"

const LOOP_STEPS = [
  { label: "Link pegado" },
  { label: "Procesando" },
  { label: "18 tarjetas listas" },
]

interface LoopAnimationProps {
  enabled?: boolean
}

export default function LoopAnimation({ enabled = true }: LoopAnimationProps) {
  const { currentStep } = useLoopAnimation({ stepCount: 3, enabled })

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
        <div className="flex items-center justify-between gap-3">
          {LOOP_STEPS.map((ls, idx) => {
            let bgClass = "bg-surface-container-high"
            let borderClass = "border-transparent"
            let textClass = "text-on-surface-variant"

            if (currentStep === idx) {
              bgClass = "bg-primary/10"
              borderClass = "border-primary"
              textClass = "text-primary font-medium"
            } else if (currentStep > idx || currentStep === -1) {
              if (currentStep === -1 && idx === 2) {
                bgClass = "bg-emerald-50"
                borderClass = "border-emerald-500"
                textClass = "text-emerald-700 font-medium"
              } else if (currentStep > idx) {
                bgClass = "bg-emerald-50"
                borderClass = "border-emerald-500"
                textClass = "text-emerald-700 font-medium"
              }
            }

            return (
              <div
                key={idx}
                className={`flex-1 py-3 px-4 rounded-xl border-2 text-center text-sm transition-all duration-300 ${bgClass} ${borderClass} ${textClass}`}
              >
                {ls.label}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
