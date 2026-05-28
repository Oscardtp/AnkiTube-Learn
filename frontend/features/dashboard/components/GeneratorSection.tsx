"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useNotifications } from "@/context/NotificationContext"
import { api } from "@/lib/api"
import MaterialIcon from "@/components/MaterialIcon"
import { CEFR_LEVELS, CONTEXTS } from "../types"
import type { Deck } from "../types"
import {
  ChevronDown,
  Briefcase,
  Plane,
  Gamepad2,
  GraduationCap,
  Lock,
} from "lucide-react"

const CONTEXT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  general: GraduationCap,
  work: Briefcase,
  travel: Plane,
  gaming: Gamepad2,
}

interface GeneratorSectionProps {
  decks: Deck[]
  onGenerationStart?: () => void
  onDuplicateDetected?: (deck: Deck) => void
}

export function GeneratorSection({ decks, onDuplicateDetected }: GeneratorSectionProps) {
  const router = useRouter()
  const { error: notifyError, loading: notifyLoading, success } = useNotifications()
  const [urlInput, setUrlInput] = useState("")
  const [level, setLevel] = useState("B1")
  const [context, setContext] = useState("general")
  const [showLevelSelector, setShowLevelSelector] = useState(false)
  const [showContextSelector, setShowContextSelector] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generationError, setGenerationError] = useState("")
  const [generationStep, setGenerationStep] = useState(0)

  const handleGenerate = useCallback(async () => {
    if (!urlInput.trim()) return

    const isValidUrl = urlInput.includes("youtube.com/watch") || urlInput.includes("youtu.be/")
    if (!isValidUrl) {
      setGenerationError("Esa URL no parece ser de YouTube")
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
    setGenerationStep(1)
    notifyLoading("Generando mazo, por favor espera...")

    const stepTimer = setInterval(() => {
      setGenerationStep((prev) => {
        if (prev >= 3) {
          clearInterval(stepTimer)
          return prev
        }
        return prev + 1
      })
    }, 1800)

    try {
      const data = await api.generateDeck({
        youtube_url: urlInput,
        level: level as "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
        context,
      })
      clearInterval(stepTimer)
      success("¡Mazo generado exitosamente!")
      router.push(`/preview/${data.deck_id}`)
    } catch (err: unknown) {
      clearInterval(stepTimer)
      const message = err instanceof Error ? err.message : "Algo salió mal"
      setGenerationError(message)
      notifyError(message)
      setGenerating(false)
      setGenerationStep(0)
    }
  }, [urlInput, level, context, decks, onDuplicateDetected, router, notifyError, notifyLoading, success])

  return (
    <section className="mb-8 md:mb-16">
      <div className="bg-primary rounded-[2rem] p-6 md:p-8 lg:p-12 relative overflow-hidden shadow-2xl shadow-primary/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-container/30 rounded-full -ml-10 -mb-10 blur-2xl" />

        <div className="relative z-10 max-w-2xl">
          <h3 className="text-white text-2xl md:text-3xl font-extrabold mb-4 leading-tight">
            Generar nuevo mazo
          </h3>
          <p className="text-primary-container brightness-150 font-medium mb-6 md:mb-8 text-base md:text-lg">
            Pega el link y yo me encargo del resto. ¡Hágale pues!
          </p>

          {generating && (
            <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-white font-semibold text-sm">
                  {generationStep === 1 ? "Extrayendo" : generationStep === 2 ? "Analizando" : "Generando"}...
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full transition-all ${
                      generationStep > step ? "bg-white" : generationStep === step ? "bg-white scale-125" : "bg-white/30"
                    }`} />
                    {step < 3 && (
                      <div className={`w-6 h-0.5 rounded ${generationStep > step ? "bg-white" : "bg-white/20"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <MaterialIcon name="link" className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 text-xl" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => { setUrlInput(e.target.value); setGenerationError("") }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full pl-12 pr-4 py-4 rounded-full bg-white border-none focus:ring-4 focus:ring-primary-container/50 text-on-surface font-medium placeholder:text-slate-400 shadow-lg"
                  onKeyDown={(e) => e.key === "Enter" && !generating && handleGenerate()}
                  disabled={generating}
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating || !urlInput.trim()}
                className="bg-secondary text-white px-8 md:px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {generating ? (
                  <>
                    <span>Generando...</span>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </>
                ) : (
                  <>
                    <span>Generar</span>
                    <MaterialIcon name="bolt" filled className="text-xl" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-3 text-left">
              <label className="text-sm font-bold text-on-surface ml-1">¿Qué nivel tenés hoy?</label>
              <div className="flex flex-wrap gap-2">
                {CEFR_LEVELS.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setLevel(l.value)}
                    disabled={generating}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
                      level === l.value
                        ? "bg-[#1A56DB] text-[#ffffff] shadow-[#1A56DB]/20"
                        : "bg-[#e6e8ea] text-[#191c1e] hover:bg-[#d1d5db]"
                    } disabled:opacity-50 disabled:hover:scale-100`}
                  >
                    {l.value}
                  </button>
                ))}
              </div>
              <p className="text-xs text-on-surface-variant px-1">
                {CEFR_LEVELS.find((l) => l.value === level)?.desc}
              </p>
            </div>

            <div className="space-y-3 text-left">
              <label className="text-sm font-bold text-on-surface ml-1">¿Para qué necesitás el inglés?</label>
              <div className="flex flex-wrap gap-3">
                {CONTEXTS.slice(0, 1).map((ctx) => {
                  const Icon = CONTEXT_ICONS[ctx.value] || GraduationCap
                  return (
                    <button
                      key={ctx.value}
                      onClick={() => !ctx.locked && setContext(ctx.value)}
                      disabled={generating || ctx.locked}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all ${
                        context === ctx.value
                          ? "bg-[#1A56DB] text-[#ffffff] shadow-[#1A56DB]/20"
                          : "bg-[#e6e8ea] text-[#191c1e] hover:bg-[#d1d5db]"
                      } disabled:opacity-50 disabled:hover:scale-100`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{ctx.label}</span>
                    </button>
                  )
                })}
                <div className="relative">
                  <button
                    onClick={() => setShowContextSelector(!showContextSelector)}
                    disabled={generating}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-surface-container-high text-on-surface hover:bg-surface-container-highest shadow-lg transition-all disabled:opacity-50"
                  >
                    <span>{CONTEXTS.find((c) => c.value === context)?.label || "General"}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showContextSelector && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-outline-variant/20 py-2 z-50 min-w-[200px] divide-y divide-outline-variant/10">
                      {CONTEXTS.slice(1).map((ctx) => {
                        const Icon = CONTEXT_ICONS[ctx.value] || GraduationCap
                        return (
                          <button
                            key={ctx.value}
                            onClick={() => {
                              if (!ctx.locked) { setContext(ctx.value); setShowContextSelector(false) }
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-surface-container-high transition-colors flex items-center gap-2 ${
                              ctx.locked
                                ? "text-primary border-2 border-primary bg-transparent cursor-not-allowed"
                                : context === ctx.value
                                ? "text-white bg-primary font-bold"
                                : "text-on-surface"
                            }`}
                            disabled={!!ctx.locked}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="truncate">{ctx.label}</span>
                            {ctx.locked && <Lock className="w-3 h-3 ml-auto flex-shrink-0 text-outline" />}
                            {ctx.locked && <span className="text-[10px] text-outline">PRO</span>}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-on-surface-variant px-1">
                {CONTEXTS.find((c) => c.value === context)?.desc}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <div className="relative flex-1">
                <button
                  onClick={() => setShowLevelSelector(!showLevelSelector)}
                  disabled={generating}
                  className="w-full flex items-center justify-between gap-2 bg-secondary text-white px-4 py-3 rounded-xl text-sm font-bold shadow-lg shadow-secondary/30 hover:scale-105 hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <span>Nivel {level}</span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                </button>
                {showLevelSelector && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-outline-variant/20 py-2 z-50 min-w-[200px] divide-y divide-outline-variant/10">
                    {CEFR_LEVELS.map((l) => (
                      <button
                        key={l.value}
                        onClick={() => { setLevel(l.value); setShowLevelSelector(false) }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-surface-container-high transition-colors ${
                          level === l.value ? "text-white bg-primary font-bold" : "text-on-surface"
                        }`}
                      >
                        <span className="font-semibold">{l.value}</span>
                        <span className="text-on-surface-variant text-[11px] ml-1">— {l.desc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative flex-1">
                <button
                  onClick={() => setShowContextSelector(!showContextSelector)}
                  disabled={generating}
                  className="w-full flex items-center justify-between gap-2 bg-tertiary-fixed text-on-tertiary px-4 py-3 rounded-xl text-sm font-bold shadow-lg shadow-tertiary/30 hover:scale-105 hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <span className="truncate">{CONTEXTS.find((c) => c.value === context)?.label || "General"}</span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                </button>
                {showContextSelector && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-outline-variant/20 py-2 z-50 min-w-[200px] divide-y divide-outline-variant/10">
                    {CONTEXTS.map((ctx) => {
                      const Icon = CONTEXT_ICONS[ctx.value] || GraduationCap
                      return (
                        <button
                          key={ctx.value}
                          onClick={() => {
                            if (!ctx.locked) { setContext(ctx.value); setShowContextSelector(false) }
                          }}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-surface-container-high transition-colors flex items-center gap-2 ${
                            ctx.locked
                              ? "text-primary border-2 border-primary bg-transparent cursor-not-allowed"
                              : context === ctx.value
                              ? "text-white bg-primary font-bold"
                              : "text-on-surface"
                          }`}
                          disabled={!!ctx.locked}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{ctx.label}</span>
                          {ctx.locked && <Lock className="w-4 h-4 ml-auto flex-shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {generationError && (
            <p className="mt-3 text-sm text-white/90 bg-white/10 px-4 py-2 rounded-lg">
              {generationError}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
