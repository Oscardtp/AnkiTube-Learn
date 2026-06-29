"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Volume2 } from "lucide-react"
import type { StudyCard } from "@/hooks/useSM2"

interface StudyCardFlipProps {
  card: StudyCard
  isFlipped: boolean
  onFlip: () => void
  audioBaseUrl?: string
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${String(secs).padStart(2, "0")}`
}

function getCardTypeLabel(type: string): string {
  switch (type) {
    case "vocabulary": return "Vocabulario"
    case "phrase": return "Frase"
    case "idiom": return "Modismo"
    case "grammar_pattern": return "Gramática"
    default: return type
  }
}

export default function StudyCardFlip({
  card,
  isFlipped,
  onFlip,
  audioBaseUrl,
}: StudyCardFlipProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const audioSrc = useMemo(
    () => audioBaseUrl && card.audio_filename
      ? `${audioBaseUrl}/${card.audio_filename}`
      : undefined,
    [audioBaseUrl, card.audio_filename]
  )

  // Reset audio state when card changes
  useEffect(() => {
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [card.front])

  const handleAudioClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false))
      setIsPlaying(true)
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onEnded = () => setIsPlaying(false)
    audio.addEventListener("ended", onEnded)
    return () => {
      audio.removeEventListener("ended", onEnded)
      audio.pause()
    }
  }, [])

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className="relative w-full"
        style={{ perspective: "1000px" }}
      >
        <button
          type="button"
          onClick={onFlip}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              onFlip()
            }
          }}
          className="w-full text-left bg-transparent border-0 p-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-2xl"
          aria-label={isFlipped
            ? `Respuesta: ${card.back}. Presiona para ver la pregunta`
            : `Pregunta: ${card.front}. Presiona para revelar la respuesta`}
        >
          <div
            style={{
              display: "grid",
              gridTemplateRows: "1fr",
              transformStyle: "preserve-3d",
              transition: "transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front Face */}
            <div
              className="w-full bg-white rounded-3xl p-4 sm:p-6 md:p-8 shadow-elevated"
              style={{
                gridRow: 1,
                gridColumn: 1,
                backfaceVisibility: "hidden",
                visibility: isFlipped ? "hidden" : "visible",
                minHeight: "210px",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {getCardTypeLabel(card.card_type)}
                </span>
                <span className="text-xs font-medium text-gray-500">
                  {formatTimestamp(card.timestamp_start)} – {formatTimestamp(card.timestamp_end)}
                </span>
              </div>

              <div className="min-h-[80px] py-4 flex items-center justify-center">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 text-center leading-tight break-words">
                  {card.front}
                </h3>
              </div>

              {audioSrc && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleAudioClick}
                    aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                      isPlaying
                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              )}

              <p className="text-center text-xs text-gray-500 mt-4">
                Toca para voltear
              </p>
            </div>

            {/* Back Face */}
            <div
              className="w-full bg-white rounded-3xl p-4 sm:p-6 md:p-8 shadow-elevated"
              style={{
                gridRow: 1,
                gridColumn: 1,
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                minHeight: "210px",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {getCardTypeLabel(card.card_type)}
                </span>
                <span className="text-xs font-medium text-gray-500">
                  {formatTimestamp(card.timestamp_start)} – {formatTimestamp(card.timestamp_end)}
                </span>
              </div>

              <div className="mb-3">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.12em] block mb-1">
                  Traducción
                </span>
                <p className="text-lg md:text-2xl font-bold text-gray-900 leading-tight">
                  {card.back}
                </p>
              </div>

              {card.colombian_note && (
                <div className="mb-3 p-3 rounded-xl bg-[#0F6E56]/10 border border-[#0F6E56]/20">
                  <span className="text-[11px] font-bold text-[#0F6E56] uppercase tracking-[0.12em] block mb-1">
                    CO
                  </span>
                  <p className="text-xs font-medium text-[#0F6E56] leading-relaxed">
                    {card.colombian_note}
                  </p>
                </div>
              )}

              {card.grammar_note && (
                <div className="mb-2">
                  <hr className="border-gray-200 mb-3" />
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.12em] block mb-1">
                    Gramática
                  </span>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {card.grammar_note}
                  </p>
                </div>
              )}

              {card.context_note && (
                <div className="mb-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.12em] block mb-1">
                    Contexto
                  </span>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {card.context_note}
                  </p>
                </div>
              )}

              {audioSrc && (
                <div className="mt-3 flex justify-center">
                  <button
                    onClick={handleAudioClick}
                    aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                      isPlaying
                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <p className="text-center text-xs text-gray-500 mt-3">
                Toca para voltear
              </p>
            </div>
          </div>
        </button>
      </div>

      {audioSrc && (
        <audio ref={audioRef} src={audioSrc} preload="none" />
      )}
    </div>
  )
}
