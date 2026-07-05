"use client"

import { useState, useEffect, useRef, useMemo } from "react"
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

function createBlanks(front: string, keyword: string): { display: string[]; answers: string[] } {
  if (!front) return { display: [front], answers: [] }

  const words = front.split(" ")
  const answers: string[] = []

  // Find keyword position (case-insensitive)
  const lowerKeyword = keyword?.toLowerCase() || ""
  let blankStart = -1
  let blankEnd = -1

  if (lowerKeyword) {
    const lowerWords = words.map((w) => w.toLowerCase().replace(/[.,!?;:]/g, ""))
    const keywordWords = lowerKeyword.split(" ")

    // Search for keyword phrase in words
    for (let i = 0; i <= lowerWords.length - keywordWords.length; i++) {
      let match = true
      for (let j = 0; j < keywordWords.length; j++) {
        if (lowerWords[i + j] !== keywordWords[j]) {
          match = false
          break
        }
      }
      if (match) {
        blankStart = i
        blankEnd = i + keywordWords.length
        break
      }
    }
  }

  // If keyword not found, blank the last word
  if (blankStart === -1) {
    blankStart = words.length - 1
    blankEnd = words.length
  }

  // Get the answer(s)
  const answerWords = words.slice(blankStart, blankEnd)
  answers.push(answerWords.join(" "))

  // Build display with blank
  const display: string[] = []
  for (let i = 0; i < words.length; i++) {
    if (i === blankStart) {
      display.push("__BLANK__")
    } else if (i >= blankStart && i < blankEnd) {
      // Skip - part of multi-word blank
      continue
    } else {
      display.push(words[i])
    }
  }

  return { display, answers }
}

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

  const audioSrc =
    audioBaseUrl && card.audio_filename
      ? `${audioBaseUrl}/${card.audio_filename}`
      : undefined

  const { display, answers } = useMemo(
    () => createBlanks(card.front, card.keyword),
    [card.front, card.keyword]
  )

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
    s.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.,!?;:]/g, "")

  // Dynamic input width based on keyword length
  const inputWidth = useMemo(() => {
    const len = card.keyword?.length || 0
    if (len <= 5) return "w-28"
    if (len <= 10) return "w-40"
    if (len <= 15) return "w-52"
    if (len <= 20) return "w-64"
    return "w-72"
  }, [card.keyword])

  const handleVerify = () => {
    const userAnswer = normalize(input)
    const correct = answers.some((a) => normalize(a) === userAnswer)
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
          Listening Fill-in-the-Blank
        </span>
        <h2 className="text-xl font-extrabold text-gray-900">
          Complete the missing word
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
            Replay Phrase
          </button>
        </div>
      </div>

      {/* Sentence with blank */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-elevated border border-gray-100">
        <div className="space-y-4">
          {/* Display sentence with blank */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-xl md:text-2xl font-semibold text-gray-800 text-center leading-relaxed">
            {display.map((part, i) => {
              if (part === "__BLANK__") {
                return (
                  <div key="blank" className="relative inline-flex items-center">
                    <label htmlFor="listening-input" className="sr-only">Tu respuesta</label>
                    <input
                      id="listening-input"
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
                      className={`bg-gray-50 border-b-4 focus:border-primary focus:ring-0 rounded-xl px-4 py-2 text-primary font-bold ${inputWidth} text-center transition-all placeholder:text-gray-300 ${
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

          {/* Hint */}
          {showHint && (
            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-4 h-4 text-[#D97706] mt-0.5 shrink-0" />
                <p className="text-sm text-[#92400E]">
                  Hint: <span className="font-bold">{maskWord(card.front)}</span>
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
                {isCorrect ? "Correct!" : "The answer is"}
              </p>
              <p className={`text-lg font-bold ${isCorrect ? "text-[#166534]" : "text-[#991B1B]"}`}>
                {answers[0]}
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
              Need a Hint?
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!verified ? (
                <button
                  onClick={handleVerify}
                  disabled={!input.trim()}
                  className="flex-1 sm:flex-none bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-95 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                >
                  Check Answer
                </button>
              ) : (
                <button
                  onClick={onNext}
                  className="flex-1 sm:flex-none bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-95 active:scale-95 transition-all flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                >
                  Continue
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

function maskWord(text: string) {
  return text
    .split(" ")
    .map((word) => {
      if (word.length <= 3) return word.charAt(0) + "*".repeat(word.length - 1)
      const chars = word.split("")
      return chars
        .map((c, i) => (i === 0 || i === chars.length - 1) ? c : "*")
        .join("")
    })
    .join(" ")
}
