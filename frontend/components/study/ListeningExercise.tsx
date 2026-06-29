"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, Volume2, Lightbulb, ArrowRight } from "lucide-react"
import type { StudyCard } from "@/hooks/useSM2"

interface ListeningExerciseProps {
  card: StudyCard
  audioBaseUrl?: string
  onCheck: () => void
  onNext: () => void
}

const SPEEDS = [0.5, 0.75, 1] as const
type Speed = (typeof SPEEDS)[number]

export default function ListeningExercise({
  card,
  audioBaseUrl,
  onCheck,
  onNext,
}: ListeningExerciseProps) {
  const [input, setInput] = useState("")
  const [speed, setSpeed] = useState<Speed>(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const audioSrc =
    audioBaseUrl && card.audio_filename
      ? `${audioBaseUrl}/${card.audio_filename}`
      : undefined

  // Reset state when card changes
  useEffect(() => {
    setInput("")
    setSpeed(1)
    setIsPlaying(false)
    setVerified(false)
    setIsCorrect(false)
    setShowHint(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current.playbackRate = 1
    }
  }, [card.front])

  const normalize = (s: string) =>
    s.trim().toLowerCase().replace(/\s+/g, " ")

  const handleVerify = () => {
    const correct = normalize(input) === normalize(card.back)
    setIsCorrect(correct)
    setVerified(true)
    onCheck()
  }

  const handleSpeedChange = (newSpeed: Speed) => {
    setSpeed(newSpeed)
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed
    }
  }

  const handlePlayPause = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.playbackRate = speed
      audioRef.current.play().catch(() => setIsPlaying(false))
      setIsPlaying(true)
    }
  }

  const handleReplay = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = 0
    audioRef.current.playbackRate = speed
    audioRef.current.play().catch(() => setIsPlaying(false))
    setIsPlaying(true)
  }

  const handleHint = () => {
    setShowHint(true)
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
      {/* Task header */}
      <div className="text-center mb-6">
        <span className="inline-block px-3 py-1 bg-[#EA580C]/10 text-[#EA580C] text-[10px] font-bold tracking-widest uppercase rounded-full mb-2">
          Dictation Practice
        </span>
        <h2 className="text-xl font-extrabold text-gray-900">
          Escucha y escribe lo que oigas
        </h2>
      </div>

      {/* Audio player card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-elevated border border-gray-100 mb-4">
        <div className="flex flex-col items-center gap-6">
          {/* Play button */}
          <button
            onClick={handlePlayPause}
            disabled={!audioSrc}
            aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}
            className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </button>

          {/* Speed controls */}
          <div className="flex items-center gap-2" role="group" aria-label="Velocidad de reproducción">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                aria-pressed={speed === s}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                  speed === s
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Replay button */}
          <button
            onClick={handleReplay}
            disabled={!audioSrc}
            className="flex items-center gap-2 text-gray-400 hover:text-primary text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-30"
          >
            <RotateCcw className="w-4 h-4" />
            Repetir frase
          </button>
        </div>
      </div>

      {/* Dictation input */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-elevated border border-gray-100">
        <div className="space-y-4">
          <label htmlFor="dictation-input" className="sr-only">
            Escribe lo que escuchas
          </label>
          <textarea
            ref={textareaRef}
            id="dictation-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && input.trim() && !verified) {
                e.preventDefault()
                handleVerify()
              }
            }}
            placeholder="Escribe lo que escuchas..."
            disabled={verified}
            rows={3}
            aria-describedby="dictation-hint"
            className={`w-full bg-gray-50 border rounded-2xl px-4 py-3 text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
              verified
                ? isCorrect
                  ? "border-[#10B981] bg-[#10B981]/5"
                  : "border-[#EF4444] bg-[#EF4444]/5"
                : "border-gray-200"
            }`}
          />

          {/* Hint */}
          {showHint && (
            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-4 h-4 text-[#D97706] mt-0.5 shrink-0" />
                <p className="text-sm text-[#92400E]">
                  La respuesta empieza con: <span className="font-bold">{card.back.charAt(0)}...</span>
                  {card.colombian_note && (
                    <>
                      <br />
                      <span className="text-xs text-[#A16207]">CO: {card.colombian_note}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Verified feedback */}
          {verified && (
            <div className={`rounded-2xl p-4 text-center ${isCorrect ? "bg-[#F0FDF4] border border-[#BBF7D0]" : "bg-[#FEF2F2] border border-[#FECACA]"}`}>
              <p className={`text-[11px] font-bold uppercase tracking-[0.12em] mb-1 ${isCorrect ? "text-[#166534]" : "text-[#991B1B]"}`}>
                {isCorrect ? "¡Excelente!" : "Respuesta correcta"}
              </p>
              <p className={`text-lg font-bold ${isCorrect ? "text-[#166534]" : "text-[#991B1B]"}`}>
                {card.back}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              onClick={handleHint}
              disabled={showHint || verified}
              className="flex items-center gap-2 text-gray-400 hover:text-primary font-bold text-sm transition-colors px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              <Lightbulb className="w-4 h-4" />
              Necesito una pista
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!verified ? (
                <button
                  onClick={handleVerify}
                  disabled={!input.trim()}
                  className="flex-1 sm:flex-none bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-95 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                >
                  Verificar
                </button>
              ) : (
                <button
                  onClick={onNext}
                  className="flex-1 sm:flex-none bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-95 active:scale-95 transition-all flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Support grid */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="bg-white/60 rounded-xl p-3 text-center">
          <Volume2 className="w-4 h-4 text-gray-400 mx-auto mb-1" />
          <p className="text-[10px] font-bold text-gray-500 uppercase">Vocabulario</p>
          <p className="text-xs text-gray-700 font-medium mt-0.5">{card.front}</p>
        </div>
        {card.grammar_note && (
          <div className="bg-white/60 rounded-xl p-3 text-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Gramática</p>
            <p className="text-xs text-gray-700 font-medium mt-0.5 line-clamp-2">{card.grammar_note}</p>
          </div>
        )}
        {card.colombian_note && (
          <div className="bg-white/60 rounded-xl p-3 text-center">
            <p className="text-[10px] font-bold text-[#0F6E56] uppercase">CO</p>
            <p className="text-xs text-[#0F6E56] font-medium mt-0.5 line-clamp-2">{card.colombian_note}</p>
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      <div className="text-center mt-4">
        <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400">
          Usa <span className="bg-gray-200 px-1.5 py-0.5 rounded text-[10px] mx-1">Enter</span> para verificar
        </p>
      </div>

      {audioSrc && (
        <audio ref={audioRef} src={audioSrc} preload="none" />
      )}
    </div>
  )
}
