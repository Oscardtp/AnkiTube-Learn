"use client"

import { useState, useCallback, useRef } from "react"
import { Volume2, MapPin, BookOpen, MessageSquare, Quote, ChevronDown } from "lucide-react"
import type { Card } from "@/types/preview"

interface CardListProps {
  cards: Card[]
  audioBaseUrl?: string
  excludedCards?: string[]
  onToggleExclusion?: (cardFront: string) => void
}

const CARD_TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }> = {
  vocabulary: { label: "Vocabulario", bg: "bg-[#EAF3DE]", text: "text-[#27500A]", border: "border-[#C0DD97]", icon: BookOpen },
  idiom: { label: "Modismo", bg: "bg-[#E6F1FB]", text: "text-[#0C447C]", border: "border-[#B5D4F4]", icon: Quote },
  phrase: { label: "Frase", bg: "bg-[#EEEDFE]", text: "text-[#3C3489]", border: "border-[#CECBF6]", icon: MessageSquare },
  grammar_pattern: { label: "Gramática", bg: "bg-[#FFF3E0]", text: "text-[#8B5000]", border: "border-[#FFE0B2]", icon: BookOpen },
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${String(secs).padStart(2, "0")}`
}

function CardItem({
  card,
  audioBaseUrl,
  isExcluded,
}: {
  card: Card
  audioBaseUrl?: string
  isExcluded?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const config = CARD_TYPE_CONFIG[card.card_type] || CARD_TYPE_CONFIG.vocabulary
  const TypeIcon = config.icon

  const audioSrc = audioBaseUrl && card.audio_filename
    ? `${audioBaseUrl}/${card.audio_filename}`
    : undefined

  const handleToggle = useCallback(() => {
    setExpanded((prev) => !prev)
  }, [])

  const handleAudioClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }, [isPlaying])

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false)
  }, [])

  return (
    <div
      className={`rounded-2xl border transition-all duration-150 ${
        expanded
          ? "bg-[#F8FBFF] border-[#1A56DB] shadow-sm"
          : "bg-white border-gray-200 hover:border-gray-300"
      } ${isExcluded ? "opacity-50" : ""}`}
    >
      {/* Card header — always visible */}
      <button
        onClick={handleToggle}
        className="w-full text-left p-4 flex items-start gap-3"
        aria-expanded={expanded}
      >
        {/* Type pill */}
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${config.bg} ${config.text} border ${config.border}`}>
          <TypeIcon className="w-3 h-3" />
          {config.label}
        </span>

        {/* Front text */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-gray-900 leading-snug">
            {card.front}
          </p>

          {/* Back preview (shown when collapsed) */}
          {!expanded && (
            <p className="text-xs text-gray-400 mt-1 truncate">
              Toca para ver la traducción
            </p>
          )}
        </div>

        {/* Chevron */}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 mt-1 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-1 duration-150">
          {/* Back translation */}
          <div>
            <p className="text-base font-medium text-gray-900">{card.back}</p>
          </div>

          {/* Colombian note */}
          {card.colombian_note && (
            <div className="flex items-start gap-2 p-3 bg-[#0F6E56]/5 border border-[#0F6E56]/15 rounded-xl">
              <MapPin className="w-3.5 h-3.5 text-[#0F6E56] shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-[#0F6E56] leading-relaxed">
                {card.colombian_note}
              </p>
            </div>
          )}

          {/* Audio player */}
          {audioSrc && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleAudioClick}
                aria-label={isPlaying ? "Pausar audio" : "Reproducir fragmento de audio"}
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  isPlaying
                    ? "bg-[#1A56DB] text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-[#E6F1FB] hover:text-[#1A56DB] hover:border-[#1A56DB]"
                } border border-gray-200`}
              >
                <Volume2 className="w-3 h-3" />
              </button>
              {/* Waveform decoration */}
              <div className="flex items-center gap-[2px]">
                {[8, 14, 6, 16, 10, 12, 5, 14, 8].map((h, i) => (
                  <div
                    key={i}
                    className="w-[3px] rounded-full bg-[#1A56DB] transition-all"
                    style={{
                      height: `${h}px`,
                      opacity: isPlaying ? 0.8 : 0.3,
                    }}
                  />
                ))}
              </div>
              <span className="text-[11px] text-gray-400">
                {formatTimestamp(card.timestamp_start)}
              </span>
            </div>
          )}

          {/* Grammar note */}
          {card.grammar_note && (
            <div className="pt-3 border-t border-gray-200">
              <p className="text-[11px] text-gray-400 leading-relaxed">
                {card.grammar_note}
              </p>
            </div>
          )}

          {/* Hidden audio element */}
          {audioSrc && (
            <audio
              ref={audioRef}
              src={audioSrc}
              onEnded={handleAudioEnded}
              preload="none"
            />
          )}
        </div>
      )}
    </div>
  )
}

export default function CardList({
  cards,
  audioBaseUrl,
  excludedCards = [],
}: CardListProps) {
  const [showAll, setShowAll] = useState(false)
  const INITIAL_COUNT = 3
  const visibleCards = showAll ? cards : cards.slice(0, INITIAL_COUNT)
  const remainingCount = cards.length - INITIAL_COUNT

  if (cards.length === 0) return null

  return (
    <div>
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Tus tarjetas ({cards.length})
      </h2>

      <div className="flex flex-col gap-2.5">
        {visibleCards.map((card, idx) => (
          <CardItem
            key={`${card.front}-${idx}`}
            card={card}
            audioBaseUrl={audioBaseUrl}
            isExcluded={excludedCards.includes(card.front)}
          />
        ))}

        {/* Show more button */}
        {!showAll && remainingCount > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full py-3 rounded-2xl border border-dashed border-gray-300 text-sm text-gray-400 font-medium hover:border-gray-400 hover:text-gray-500 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg leading-none">+</span>
            {remainingCount} tarjetas más
          </button>
        )}
      </div>
    </div>
  )
}
