"use client"

import { Check, X } from "lucide-react"

interface DeckCardToggleProps {
  isExcluded: boolean
  onToggle: () => void
}

export default function DeckCardToggle({ isExcluded, onToggle }: DeckCardToggleProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onToggle()
        }
      }}
      aria-label={isExcluded ? "Incluir esta tarjeta" : "Excluir esta tarjeta"}
      className={`absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
        isExcluded
          ? "bg-error text-white shadow-md"
          : "bg-white/90 text-primary border-2 border-primary/30 hover:bg-primary/10"
      }`}
    >
      {isExcluded ? (
        <X className="w-4 h-4" />
      ) : (
        <Check className="w-4 h-4" />
      )}
    </button>
  )
}
