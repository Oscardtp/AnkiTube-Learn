"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Volume2, Sparkles, ArrowRight } from "lucide-react"
import type { StudyCard } from "@/hooks/useSM2"

interface WritingExerciseProps {
  card: StudyCard
  audioBaseUrl?: string
  onCheck: () => void
  onNext: () => void
}

function buildSentenceWithBlank(front: string, keyword: string): { parts: string[]; blankWord: string } {
  if (!front) return { parts: [front], blankWord: "" }

  // Use keyword if provided, otherwise use last word
  const blankWord = keyword || front.split(" ").pop() || ""

  if (!blankWord) return { parts: [front], blankWord: "" }

  const lowerFront = front.toLowerCase()
  const lowerBlank = blankWord.toLowerCase()
  const idx = lowerFront.indexOf(lowerBlank)

  if (idx === -1) {
    // Keyword not found — put blank at the end
    const words = front.split(" ")
    words.pop()
    return { parts: [...words, "__BLANK__"], blankWord }
  }

  const before = front.slice(0, idx)
  const after = front.slice(idx + blankWord.length)
  const parts: string[] = []
  if (before.trim()) parts.push(before.trim())
  parts.push("__BLANK__")
  if (after.trim()) parts.push(after.trim())

  return { parts, blankWord }
}

export default function WritingExercise({
  card,
  audioBaseUrl,
  onCheck,
  onNext,
}: WritingExerciseProps) {
  const [input, setInput] = useState("")
  const [verified, setVerified] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showAudioHint, setShowAudioHint] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const audioSrc = useMemo(
    () => audioBaseUrl && card.audio_filename
      ? `${audioBaseUrl}/${card.audio_filename}`
      : undefined,
    [audioBaseUrl, card.audio_filename]
  )

  const { parts, blankWord } = useMemo(
    () => buildSentenceWithBlank(card.front, card.keyword),
    [card.front, card.keyword]
  )

  // Dynamic input width based on keyword length
  const inputWidth = useMemo(() => {
    const len = blankWord.length
    if (len <= 5) return "w-28"
    if (len <= 10) return "w-40"
    if (len <= 15) return "w-52"
    if (len <= 20) return "w-64"
    return "w-72"
  }, [blankWord])

  // Reset state when card changes
  useEffect(() => {
    setInput("")
    setVerified(false)
    setIsCorrect(false)
    setIsPlaying(false)
    setShowAudioHint(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [card.front])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [card.front])

  const normalize = (s: string) =>
    s.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.,!?;:]/g, "")

  const handleVerify = () => {
    const correct = normalize(input) === normalize(card.keyword)
    setIsCorrect(correct)
    setVerified(true)
    onCheck()
  }

  const handleSkip = () => {
    onNext()
  }

  const handleAudioClick = () => {
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
    <div className="w-full max-w-3xl mx-auto px-6 py-12">
      {/* Task header */}
      <div className="text-center space-y-2 mb-10">
        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase rounded-full">
          Sentence Filling
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Complete the Phrase
        </h1>
      </div>

      {/* Exercise card */}
      <div className="bg-white rounded-3xl p-10 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 relative">
        <div className="space-y-10">
          {/* Sentence with blank */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-6 text-3xl md:text-4xl font-semibold text-gray-800 text-center leading-snug">
            {parts.map((part, i) => {
              if (part === "__BLANK__") {
                return (
                  <div key="blank" className="relative group">
                    <label htmlFor="writing-input" className="sr-only">Tu respuesta</label>
                    <input
                      ref={inputRef}
                      id="writing-input"
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && input.trim() && !verified) {
                          handleVerify()
                        }
                      }}
                      placeholder="____"
                      disabled={verified}
                      aria-describedby="writing-hint"
                      className={`bg-gray-50 border-b-4 hover:border-primary/40 focus:border-primary focus:ring-0 rounded-xl px-6 py-3 text-primary font-bold ${inputWidth} text-center transition-all placeholder:text-gray-300 placeholder:text-xl placeholder:font-medium ${
                        verified
                          ? isCorrect
                            ? "border-[#10B981] bg-[#10B981]/10"
                            : "border-[#EF4444] bg-[#EF4444]/10"
                          : "border-primary/20"
                      }`}
                    />
                    {verified && (
                      <span className="absolute -top-2 -right-2 text-lg" aria-hidden="true">
                        {isCorrect ? "✓" : "✗"}
                      </span>
                    )}
                  </div>
                )
              }
              return <span key={i}>{part}</span>
            })}
          </div>

          {/* Digital Mentor Tip */}
          {card.grammar_note && (
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="mt-1 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black tracking-widest uppercase text-primary/60">
                    Tip de tu Mentor Digital
                  </span>
                  <p className="text-gray-600 italic text-base leading-relaxed">
                    {card.grammar_note}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Incorrect answer feedback */}
          {verified && !isCorrect && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-4 text-center">
              <p className="text-[11px] font-bold text-[#991B1B] uppercase tracking-[0.12em] mb-1">
                La palabra correcta es
              </p>
              <p className="text-lg font-bold text-[#991B1B]">{card.keyword}</p>
            </div>
          )}

          {/* Audio hint (if user requested) */}
          {showAudioHint && (
            <div className="bg-[#EBF2FF] border border-[#BFDBFE] rounded-2xl p-4 text-center">
              <p className="text-[11px] font-bold text-[#1e40af] uppercase tracking-[0.12em] mb-2">
                Escucha la pronunciación
              </p>
              <button
                onClick={handleAudioClick}
                aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}
                className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center transition-all ${
                  isPlaying
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Focused Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6">
            <button
              onClick={() => {
                setShowAudioHint(true)
                // Auto-play audio when hint is shown
                if (audioRef.current && audioSrc) {
                  audioRef.current.play().catch(() => setIsPlaying(false))
                  setIsPlaying(true)
                }
              }}
              disabled={showAudioHint || verified}
              className="flex items-center gap-2 text-gray-400 hover:text-primary font-bold text-sm transition-colors px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              <Volume2 className="w-4 h-4" />
              <span>Hear Pronunciation</span>
            </button>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              {!verified ? (
                <>
                  <button
                    onClick={handleSkip}
                    className="flex-1 sm:flex-none bg-gray-100 text-gray-600 px-8 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all text-sm focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleVerify}
                    disabled={!input.trim()}
                    className="flex-1 sm:flex-none bg-primary text-white px-10 py-4 rounded-2xl font-bold shadow-[0_10px_20px_rgba(26,86,219,0.2)] hover:shadow-[0_15px_30px_rgba(26,86,219,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_10px_20px_rgba(26,86,219,0.2)]"
                  >
                    Check Answer
                  </button>
                </>
              ) : (
                <button
                  onClick={onNext}
                  className="flex-1 sm:flex-none bg-primary text-white px-10 py-4 rounded-2xl font-bold shadow-[0_10px_20px_rgba(26,86,219,0.2)] hover:shadow-[0_15px_30px_rgba(26,86,219,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="flex justify-center items-center gap-8 text-gray-400 mt-8">
        <div className="text-[11px] font-bold tracking-widest uppercase">
          Usa <span className="bg-gray-200 px-1.5 py-0.5 rounded text-[10px] mx-1">Enter</span> para verificar
        </div>
      </div>

      {audioSrc && (
        <audio ref={audioRef} src={audioSrc} preload="none" />
      )}
    </div>
  )
}
