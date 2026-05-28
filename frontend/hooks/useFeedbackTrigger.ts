"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface UseFeedbackTriggerOptions {
  triggerDelayMs?: number
  autoDismissMs?: number
  enabled?: boolean
}

export function useFeedbackTrigger({
  triggerDelayMs = 3000,
  autoDismissMs = 8000,
  enabled = true,
}: UseFeedbackTriggerOptions = {}) {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const triggerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const cleanup = useCallback(() => {
    if (triggerTimerRef.current) clearTimeout(triggerTimerRef.current)
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    triggerTimerRef.current = null
    dismissTimerRef.current = null
    progressIntervalRef.current = null
  }, [])

  const trigger = useCallback(() => {
    if (!enabled) return

    cleanup()

    triggerTimerRef.current = setTimeout(() => {
      setVisible(true)
      setProgress(0)

      const startTime = Date.now()
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime
        const pct = Math.min((elapsed / autoDismissMs) * 100, 100)
        setProgress(pct)

        if (pct >= 100) {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
        }
      }, 50)

      dismissTimerRef.current = setTimeout(() => {
        setVisible(false)
        setProgress(0)
        cleanup()
      }, autoDismissMs)
    }, triggerDelayMs)
  }, [enabled, triggerDelayMs, autoDismissMs, cleanup])

  const dismiss = useCallback(() => {
    cleanup()
    setVisible(false)
    setProgress(0)
  }, [cleanup])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  return {
    visible,
    progress,
    trigger,
    dismiss,
  }
}
