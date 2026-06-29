"use client"

import { useState, useEffect, useRef } from "react"

export interface StudyCard {
  card_index: number
  front: string
  back: string
  keyword: string
  grammar_note: string
  context_note: string
  colombian_note: string
  timestamp_start: number
  timestamp_end: number
  audio_filename: string
  card_type: string
  sm2_data: {
    interval: number
    easiness: number
    reps: number
    due_date: string | null
    last_reviewed: string | null
  } | null
}

export interface StudyResult {
  card_id: string
  quality: number
  skill?: string
}

interface UseSM2State {
  cards: StudyCard[]
  currentIndex: number
  isFlipped: boolean
  results: StudyResult[]
  sessionStartTime: number
  isComplete: boolean
  answeredCount: number
}

const STORAGE_KEY = "ankitube-sm2-progress"

function loadProgress(): Partial<UseSM2State> | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveProgress(state: Partial<UseSM2State>) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      cards: state.cards,
      currentIndex: state.currentIndex,
      results: state.results,
      sessionStartTime: state.sessionStartTime,
      answeredCount: state.answeredCount,
    }))
  } catch {
    // ignore
  }
}

export function useSM2(initialCards: StudyCard[]) {
  const saved = useRef(loadProgress())
  const [state, setState] = useState<UseSM2State>(() => {
    const s = saved.current
    if (s && s.cards && s.cards.length > 0 && s.currentIndex !== undefined && s.currentIndex < s.cards.length) {
      return {
        cards: s.cards,
        currentIndex: s.currentIndex as number,
        isFlipped: false,
        results: s.results || [],
        sessionStartTime: s.sessionStartTime || Date.now(),
        isComplete: false,
        answeredCount: s.answeredCount || 0,
      }
    }
    return {
      cards: initialCards,
      currentIndex: 0,
      isFlipped: false,
      results: [],
      sessionStartTime: Date.now(),
      isComplete: false,
      answeredCount: 0,
    }
  })

  // Sync when initialCards changes (API response arrives after first render)
  const prevCardsRef = useRef(initialCards)
  useEffect(() => {
    if (
      initialCards.length > 0 &&
      initialCards !== prevCardsRef.current &&
      state.cards.length === 0
    ) {
      setState(s => ({
        ...s,
        cards: initialCards,
      }))
    }
    prevCardsRef.current = initialCards
  }, [initialCards, state.cards.length])

  useEffect(() => {
    if (state.cards.length > 0) {
      saveProgress(state)
    }
  }, [state])

  const currentCard = state.cards[state.currentIndex] || null

  const flip = () => {
    setState(s => ({ ...s, isFlipped: !s.isFlipped }))
  }

  const resetFlip = () => {
    setState(s => ({ ...s, isFlipped: false }))
  }

  const answer = (quality: number) => {
    setState(s => {
      const newResults = [
        ...s.results,
        { card_id: String(s.cards[s.currentIndex].card_index), quality },
      ]
      const nextIndex = s.currentIndex + 1
      const isComplete = nextIndex >= s.cards.length

      if (isComplete) {
        localStorage.removeItem(STORAGE_KEY)
      }

      return {
        ...s,
        results: newResults,
        currentIndex: nextIndex,
        isFlipped: false,
        isComplete,
        answeredCount: s.answeredCount + 1,
      }
    })
  }

  const skip = () => {
    setState(s => {
      const nextIndex = s.currentIndex + 1
      return {
        ...s,
        currentIndex: nextIndex,
        isFlipped: false,
        isComplete: nextIndex >= s.cards.length,
      }
    })
  }

  const restart = () => {
    localStorage.removeItem(STORAGE_KEY)
    setState({
      cards: initialCards,
      currentIndex: 0,
      isFlipped: false,
      results: [],
      sessionStartTime: Date.now(),
      isComplete: false,
      answeredCount: 0,
    })
  }

  const progress = state.cards.length > 0
    ? (state.currentIndex / state.cards.length) * 100
    : 0

  return {
    currentCard,
    currentIndex: state.currentIndex,
    totalCards: state.cards.length,
    isFlipped: state.isFlipped,
    results: state.results,
    sessionStartTime: state.sessionStartTime,
    isComplete: state.isComplete,
    answeredCount: state.answeredCount,
    progress,
    flip,
    resetFlip,
    answer,
    skip,
    restart,
  }
}
