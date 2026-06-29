"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, AlertCircle, ChevronLeft, RotateCcw } from "lucide-react"
import StudyNavbar from "@/components/study/StudyNavbar"
import StudyCardFlip from "@/components/study/CardFlip"
import SM2Buttons from "@/components/study/SM2Buttons"
import FillInTheBlank from "@/components/study/FillInTheBlank"
import SessionComplete from "@/components/study/SessionComplete"
import SkillSelector, { type SkillType } from "@/components/study/SkillSelector"
import WritingExercise from "@/components/study/WritingExercise"
import ListeningExercise from "@/components/study/ListeningExercise"
import ReadingExercise from "@/components/study/ReadingExercise"
import { useSM2, type StudyCard, type StudyResult } from "@/hooks/useSM2"
import { api } from "@/lib/api"

const AUDIO_BASE_URL = process.env.NEXT_PUBLIC_AUDIO_URL || "http://localhost:8000/audio"

const SKILL_LABELS: Record<SkillType, string> = {
  srs: "SRS",
  writing: "Writing",
  listening: "Listening",
  reading: "Reading",
}

type CardPhase = "srs" | "writing" | "listening"

function getOrderedPhases(skills: SkillType[]): CardPhase[] {
  const phases: CardPhase[] = []
  if (skills.includes("srs")) phases.push("srs")
  if (skills.includes("writing")) phases.push("writing")
  if (skills.includes("listening")) phases.push("listening")
  return phases
}

function isCardKnown(card: StudyCard): boolean {
  const sm2 = card.sm2_data
  if (!sm2) return false
  return sm2.easiness >= 2.5 && sm2.reps > 0
}

function getPhasesForCard(skills: SkillType[], card: StudyCard | null): CardPhase[] {
  if (!card) return getOrderedPhases(skills)
  const all = getOrderedPhases(skills)
  if (!isCardKnown(card)) {
    return all.filter((p) => p !== "writing")
  }
  return all
}

