"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { BookOpen, Check, Volume2, ArrowRight, Play } from "lucide-react"
import type { StudyCard } from "@/hooks/useSM2"

interface ReadingExerciseProps {
  cards: StudyCard[]
  deckTitle: string
  audioBaseUrl?: string
  videoId?: string
  onDone: () => void
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${String(secs).padStart(2, "0")}`
}

export default function ReadingExercise({
  cards,
  deckTitle,
  audioBaseUrl,
  videoId,
  onDone,
}: ReadingExerciseProps) {
  const [readCards, setReadCards] = useState<Set<number>>(new Set())
  const [activeTimestamp, setActiveTimestamp] = useState<number | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const audioRefs = useRef<Map<number, HTMLAudioElement>>(new Map())

  const vocabulary = useMemo(() =>
    cards.map((c) => ({
      index: c.card_index,
      front: c.front,
      back: c.back,
      colombianNote: c.colombian_note,
      grammarNote: c.grammar_note,
      contextNote: c.context_note,
      audioFilename: c.audio_filename,
      timestampStart: c.timestamp_start,
      timestampEnd: c.timestamp_end,
    })),
    [cards]
  )

  const handleMarkRead = (index: number) => {
    setReadCards((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const handleMarkAllRead = () => {
    setReadCards(new Set(cards.map((_, i) => i)))
  }

  const allRead = readCards.size === cards.length

  const handlePlayAudio = (index: number) => {
    const vocab = vocabulary[index]
    if (!audioBaseUrl || !vocab.audioFilename) return
    const src = `${audioBaseUrl}/${vocab.audioFilename}`
    let audio = audioRefs.current.get(index)
    if (!audio) {
      audio = new Audio(src)
      audioRefs.current.set(index, audio)
    }
    audio.currentTime = 0
    audio.play().catch(() => {})
  }

  // Jump video to timestamp via YouTube IFrame API
  const jumpToTimestamp = useCallback((seconds: number) => {
    setActiveTimestamp(seconds)
    if (!iframeRef.current) return
    // Use postMessage to seek YouTube player
    iframeRef.current.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: "seekTo", args: [seconds, true] }),
      "*"
    )
    iframeRef.current.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: "playVideo", args: [] }),
      "*"
    )
  }, [])

  useEffect(() => {
    return () => {
      audioRefs.current.forEach((audio) => {
        audio.pause()
        audio.src = ""
      })
    }
  }, [])

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Task header */}
      <div className="text-center mb-6">
        <span className="inline-block px-3 py-1 bg-[#16A34A]/10 text-[#16A34A] text-[10px] font-bold tracking-widest uppercase rounded-full mb-2">
          Reading Comprehension
        </span>
        <h2 className="text-xl font-extrabold text-gray-900">
          Lee y descubre el vocabulario
        </h2>
        <p className="text-sm text-gray-500 mt-1">{deckTitle}</p>
      </div>

      {/* YouTube embed */}
      {videoId && (
        <div className="bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100 mb-4">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              ref={iframeRef}
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1`}
              title={deckTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {activeTimestamp !== null && (
            <div className="px-4 py-2 bg-gray-50 text-center">
              <p className="text-xs text-gray-500">
                Reproduciendo desde <span className="font-bold text-primary">{formatTimestamp(activeTimestamp)}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Vocabulary guide */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Guía:</span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-primary/20 border-2 border-primary" />
            <span className="text-[11px] font-medium text-gray-600">Vocabulario</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[#10B981]/20 border-2 border-[#10B981]" />
            <span className="text-[11px] font-medium text-gray-600">Modismos CO</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[#7C3AED]/20 border-2 border-[#7C3AED]" />
            <span className="text-[11px] font-medium text-gray-600">Gramática</span>
          </span>
        </div>
      </div>

      {/* Vocabulary list */}
      <div className="space-y-3">
        {vocabulary.map((vocab) => {
          const isRead = readCards.has(vocab.index)

          return (
            <div
              key={vocab.index}
              className={`bg-white rounded-2xl p-4 shadow-card border transition-all ${
                isRead ? "border-[#10B981]/30 bg-[#F0FDF4]/50" : "border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Timestamp link */}
                    <button
                      onClick={() => jumpToTimestamp(vocab.timestampStart)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full hover:bg-primary/20 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                      aria-label={`Ir a ${formatTimestamp(vocab.timestampStart)} en el video`}
                    >
                      <Play className="w-2.5 h-2.5" />
                      {formatTimestamp(vocab.timestampStart)}
                    </button>
                    <span className="text-base font-bold text-gray-900">{vocab.front}</span>
                    <span className="text-gray-400 text-sm">→</span>
                    <span className="text-sm font-medium text-gray-600">{vocab.back}</span>
                  </div>
                  {vocab.colombianNote && (
                    <p className="text-xs text-[#0F6E56] font-medium mt-1">CO: {vocab.colombianNote}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {audioBaseUrl && vocab.audioFilename && (
                    <button
                      onClick={() => handlePlayAudio(vocab.index)}
                      aria-label={`Reproducir audio de ${vocab.front}`}
                      className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleMarkRead(vocab.index)}
                    aria-pressed={isRead}
                    aria-label={isRead ? `Marcar ${vocab.front} como no leído` : `Marcar ${vocab.front} como leído`}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                      isRead ? "bg-[#10B981] text-white" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {(vocab.grammarNote || vocab.contextNote) && (
                <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                  {vocab.grammarNote && (
                    <p className="text-xs text-gray-500">
                      <span className="font-bold text-[#7C3AED]">Gramática:</span> {vocab.grammarNote}
                    </p>
                  )}
                  {vocab.contextNote && (
                    <p className="text-xs text-gray-500">
                      <span className="font-bold text-gray-600">Contexto:</span> {vocab.contextNote}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {!allRead && (
        <div className="text-center mt-4">
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            Marcar todo como leído
          </button>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={onDone}
          disabled={!allRead}
          className="w-full bg-primary text-white font-bold py-4 rounded-full transition-all active:scale-[0.98] hover:brightness-95 shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 flex items-center justify-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Marcar como Leído
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
