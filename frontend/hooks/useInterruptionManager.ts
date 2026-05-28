"use client"

import { useState, useEffect, useCallback } from "react"

interface InterruptionState {
  currentPage: string
  primaryActionCompleted: boolean
  secondsSincePrimaryAction: number
  activeInterruption: string | null
  interruptionsShownThisSession: string[]
}

interface UseInterruptionManagerReturn extends InterruptionState {
  markPrimaryComplete: () => void
  canShow: (triggerId: string, minSeconds?: number) => boolean
  show: (triggerId: string) => void
  dismiss: () => void
  setCurrentPage: (page: string) => void
}

export function useInterruptionManager(): UseInterruptionManagerReturn {
  const [state, setState] = useState<InterruptionState>({
    currentPage: "",
    primaryActionCompleted: false,
    secondsSincePrimaryAction: 0,
    activeInterruption: null,
    interruptionsShownThisSession: [],
  })

  const markPrimaryComplete = useCallback(() => {
    setState((prev) => ({
      ...prev,
      primaryActionCompleted: true,
      secondsSincePrimaryAction: 0,
    }))
  }, [])

  const canShow = useCallback(
    (triggerId: string, minSeconds: number = 3): boolean => {
      return (
        state.primaryActionCompleted &&
        state.secondsSincePrimaryAction >= minSeconds &&
        state.activeInterruption === null &&
        !state.interruptionsShownThisSession.includes(triggerId)
      )
    },
    [state.primaryActionCompleted, state.secondsSincePrimaryAction, state.activeInterruption, state.interruptionsShownThisSession],
  )

  const show = useCallback((triggerId: string) => {
    setState((prev) => ({
      ...prev,
      activeInterruption: triggerId,
      interruptionsShownThisSession: [...prev.interruptionsShownThisSession, triggerId],
    }))
  }, [])

  const dismiss = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activeInterruption: null,
    }))
  }, [])

  const setCurrentPage = useCallback((page: string) => {
    setState((prev) => ({
      ...prev,
      currentPage: page,
    }))
  }, [])

  useEffect(() => {
    if (!state.primaryActionCompleted) return

    const interval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        secondsSincePrimaryAction: prev.secondsSincePrimaryAction + 1,
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [state.primaryActionCompleted])

  return {
    ...state,
    markPrimaryComplete,
    canShow,
    show,
    dismiss,
    setCurrentPage,
  }
}