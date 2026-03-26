"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Play, ChevronDown, Loader2, Sparkles, Briefcase, Plane, Gamepad2, GraduationCap } from "lucide-react"

const CEFR_LEVELS = [
  { value: "A1", label: "A1 — Principiante", desc: "Saludos, números, colores" },
  { value: "A2", label: "A2 — Básico", desc: "Situaciones simples del día a día" },
  { value: "B1", label: "B1 — Intermedio", desc: "Entiendo series con subtítulos" },
  { value: "B2", label: "B2 — Intermedio-alto", desc: "Películas sin subtítulos" },
  { value: "C1", label: "C1 — Avanzado", desc: "Uso flexible y profesional" },
  { value: "C2", label: "C2 — Maestría", desc: "Dominio casi nativo" },
]

const CONTEXTS = [
  { value: "general", label: "General", icon: GraduationCap, desc: "Mezcla equilibrada de todo" },
  { value: "work", label: "Trabajo", icon: Briefcase, desc: "Llamadas, emails, reuniones" },
  { value: "travel", label: "Viajes", icon: Plane, desc: "Aeropuertos, hoteles, restaurantes" },
  { value: "gaming", label: "Gaming", icon: Gamepad2, desc: "Vocabulario de videojuegos" },
]

const PROGRESS_STEPS = [
  { id: 1, label: "Extrayendo transcripción..." },
  { id: 2, label: "Analizando frases clave..." },
  { id: 3, label: "Generando tarjetas..." },
]

export default function GeneratePage() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [level, setLevel] = useState("B1")
  const [context, setContext] = useState("general")
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState("")

  const isValidUrl = url.includes("youtube.com/watch") || url.includes("youtu.be/")

  async function handleGenerate() {
    if (!url.trim()) {
      setError("Pega la URL del video de YouTube que quieres convertir")
      return
    }
    if (!isValidUrl) {
      setError("Esa URL no parece ser de YouTube. Verifica que empiece con youtube.com/watch o youtu.be/")
      return
    }

    setError("")
    setLoading(true)
    setCurrentStep(1)

    // Simulate progress steps
    const stepTimer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= 3) {
          clearInterval(stepTimer)
          return prev
        }
        return prev + 1
      })
    }, 1800)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
      const res = await fetch(`${apiUrl}/api/decks/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtube_url: url,
          level,
          context,
        }),
      })

      clearInterval(stepTimer)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || "No pudimos generar el mazo. Intenta de nuevo.")
      }

      const data = await res.json()
      router.push(`/preview/${data.deck_id}`)

    } catch (err: any) {
      clearInterval(stepTimer)
      setError(err.message || "Algo salió mal. Intenta de nuevo.")
      setLoading(false)
      setCurrentStep(0)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface mb-2">
          Generar nuevo mazo
        </h1>
        <p className="text-on-surface-variant">
          Convierte cualquier video de YouTube en tarjetas Anki personalizadas
        </p>
      </div>

      {/* Form card */}
      <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/20 shadow-sm">

        {/* URL Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-on-surface mb-2">
            URL del video de YouTube
          </label>
          <div className="relative">
            <Play className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
            <input
              type="url"
              value={url}
              onChange={e => { setUrl(e.target.value); setError("") }}
              placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 pl-10 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all min-h-[44px]"
              disabled={loading}
            />
          </div>
          {error && (
            <p className="mt-2 text-sm text-error">{error}</p>
          )}
        </div>

        {/* CEFR Level */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-on-surface mb-2">
            Tu nivel de inglés (CEFR)
          </label>
          <div className="relative">
            <select
              value={level}
              onChange={e => setLevel(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 pr-10 text-on-surface appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all min-h-[44px]"
              disabled={loading}
            >
              {CEFR_LEVELS.map(l => (
                <option key={l.value} value={l.value}>
                  {l.label} — {l.desc}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
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
                      ? "border-primary bg-primary-container/30 text-on-primary-container"
                      : "border-outline-variant/50 bg-surface hover:border-primary/50 text-on-surface-variant"
                  } disabled:opacity-50`}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? "text-primary" : ""}`} />
                  <div className="text-center">
                    <span className="block text-sm font-medium">{ctx.label}</span>
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
        {loading && (
          <div className="mb-6 p-4 bg-primary-container/30 rounded-xl border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-sm font-semibold text-on-surface">
                {PROGRESS_STEPS[currentStep - 1]?.label || "Procesando..."}
              </span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-700"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {PROGRESS_STEPS.map(step => (
                <span
                  key={step.id}
                  className={`text-xs transition-colors ${
                    currentStep >= step.id ? "text-primary font-medium" : "text-outline"
                  }`}
                >
                  {step.id === 1 ? "Extrayendo" : step.id === 2 ? "Analizando" : "Generando"}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-base transition-all duration-150 min-h-[48px] ${
            loading
              ? "bg-surface-variant text-on-surface-variant cursor-not-allowed"
              : "bg-gradient-to-r from-primary to-primary-container text-white shadow-lg shadow-primary/30 hover:opacity-90 active:scale-[0.98]"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generando tu mazo...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generar mazo gratis
            </>
          )}
        </button>

        <p className="text-center text-xs text-on-surface-variant mt-4">
          Sin tarjeta de crédito · Sin registro · 1 mazo gratis por día
        </p>
      </div>

      {/* Info cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { number: "2 min", label: "Tiempo promedio" },
          { number: "100%", label: "Audio real del video" },
          { number: "A1–C2", label: "Todos los niveles" },
        ].map(stat => (
          <div key={stat.label} className="bg-surface-container-low rounded-xl p-4 text-center border border-outline-variant/20">
            <div className="text-2xl font-bold text-primary">{stat.number}</div>
            <div className="text-xs text-on-surface-variant mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
