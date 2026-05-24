"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface PreviewFeedbackProps {
  deckId: string
  visible: boolean
  onClose: () => void
  onFeedback?: (emoji: string) => Promise<void>
}

export default function PreviewFeedback({
  deckId,
  visible,
  onClose,
  onFeedback,
}: PreviewFeedbackProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [progress, setProgress] = useState(100)
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)

  useEffect(() => {
    if (!visible) {
      setIsAnimating(false)
      setProgress(100)
      setSelectedEmoji(null)
      return
    }

    setIsAnimating(true)

    // Progress bar animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          onClose()
          return 100
        }
        return prev - (100 / 80) // 8 seconds total
      })
    }, 100)

    return () => clearInterval(interval)
  }, [visible, onClose])

  async function handleFeedback(emoji: string) {
    setSelectedEmoji(emoji)
    if (onFeedback) {
      await onFeedback(emoji)
    }
    setTimeout(() => {
      onClose()
    }, 800)
  }

  if (!visible) return null

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transform transition-all duration-320 ${
        isAnimating ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      {/* Feedback Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-3.5 md:p-4 shadow-2xl max-w-sm w-[calc(100vw-2rem)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <h3 className="text-sm font-semibold text-[#111827] mb-0.5">
          ¿Las tarjetas te parecieron útiles?
        </h3>

        {/* Subtitle */}
        <p className="text-xs text-[#6B7280] mb-3">
          Tu opinión mejora la calidad del mazo
        </p>

        {/* Options */}
        <div className="flex gap-2 mb-3">
          {[
            { emoji: "😐", label: "Más o menos" },
            { emoji: "👍", label: "Sí" },
            { emoji: "🔥", label: "Muy útiles" },
          ].map((option) => (
            <button
              key={option.emoji}
              onClick={() => handleFeedback(option.emoji)}
              className={`flex-1 h-12 border border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-xs font-medium ${
                selectedEmoji === option.emoji
                  ? "border-[#1A56DB] bg-[#EBF2FF] text-[#1A56DB]"
                  : "hover:border-[#1A56DB] hover:bg-[#EBF2FF] hover:text-[#1A56DB] text-[#374151]"
              }`}
            >
              <span className="text-lg">{option.emoji}</span>
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1A56DB] transition-all"
            style={{ width: `${Math.max(0, progress)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