export default function StudyPage() {
  const params = useParams()
  const router = useRouter()
  const deckId = (params?.deck_id as string) ?? ""

  const [cards, setCards] = useState<StudyCard[]>([])
  const [deckTitle, setDeckTitle] = useState("")
  const [videoId, setVideoId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionDuration, setSessionDuration] = useState(0)
  const [streakDays, setStreakDays] = useState(0)

  // Skill management
  const [selectedSkills, setSelectedSkills] = useState<SkillType[]>([])
  const [showSkillSelector, setShowSkillSelector] = useState(true)
  const [cardPhase, setCardPhase] = useState<CardPhase>("srs")
  const [allResults, setAllResults] = useState<StudyResult[]>([])
  const [completedCount, setCompletedCount] = useState(0)

  const sm2 = useSM2(cards)
  const errorRef = useRef<HTMLHeadingElement>(null)
  const submittedRef = useRef(false)

  const hasReading = selectedSkills.includes("reading")

  // Total exercises: sum per-card phases + reading
  const totalExercises = useMemo(() => {
    const cardExercises = cards.reduce((sum, card) => {
      return sum + getPhasesForCard(selectedSkills, card).length
    }, 0)
    return hasReading ? cardExercises + 1 : cardExercises
  }, [cards, selectedSkills, hasReading])

  // Fetch study status
  useEffect(() => {
    if (!deckId) return
    let cancelled = false

    async function fetchStatus() {
      try {
        const status = await api.getStudyStatus(deckId)
        if (cancelled) return
        setCards(status.cards)
        setDeckTitle(status.video_title)
        setVideoId(status.video_id || "")
        setStreakDays(status.streak_days || 0)
        setIsLoading(false)
      } catch (err: unknown) {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : "Error al cargar el mazo"
        setError(msg)
        setIsLoading(false)
      }
    }

    fetchStatus()
    return () => { cancelled = true }
  }, [deckId])

  // Focus management for error state
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus()
    }
  }, [error])

  // Track session duration
  useEffect(() => {
    if (completedCount >= totalExercises && totalExercises > 0) {
      setSessionDuration(Math.floor((Date.now() - sm2.sessionStartTime) / 1000))
      return
    }
    const interval = setInterval(() => {
      setSessionDuration(Math.floor((Date.now() - sm2.sessionStartTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [completedCount, totalExercises, sm2.sessionStartTime])

  // Submit results on completion
  useEffect(() => {
    if (completedCount < totalExercises || totalExercises === 0 || !deckId || submittedRef.current) return
    submittedRef.current = true
    api.submitStudyResults(deckId, allResults, sessionDuration).catch(() => {})
  }, [completedCount, totalExercises, allResults, sessionDuration, deckId])

  // Warn before leaving
  useEffect(() => {
    if (completedCount > 0 && completedCount < totalExercises) {
      const handler = (e: BeforeUnloadEvent) => { e.preventDefault() }
      window.addEventListener("beforeunload", handler)
      return () => window.removeEventListener("beforeunload", handler)
    }
  }, [completedCount, totalExercises])

  // Determine next phase within current card
  const getNextPhase = useCallback((current: CardPhase): CardPhase | null => {
    const cardPhases = getPhasesForCard(selectedSkills, sm2.currentCard)
    const idx = cardPhases.indexOf(current)
    if (idx < cardPhases.length - 1) return cardPhases[idx + 1]
    return null
  }, [selectedSkills, sm2.currentCard])

  // Skill selector
  const handleStartSession = useCallback((skills: SkillType[]) => {
    setSelectedSkills(skills)
    setShowSkillSelector(false)
    setCardPhase(getOrderedPhases(skills)[0] || "srs")
    setAllResults([])
    setCompletedCount(0)
    submittedRef.current = false
  }, [])

  // SRS answer handler
  const handleSRSAnswer = useCallback((quality: number) => {
    const card = sm2.currentCard
    if (!card) return

    setAllResults((prev) => [...prev, { card_id: String(card.card_index), quality, skill: "srs" }])
    setCompletedCount((prev) => prev + 1)

    const next = getNextPhase("srs")
    if (next) {
      setCardPhase(next)
    } else {
      sm2.answer(quality)
      setCardPhase("srs")
    }
  }, [sm2, getNextPhase])

  // Writing handlers
  const handleWritingCheck = useCallback(() => {}, [])

  const handleWritingNext = useCallback(() => {
    const card = sm2.currentCard
    if (!card) return

    setAllResults((prev) => [...prev, { card_id: String(card.card_index), quality: 4, skill: "writing" }])
    setCompletedCount((prev) => prev + 1)

    const next = getNextPhase("writing")
    if (next) {
      setCardPhase(next)
    } else {
      sm2.skip()
      setCardPhase("srs")
    }
  }, [sm2, getNextPhase])

  // Listening handlers
  const handleListeningCheck = useCallback(() => {}, [])

  const handleListeningNext = useCallback(() => {
    const card = sm2.currentCard
    if (!card) return

    setAllResults((prev) => [...prev, { card_id: String(card.card_index), quality: 4, skill: "listening" }])
    setCompletedCount((prev) => prev + 1)

    const next = getNextPhase("listening")
    if (next) {
      setCardPhase(next)
    } else {
      sm2.skip()
      setCardPhase("srs")
    }
  }, [sm2, getNextPhase])

  // Reading handler
  const handleReadingDone = useCallback(() => {
    setAllResults((prev) => [...prev, { card_id: "reading-session", quality: 5, skill: "reading" }])
    setCompletedCount((prev) => prev + 1)
  }, [])

  // Is current skill complete?
  const isAllComplete = completedCount >= totalExercises && totalExercises > 0

  // Keyboard shortcuts for SRS
  useEffect(() => {
    if (cardPhase !== "srs") return
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        sm2.flip()
      }
      if (sm2.isFlipped) {
        if (e.key === "1") handleSRSAnswer(0)
        if (e.key === "2") handleSRSAnswer(2)
        if (e.key === "3") handleSRSAnswer(4)
        if (e.key === "4") handleSRSAnswer(5)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [cardPhase, sm2.isFlipped, sm2, handleSRSAnswer])

  const handleExit = useCallback(() => {
    router.push(`/preview/${deckId}`)
  }, [router, deckId])

  const handleRestart = useCallback(() => {
    submittedRef.current = false
    setCompletedCount(0)
    setAllResults([])
    setShowSkillSelector(true)
    sm2.restart()
  }, [sm2])

  const handleRetry = useCallback(() => {
    setError(null)
    setIsLoading(true)
    window.location.reload()
  }, [])

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-gray-500 font-medium">Cargando tarjetas...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="p-6 max-w-3xl mx-auto">
          <div role="alert" className="bg-red-50 rounded-xl p-6 border border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h2 ref={errorRef} tabIndex={-1} className="text-lg font-semibold text-red-900">Error</h2>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="flex gap-3">
              <button onClick={handleRetry} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2">
                <RotateCcw className="w-4 h-4" /> Reintentar
              </button>
              <button onClick={handleExit} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2">
                <ChevronLeft className="w-4 h-4" /> Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // No cards
  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-surface">
        <StudyNavbar deckTitle={deckTitle} current={0} total={0} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <div className="text-center">
            <p aria-hidden="true" className="text-5xl mb-4">🎉</p>
            <span className="sr-only">¡Felicidades!</span>
            <h1 className="text-xl font-bold text-gray-900 mb-2">¡Todo revisado!</h1>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">No hay tarjetas pendientes.</p>
            <button onClick={handleExit} className="bg-primary text-white font-bold px-6 py-3 rounded-full transition-all active:scale-[0.98] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2">
              Volver al mazo
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Skill selector
  if (showSkillSelector) {
    return <SkillSelector onStart={handleStartSession} />
  }

  // Session complete
  if (isAllComplete) {
    return (
      <SessionComplete
        results={allResults}
        totalCards={cards.length}
        sessionDurationSeconds={sessionDuration}
        streakDays={streakDays}
        onRestart={handleRestart}
        onExit={handleExit}
      />
    )
  }

  // Reading phase (after all cards)
  if (hasReading && sm2.isComplete) {
    return (
      <div className="min-h-screen bg-surface">
        <StudyNavbar deckTitle={deckTitle} current={completedCount + 1} total={totalExercises} skillLabel="Reading" />
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          <ReadingExercise cards={cards} deckTitle={deckTitle} audioBaseUrl={AUDIO_BASE_URL} videoId={videoId} onDone={handleReadingDone} />
        </div>
      </div>
    )
  }

  // Active study
  const progressPercent = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0

  return (
    <div className="min-h-screen bg-surface">
      <a href="#study-card" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">
        Saltar al contenido
      </a>

      <StudyNavbar deckTitle={deckTitle} current={completedCount + 1} total={totalExercises} skillLabel={SKILL_LABELS[cardPhase]} />

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {cardPhase === "srs" && (sm2.isFlipped ? `Respuesta: ${sm2.currentCard?.back}` : `Tarjeta ${sm2.currentIndex + 1} de ${sm2.totalCards}`)}
        {cardPhase === "writing" && `Ejercicio de escritura: tarjeta ${sm2.currentIndex + 1} de ${sm2.totalCards}`}
        {cardPhase === "listening" && `Ejercicio de escucha: tarjeta ${sm2.currentIndex + 1} de ${sm2.totalCards}`}
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* SRS Phase */}
        {cardPhase === "srs" && (
          <>
            <div key={`srs-${sm2.currentIndex}`} id="study-card" className="animate-fade-in">
              {sm2.currentCard && (
                <StudyCardFlip card={sm2.currentCard} isFlipped={sm2.isFlipped} onFlip={sm2.flip} audioBaseUrl={AUDIO_BASE_URL} />
              )}
            </div>

            {sm2.currentCard?.card_type === "vocabulary" && !sm2.isFlipped && (
              <FillInTheBlank key={sm2.currentCard.front} answer={sm2.currentCard.back} onReveal={sm2.flip} />
            )}

            {sm2.isFlipped && (
              <div className="space-y-4 animate-fade-in">
                <SM2Buttons onAnswer={handleSRSAnswer} />
                <div className="flex justify-center">
                  <button onClick={() => { sm2.skip(); setCardPhase("srs") }} className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium py-3 px-6 min-h-[44px] focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2">
                    Saltar esta tarjeta
                  </button>
                </div>
              </div>
            )}

            {!sm2.isFlipped && (
              <div className="text-center mt-6">
                <p className="text-sm text-gray-500">Toca la tarjeta para ver la respuesta</p>
              </div>
            )}
          </>
        )}

        {/* Writing Phase */}
        {cardPhase === "writing" && sm2.currentCard && (
          <div id="study-card" className="animate-fade-in">
            <WritingExercise card={sm2.currentCard} audioBaseUrl={AUDIO_BASE_URL} onCheck={handleWritingCheck} onNext={handleWritingNext} />
          </div>
        )}

        {/* Listening Phase */}
        {cardPhase === "listening" && sm2.currentCard && (
          <div id="study-card" className="animate-fade-in">
            <ListeningExercise card={sm2.currentCard} audioBaseUrl={AUDIO_BASE_URL} onCheck={handleListeningCheck} onNext={handleListeningNext} />
          </div>
        )}

        {/* Phase dots */}
        {sm2.currentCard && (() => {
          const cardPhases = getPhasesForCard(selectedSkills, sm2.currentCard)
          return cardPhases.length > 1 ? (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2" role="group" aria-label="Fases de la tarjeta actual">
                {cardPhases.map((phase) => (
                  <div
                    key={phase}
                    className={`w-2 h-2 rounded-full transition-all ${
                      phase === cardPhase ? "bg-primary w-6" : "bg-gray-300"
                    }`}
                    aria-label={`${SKILL_LABELS[phase]}: ${phase === cardPhase ? "actual" : "pendiente"}`}
                  />
                ))}
              </div>
            </div>
          ) : null
        })()}
      </div>
    </div>
  )
}
