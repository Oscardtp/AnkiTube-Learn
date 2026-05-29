"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import {
  Play,
  Sparkles,
  ChevronDown,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import { CEFR_LEVELS, CONTEXTS, STATUS_MESSAGES } from "../data"
import { api } from "@/lib/api"

type GenStatus = "idle" | "extracting" | "analyzing" | "generating" | "completed" | "error"

export default function GeneratorSection() {
  const [url, setUrl] = useState("")
  const [level, setLevel] = useState("B1")
  const [context, setContext] = useState("general")
  const [loading, setLoading] = useState(false)
  const [genStatus, setGenStatus] = useState<GenStatus>("idle")
  const [error, setError] = useState("")
  const [generatedDeckId, setGeneratedDeckId] = useState<string | null>(null)
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isValidUrl = url.includes("youtube.com/watch") || url.includes("youtu.be/")

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
    }
  }, [])

  function advanceStatus(to: GenStatus, delay: number) {
    statusTimerRef.current = setTimeout(() => setGenStatus(to), delay)
  }

  async function handleGenerate() {
    if (!url.trim()) {
      setError("Pega la URL del video de YouTube que quieres convertir")
      return
    }
    if (!isValidUrl) {
      setError("Esa URL no parece ser de YouTube, parce")
      return
    }

    setError("")
    setLoading(true)
    setGenStatus("extracting")
    setGeneratedDeckId(null)

    advanceStatus("analyzing", 2000)
    advanceStatus("generating", 4500)

    try {
      const data = await api.generateDeck({
        youtube_url: url,
        level: level as "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
        context,
      })

      if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
      setGenStatus("completed")
      setGeneratedDeckId(data.deck_id)
      setLoading(false)
    } catch (err: unknown) {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
      const error = err as { message?: string }
      setGenStatus("error")
      setError(error.message || "Uy, algo falló. Intenta de nuevo.")
      setLoading(false)
    }
  }

  function handleReset() {
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
    setGenStatus("idle")
    setGeneratedDeckId(null)
    setUrl("")
    setError("")
  }

  return (
    <section id="generador" className="section-padding bg-surface-container-low">
      <div className="container-limit">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4">
            Empieza ahora. Sin complicaciones.
          </h2>
          <p className="text-lg text-on-surface-variant max-w-xl mx-auto">
            Pega la URL de cualquier video de YouTube y genera tu mazo Anki en segundos.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-elevated">
            {/* URL Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-on-surface mb-2">
                URL del video de YouTube
              </label>
              <div className="relative">
                <Play className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    setError("")
                  }}
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-4 pl-12 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  disabled={loading}
                />
              </div>
              {error && <p className="mt-2 text-sm text-error">{error}</p>}
            </div>

            {/* CEFR Level */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-on-surface mb-2">
                Tu nivel de inglés (CEFR)
              </label>
              <div className="relative">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3.5 pr-10 text-on-surface appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  disabled={loading}
                >
                  {CEFR_LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label} — {l.desc}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline pointer-events-none" />
              </div>
              <p className="text-xs text-on-surface-variant mt-2">
                ¿No sabes tu nivel? Elige <span className="font-medium text-on-surface">B1</span> si entiendes series con subtítulos
              </p>
            </div>

            {/* Context Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-on-surface mb-3">
                Contexto de aprendizaje
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CONTEXTS.map((ctx) => {
                  const Icon = ctx.icon
                  const isSelected = context === ctx.value
                  return (
                    <button
                      key={ctx.value}
                      onClick={() => setContext(ctx.value)}
                      disabled={loading}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-primary bg-primary-container/20 text-on-primary-container"
                          : "border-outline-variant/50 bg-surface hover:border-primary/50 text-on-surface-variant"
                      } disabled:opacity-50`}
                    >
                      <Icon className={`w-6 h-6 ${isSelected ? "text-primary" : ""}`} />
                      <div className="text-center">
                        <span className={`block text-sm font-medium ${isSelected ? "text-primary" : "text-on-surface"}`}>{ctx.label}</span>
                        <span className={`text-xs ${isSelected ? "text-on-surface-variant" : "text-outline"}`}>
                          {ctx.desc}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Progress */}
            {(genStatus === "extracting" || genStatus === "analyzing" || genStatus === "generating") && (
              <div className="mb-6 p-5 bg-primary-container/20 rounded-xl border border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <span className="text-sm font-semibold text-on-surface">
                    {STATUS_MESSAGES[genStatus]}
                  </span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-primary to-primary-container h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${genStatus === "extracting" ? 33 : genStatus === "analyzing" ? 66 : 90}%` }}
                  />
                </div>
                <div className="flex justify-between mt-3">
                  {(["extracting", "analyzing", "generating"] as const).map((step, i) => {
                    const statusOrder: readonly string[] = ["extracting", "analyzing", "generating"]
                    const currentIdx = statusOrder.indexOf(genStatus)
                    return (
                      <span
                        key={step}
                        className={`text-xs transition-colors ${
                          i <= currentIdx ? "text-primary font-medium" : "text-outline"
                        }`}
                      >
                        {step === "extracting" ? "Extrayendo" : step === "analyzing" ? "Analizando" : "Generando"}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Completed State */}
            {genStatus === "completed" && generatedDeckId && (
              <div className="mb-6 p-5 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-emerald-800 mb-1">Quedó brutal</p>
                <p className="text-xs text-emerald-700 mb-4">Tu mazo está listo para estudiar.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href={`/preview/${generatedDeckId}`}
                    className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-all"
                  >
                    Ver mazo
                  </Link>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center justify-center gap-2 bg-surface-container-high text-on-surface px-6 py-3 rounded-full font-bold text-sm hover:bg-surface-container-highest transition-all"
                  >
                    Generar otro
                  </button>
                </div>
              </div>
            )}

            {/* CTA */}
            {genStatus !== "completed" && (
              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full font-bold text-base transition-all duration-200 ${
                  loading
                    ? "bg-surface-variant text-on-surface-variant cursor-not-allowed"
                    : "bg-gradient-to-r from-primary to-primary-container text-white shadow-lg shadow-primary/30 hover:opacity-90 hover:shadow-xl active:scale-[0.98]"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {STATUS_MESSAGES[genStatus] || "Generando tu mazo..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generar mazo gratis
                  </>
                )}
              </button>
            )}

            <p className="text-center text-xs text-on-surface-variant mt-4">
              Sin tarjeta de crédito · Sin registro · 1 mazo gratis por día
            </p>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { number: "2 min", label: "Tiempo promedio" },
              { number: "100%", label: "Audio real del video" },
              { number: "A1–C2", label: "Todos los niveles" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-surface-container-lowest rounded-xl p-4 text-center shadow-sm"
              >
                <div className="text-2xl md:text-3xl font-black text-primary">{stat.number}</div>
                <div className="text-xs text-on-surface-variant mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
