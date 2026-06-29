"use client"

import { useCallback, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Square, CheckSquare } from "lucide-react"
import CardFlip from "./CardFlip"
import type { Card } from "@/types/preview"

interface CardCarouselProps {
  cards: Card[]
  audioBaseUrl?: string
  excludedCards?: string[]
  onToggleExclusion?: (cardFront: string) => void
}

export default function CardCarousel({ cards, audioBaseUrl, excludedCards = [], onToggleExclusion }: CardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set())
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }, [currentIndex])

  const goToNext = useCallback(() => {
    if (currentIndex < cards.length - 1) setCurrentIndex(currentIndex + 1)
  }, [currentIndex, cards.length])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext()
      else goToPrev()
    }
  }, [goToNext, goToPrev])

  const toggleCardSelection = useCallback((index: number) => {
    setSelectedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) newSet.delete(index)
      else newSet.add(index)
      return newSet
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedCards(new Set(Array.from({ length: cards.length }, (_, i) => i)))
  }, [cards.length])

  const deselectAll = useCallback(() => {
    setSelectedCards(new Set())
  }, [])

  if (cards.length === 0) return null

  return (
    <div className="mb-8">
      {/* Card area with touch gestures */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <CardFlip
          card={cards[currentIndex]}
          index={currentIndex}
          total={cards.length}
          audioBaseUrl={audioBaseUrl}
          isSelected={selectedCards.has(currentIndex)}
          onToggleSelection={toggleCardSelection}
          showSelection={selectedCards.size > 0}
          isExcluded={excludedCards.includes(cards[currentIndex]?.front ?? "")}
          onToggleExclusion={onToggleExclusion ? () => onToggleExclusion(cards[currentIndex]?.front ?? "") : undefined}
        />
      </div>

      {/* Navigation dots */}
      <div className="flex items-center justify-center gap-1.5 mt-6">
        {cards.map((card, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            title={`Ir a tarjeta ${idx + 1}${excludedCards.includes(card.front) ? " (excluida)" : ""}`}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
              idx === currentIndex
                ? "bg-[#1A56DB] scale-125"
                : excludedCards.includes(card.front)
                ? "bg-error/40"
                : selectedCards.has(idx)
                ? "bg-primary"
                : idx < currentIndex
                ? "bg-[#B5D4F4]"
                : "bg-outline-variant/40"
            }`}
          />
        ))}
      </div>

      {/* Prev/Next arrows */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          title="Tarjeta anterior"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            currentIndex === 0
              ? "bg-surface-container-low text-outline cursor-not-allowed"
              : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-high shadow-sm"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={goToNext}
          disabled={currentIndex === cards.length - 1}
          title="Tarjeta siguiente"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            currentIndex === cards.length - 1
              ? "bg-surface-container-low text-outline cursor-not-allowed"
              : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-high shadow-sm"
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Selection controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        <button
          onClick={selectedCards.size === cards.length ? deselectAll : selectAll}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high text-on-surface font-medium text-sm hover:bg-surface-container-highest transition-all"
        >
          {selectedCards.size === cards.length ? (
            <>
              <CheckSquare className="w-4 h-4" />
              Deseleccionar todas
            </>
          ) : (
            <>
              <Square className="w-4 h-4" />
              Seleccionar todas
            </>
          )}
        </button>
        {selectedCards.size > 0 && (
          <span className="text-sm text-on-surface-variant font-medium">
            {selectedCards.size} seleccionada{selectedCards.size !== 1 ? "s" : ""}
          </span>
        )}
        {excludedCards.length > 0 && (
          <span className="text-sm text-error font-medium">
            {excludedCards.length} excluida{excludedCards.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  )
}
