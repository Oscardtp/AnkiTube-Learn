"use client"

import { useState, useRef } from "react"
import { Volume2, BookOpen, MessageSquare, Quote, Check } from "lucide-react"

interface CardData {
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

interface CardFlipProps {
  card: CardData
  index: number
  total: number
  audioBaseUrl?: string
  isSelected?: boolean
  onToggleSelection?: (index: number) => void
  showSelection?: boolean
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${String(secs).padStart(2, "0")}`
}

function getCardTypeLabel(type: string): string {
  switch (type) {
    case "vocabulary":
      return "Vocabulario"
    case "phrase":
      return "Frase"
    case "idiom":
      return "Modismo"
    default:
      return type
  }
}

function getCardTypeIcon(type: string) {
  switch (type) {
    case "vocabulary":
      return BookOpen
    case "phrase":
      return MessageSquare
    case "idiom":
      return Quote
    default:
      return BookOpen
  }
}

export default function CardFlip({
  card,
  index,
  total,
  audioBaseUrl,
  isSelected = false,
  onToggleSelection,
  showSelection = false
}: CardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playBeforeFlip, setPlayBeforeFlip] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const TypeIcon = getCardTypeIcon(card.card_type)

  const handleSelectionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onToggleSelection) {
      onToggleSelection(index)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)

    // If user pressed play before flip, activate audio after flip
    if (!isFlipped && playBeforeFlip && audioRef.current) {
      setTimeout(() => {
        audioRef.current?.play()
        setIsPlaying(true)
      }, 300)
    }
  }

  const handleAudioClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      if (!isFlipped) {
        // Mark that user wants to play, will activate after flip
        setPlayBeforeFlip(true)
        handleFlip()
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
  }

  const audioSrc = audioBaseUrl && card.audio_filename
    ? `${audioBaseUrl}/${card.audio_filename}`
    : undefined

  return (
    <div className={`w-full max-w-2xl mx-auto ${showSelection && !isSelected ? "opacity-60" : ""}`}>
      {/* Card container with perspective */}
      <div
        className={`relative w-full cursor-pointer ${isSelected ? "border-2 border-primary rounded-3xl" : ""}`}
        style={{ perspective: "1000px" }}
        onClick={handleFlip}
      >
        {/* Selection checkbox */}
        {showSelection && (
          <button
            onClick={handleSelectionClick}
            className="absolute top-4 right-4 z-20 w-6 h-6 rounded-md flex items-center justify-center transition-all"
            style={{
              backgroundColor: isSelected ? "var(--primary)" : "rgba(255,255,255,0.9)",
              border: isSelected ? "none" : "2px solid var(--outline-variant)",
            }}
          >
            {isSelected && <Check className="w-4 h-4 text-white" />}
          </button>
        )}
        {/* Inner card that flips */}
        <div
          className="relative w-full transition-transform duration-300 ease-in-out"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front Face */}
          <div
            className="w-full bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-elevated"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Header: type + timestamp */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TypeIcon className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary bg-primary-container/20 px-3 py-1 rounded-full">
                  {getCardTypeLabel(card.card_type)}
                </span>
              </div>
              <span className="text-xs font-medium text-outline">
                {formatTimestamp(card.timestamp_start)} – {formatTimestamp(card.timestamp_end)}
              </span>
            </div>

            {/* Main content */}
            <div className="min-h-[120px] flex items-center justify-center">
              <h3 className="text-2xl md:text-3xl font-extrabold text-on-surface text-center leading-tight">
                {card.front}
              </h3>
            </div>

            {/* Audio button */}
            {audioSrc && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleAudioClick}
                  title={isPlaying ? "Pausar audio" : "Reproducir audio"}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isPlaying
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "bg-primary-container/20 text-primary hover:bg-primary-container/40"
                  }`}
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Tap hint */}
            <p className="text-center text-xs text-outline mt-4">
              Toca para voltear
            </p>
          </div>

          {/* Back Face */}
          <div
            className="absolute inset-0 w-full bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-elevated"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TypeIcon className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary bg-primary-container/20 px-3 py-1 rounded-full">
                  {getCardTypeLabel(card.card_type)}
                </span>
              </div>
              <span className="text-xs font-medium text-outline">
                {formatTimestamp(card.timestamp_start)} – {formatTimestamp(card.timestamp_end)}
              </span>
            </div>

            {/* Back translation */}
            <div className="mb-6">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-2">
                Traducción
              </span>
              <p className="text-xl md:text-2xl font-bold text-on-surface leading-tight">
                {card.back}
              </p>
            </div>

            {/* Colombian note */}
            {card.colombian_note && (
              <div className="mb-4 p-4 rounded-xl bg-[#0F6E56]/10 border border-[#0F6E56]/20">
                <span className="text-xs font-bold text-[#0F6E56] uppercase tracking-widest block mb-1">
                  Nota colombiana
                </span>
                <p className="text-sm font-medium text-[#0F6E56]">
                  {card.colombian_note}
                </p>
              </div>
            )}

            {/* Grammar note */}
            {card.grammar_note && (
              <div className="mb-4">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                  Gramática
                </span>
                <p className="text-sm text-on-surface-variant">
                  {card.grammar_note}
                </p>
              </div>
            )}

            {/* Context note */}
            {card.context_note && (
              <div className="mb-4">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                  Contexto
                </span>
                <p className="text-sm text-on-surface-variant">
                  {card.context_note}
                </p>
              </div>
            )}

            {/* Audio player (mini) */}
            {audioSrc && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleAudioClick}
                  title={isPlaying ? "Pausar audio" : "Reproducir audio"}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isPlaying
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "bg-primary-container/20 text-primary hover:bg-primary-container/40"
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Tap hint */}
            <p className="text-center text-xs text-outline mt-4">
              Toca para voltear
            </p>
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          onEnded={handleAudioEnded}
          preload="none"
        />
      )}

      {/* Card counter */}
      <p className="text-center text-sm text-on-surface-variant mt-4 font-medium">
        Tarjeta {index + 1} de {total}
      </p>
    </div>
  )
}
