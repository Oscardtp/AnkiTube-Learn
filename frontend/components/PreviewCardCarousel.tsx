"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import CardFlip from "./CardFlip"

interface Card {
  front: string
  back: string
  keyword: string
  grammar_note: string
  context_note: string
  colombian_note: string
  timestamp_start: number
  timestamp_end: number
  audio_filename?: string
  card_type: string
}

interface PreviewCardCarouselProps {
  cards: Card[]
  currentCardIndex: number
  onCardChange: (index: number) => void
  selectedCards: Set<number>
  onToggleSelection: (index: number) => void
  audioBaseUrl?: string
}

export default function PreviewCardCarousel({
  cards,
  currentCardIndex,
  onCardChange,
  selectedCards,
  onToggleSelection,
  audioBaseUrl = "",
}: PreviewCardCarouselProps) {
  // Mostrar máximo 5 tarjetas en preview
  const previewCards = cards.slice(0, 5)
  const totalCards = cards.length

  function goToPrevCard() {
    if (currentCardIndex > 0) {
      onCardChange(currentCardIndex - 1)
    }
  }

  function goToNextCard() {
    if (currentCardIndex < previewCards.length - 1) {
      onCardChange(currentCardIndex + 1)
    }
  }

  if (previewCards.length === 0) {
    return (
      <div className="bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] p-6 text-center mb-8">
        <p className="text-[#6B7280] text-sm">No hay tarjetas disponibles</p>
      </div>
    )
  }

  return (
    <div className="bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] overflow-hidden mb-8">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-[#E5E7EB]">
        <h3 className="text-sm font-semibold text-[#111827]">Tus tarjetas</h3>
        <span className="text-xs text-[#6B7280]">
          Vista previa · {Math.min(currentCardIndex + 1, previewCards.length)} de {totalCards}
        </span>
      </div>

      {/* Card */}
      <div className="p-4">
        <CardFlip
          card={previewCards[currentCardIndex]}
          index={currentCardIndex}
          total={previewCards.length}
          audioBaseUrl={audioBaseUrl}
          isSelected={selectedCards.has(currentCardIndex)}
          onToggleSelection={onToggleSelection}
          showSelection={selectedCards.size > 0}
        />
      </div>

      {/* Navigation Dots */}
      <div className="flex items-center justify-center gap-1.5 py-3">
        {previewCards.map((_, idx) => {
          let dotClass = "w-2 h-2 rounded-full transition-all"
          if (idx === currentCardIndex) {
            dotClass += " bg-[#1A56DB] scale-125"
          } else if (selectedCards.has(idx)) {
            dotClass += " bg-[#1A56DB]"
          } else if (idx < currentCardIndex) {
            dotClass += " bg-[#B5D4F4]"
          } else {
            dotClass += " bg-[#E5E7EB]"
          }

          return (
            <button
              key={idx}
              onClick={() => onCardChange(idx)}
              className={dotClass}
              title={`Ir a tarjeta ${idx + 1}`}
            />
          )
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-center gap-4 pb-4">
        <button
          onClick={goToPrevCard}
          disabled={currentCardIndex === 0}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            currentCardIndex === 0
              ? "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed"
              : "bg-white text-[#111827] hover:bg-[#F9FAFB] shadow-sm border border-[#E5E7EB]"
          }`}
          title="Tarjeta anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={goToNextCard}
          disabled={currentCardIndex === previewCards.length - 1}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            currentCardIndex === previewCards.length - 1
              ? "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed"
              : "bg-white text-[#111827] hover:bg-[#F9FAFB] shadow-sm border border-[#E5E7EB]"
          }`}
          title="Tarjeta siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Hint Text */}
      <div className="text-center text-xs text-[#9CA3AF] pb-4">
        Deslizá para ver más · Tocá para voltear
      </div>
    </div>
  )
}
