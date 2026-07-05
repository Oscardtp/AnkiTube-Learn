"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
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
  extracting: "Buscando frases en el video...",
  analyzing: "Filtrando frases de calidad...",
  generating: "Seleccionando las mejores...",
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
  cancelGenerator: () => void
  resetGenerator: () => void
}

export function useGenerator(decks: Deck[], onDuplicateDetected?: (deck: Deck) => void): UseGeneratorReturn {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { error: notifyError, success } = useNotifications()
  const [urlInput, setUrlInput] = useState("")
  const [level, setLevel] = useState("B1")
  const [context, setContext] = useState("general")
  const [generating, setGenerating] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>("idle")
  const [generationError, setGenerationError] = useState("")
  const [generatedDeckId, setGeneratedDeckId] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const resetGenerator = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setGenerating(false)
    setGenerationStatus("idle")
    setGenerationError("")
    setGeneratedDeckId(null)
    setUrlInput("")
  }, [setUrlInput])

  const cancelGenerator = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setGenerating(false)
    setGenerationStatus("idle")
    setGenerationError("")
  }, [])

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

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      await api.generateDeckSSE(
        {
          youtube_url: urlInput,
          level: level as "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
          context,
        },
        (event, data) => {
          if (event === "transcript_started") {
            setGenerationStatus("extracting")
          } else if (event === "transcript_complete") {
            // Transcript ready, pipeline will start
          } else if (event === "pipeline_step1_started") {
            setGenerationStatus("extracting")
          } else if (event === "pipeline_step1_complete") {
            setGenerationStatus("analyzing")
          } else if (event === "pipeline_step2_started") {
            setGenerationStatus("analyzing")
          } else if (event === "pipeline_step2_complete") {
            setGenerationStatus("generating")
          } else if (event === "pipeline_step3_started") {
            setGenerationStatus("generating")
          } else if (event === "pipeline_step3_complete") {
            // Step 3 complete - wait for deck_saved
          } else if (event === "deck_saved") {
            // Deck is saved, wait for complete
          } else if (event === "generation_complete") {
            setGenerationStatus("completed")
            setGenerating(false)
            setGeneratedDeckId(data.deck_id as string)
            success("Qué nota, ya está listo tu mazo")
            // Invalidate queries so dashboard shows new deck
            queryClient.invalidateQueries({ queryKey: ["myDecks"] })
            queryClient.invalidateQueries({ queryKey: ["currentUser"] })
          } else if (event === "generation_error") {
            setGenerationStatus("error")
            setGenerationError(data.detail as string || "Algo salió mal")
            notifyError(data.detail as string || "Algo salió mal")
            setGenerating(false)
          }
        },
        abortController.signal,
      )
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // User cancelled — don't show error
        return
      }
      const message = err instanceof Error ? err.message : "Algo salió mal"
      setGenerationStatus("error")
      setGenerationError(message)
      notifyError(message)
      setGenerating(false)
    } finally {
      abortControllerRef.current = null
    }
  }, [urlInput, level, context, decks, onDuplicateDetected, router, notifyError, success, queryClient])

  return {
    urlInput, setUrlInput,
    level, setLevel,
    context, setContext,
    generating, generationStatus, generationError, setGenerationError,
    generatedDeckId,
    handleGenerate,
    cancelGenerator,
    resetGenerator,
  }
}
