"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface UseLoopAnimationOptions {
  stepCount: number
  intervalMs?: number
  pauseMs?: number
  enabled?: boolean
}

export function useLoopAnimation({
  stepCount,
  intervalMs = 1100,
  pauseMs = 600,
  enabled = true,
}: UseLoopAnimationOptions) {
  const [currentStep, setCurrentStep] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      clearTimer()
      setIsRunning(false)
      setCurrentStep(-1)
      return
    }

    setIsRunning(true)
    let step = -1

    function advance() {
      step++
      if (step > stepCount) {
        setCurrentStep(-1)
        step = -1
        timeoutRef.current = setTimeout(advance, pauseMs)
        return
      }
      setCurrentStep(step)
      timeoutRef.current = setTimeout(advance, intervalMs)
    }

    timeoutRef.current = setTimeout(advance, intervalMs)

    return () => clearTimer()
  }, [enabled, stepCount, intervalMs, pauseMs, clearTimer])

  return { currentStep, isRunning }
}
