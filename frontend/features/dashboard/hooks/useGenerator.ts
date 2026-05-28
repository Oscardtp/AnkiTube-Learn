"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useNotifications } from "@/context/NotificationContext"
import { api } from "@/lib/api"
import type { Deck } from "../types"

export type GenerationStatus =
  | "idle"
  | "extracting"
  | "analyzing"
  | "generating"
  | "completed"
  | "error"

export const GENERATION_MESSAGES: Record<GenerationStatus, string> = {
  idle: "",
  extracting: "Buscando ese video...",
  analyzing: "Analizando el contenido...",
  generating: "Armando tu mazo con IA...",
  completed: "Listo parce, quedó brutal",
  error: "Uy, algo falló",
}

interface UseGeneratorReturn {
  urlInput: string
  setUrlInput: (v: string) => void
  level: string
  setLevel: (v: string) => void
  context: string
  setContext: (v: string) => void
  generating: boolean
  generationStatus: GenerationStatus
  generationError: string
  setGenerationError: (v: string) => void
  generatedDeckId: string | null
  handleGenerate: () => Promise<void>
  resetGenerator: () => void
}

export function useGenerator(decks: Deck[], onDuplicateDetected?: (deck: Deck) => void): UseGeneratorReturn {
  const router = useRouter()
  const { error: notifyError, success } = useNotifications()
  const [urlInput, setUrlInput] = useState("")
  const [level, setLevel] = useState("B1")
  const [context, setContext] = useState("general")
  const [generating, setGenerating] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>("idle")
  const [generationError, setGenerationError] = useState("")
  const [generatedDeckId, setGeneratedDeckId] = useState<string | null>(null)
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
    }
  }, [])

  const advanceStatus = useCallback((from: GenerationStatus, to: GenerationStatus, delay: number) => {
    statusTimerRef.current = setTimeout(() => {
      setGenerationStatus(to)
    }, delay)
  }, [])

  const resetGenerator = useCallback(() => {
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
    setGenerating(false)
    setGenerationStatus("idle")
    setGenerationError("")
    setGeneratedDeckId(null)
    setUrlInput("")
  }, [setUrlInput])

  const handleGenerate = useCallback(async () => {
    if (!urlInput.trim()) return

    const isValidUrl = urlInput.includes("youtube.com/watch") || urlInput.includes("youtu.be/")
    if (!isValidUrl) {
      setGenerationError("Esa URL no parece ser de YouTube, parce")
      return
    }

    let videoId = ""
    if (urlInput.includes("youtube.com/watch")) {
      const url = new URL(urlInput)
      videoId = url.searchParams.get("v") || ""
    } else if (urlInput.includes("youtu.be/")) {
      const url = new URL(urlInput)
      videoId = url.pathname.slice(1)
    }

    if (!videoId) {
      setGenerationError("No se pudo extraer el ID del video")
      return
    }

    const existingDeck = decks.find((d) => d.video_id === videoId && d.level === level)
    if (existingDeck) {
      onDuplicateDetected?.(existingDeck)
      return
    }

    setGenerationError("")
    setGenerating(true)
    setGeneratedDeckId(null)
    setGenerationStatus("extracting")

    advanceStatus("extracting", "analyzing", 2000)
    advanceStatus("analyzing", "generating", 4500)

    try {
      const data = await api.generateDeck({
        youtube_url: urlInput,
        level: level as "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
        context,
      })

      if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
      setGenerationStatus("completed")
      setGeneratedDeckId(data.deck_id)
      success("Qué nota, ya está listo tu mazo")
    } catch (err: unknown) {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
      const message = err instanceof Error ? err.message : "Algo salió mal"
      setGenerationStatus("error")
      setGenerationError(message)
      notifyError(message)
      setGenerating(false)
    }
  }, [urlInput, level, context, decks, onDuplicateDetected, router, notifyError, success, advanceStatus])

  return {
    urlInput, setUrlInput,
    level, setLevel,
    context, setContext,
    generating, generationStatus, generationError, setGenerationError,
    generatedDeckId,
    handleGenerate,
    resetGenerator,
  }
}
