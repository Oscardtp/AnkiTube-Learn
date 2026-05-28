"use client"

import { X } from "lucide-react"

interface FeedbackBannerProps {
  visible: boolean
  progress: number
  onDismiss: () => void
  onRate: (rating: number) => void
}

const STARS = [1, 2, 3, 4, 5]

export default function FeedbackBanner({
  visible,
  progress,
  onDismiss,
  onRate,
}: FeedbackBannerProps) {
  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-lg mx-auto bg-surface-container-lowest rounded-2xl shadow-elevated p-5 border border-outline-variant/20">
        {/* Progress bar */}
        <div className="w-full h-1 bg-surface-container-high rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-bold text-on-surface mb-1">
              ¿Cómo fue tu experiencia descargando?
            </p>
            <p className="text-xs text-on-surface-variant mb-3">
              Tu opinión nos ayuda a mejorar.
            </p>
            <div className="flex gap-1">
              {STARS.map((star) => (
                <button
                  key={star}
                  onClick={() => onRate(star)}
                  className="text-2xl hover:scale-125 transition-transform"
                  aria-label={`${star} estrella${star > 1 ? "s" : ""}`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={onDismiss}
            aria-label="Cerrar"
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface-variant hover:bg-surface-container-high transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
