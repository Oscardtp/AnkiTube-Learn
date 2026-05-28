"use client"

import { useState, useEffect, useCallback, useRef } from "react"

const INTERRUPTION_WINDOW_SECONDS = 30

export function usePreviewSession() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [primaryActionCompleted, setPrimaryActionCompleted] = useState(false)
  const [primaryActionTime, setPrimaryActionTime] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const markPrimaryComplete = useCallback(() => {
    setPrimaryActionCompleted(true)
    setPrimaryActionTime(Date.now())
  }, [])

  const canShowSecondaryUI = useCallback(() => {
    if (!primaryActionCompleted || primaryActionTime === null) return false
    const secondsSinceAction = Math.floor((Date.now() - primaryActionTime) / 1000)
    return secondsSinceAction >= INTERRUPTION_WINDOW_SECONDS
  }, [primaryActionCompleted, primaryActionTime])

  const isWithinInterruptionWindow = useCallback(() => {
    return !canShowSecondaryUI()
  }, [canShowSecondaryUI])

  return {
    elapsedSeconds,
    primaryActionCompleted,
    markPrimaryComplete,
    canShowSecondaryUI,
    isWithinInterruptionWindow,
  }
}
