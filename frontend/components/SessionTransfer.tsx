"use client"

import { useState, useEffect } from "react"
import { Loader2, CheckCircle2 } from "lucide-react"

interface SessionTransferProps {
  isVisible: boolean
  onComplete: () => void
}

export default function SessionTransfer({ isVisible, onComplete }: SessionTransferProps) {
  const [step, setStep] = useState<"transferring" | "complete">("transferring")

  useEffect(() => {
    if (!isVisible) return

    const timer = setTimeout(() => {
      setStep("complete")
    }, 1500)

    return () => clearTimeout(timer)
  }, [isVisible])

  useEffect(() => {
    if (!isVisible || step !== "complete") return

    const timer = setTimeout(() => {
      onComplete()
    }, 800)

    return () => clearTimeout(timer)
  }, [isVisible, step, onComplete])

  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transfer-title"
    >
      <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-elevated text-center max-w-sm mx-4">
        {step === "transferring" ? (
          <>
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" aria-hidden="true" />
            <h3 id="transfer-title" className="text-lg font-semibold text-on-surface mb-2">
              Transfiriendo tu mazo...
            </h3>
            <p className="text-sm text-on-surface-variant">
              Un momento, estamos vinculando tu progreso.
            </p>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-4" aria-hidden="true" />
            <h3 id="transfer-title" className="text-lg font-semibold text-on-surface mb-2">
              ¡Listo! Tu mazo te espera 🎯
            </h3>
            <p className="text-sm text-on-surface-variant">
              Ya podés descargarlo o empezar a estudiar.
            </p>
          </>
        )}
      </div>
    </div>
  )
}