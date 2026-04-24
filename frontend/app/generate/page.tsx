"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Play,
  Sparkles,
  Loader2,
  ChevronDown,
  Briefcase,
  Plane,
  Gamepad2,
  GraduationCap,
  Lock,
  Check,
} from "lucide-react"
import MinimalNavbar from "@/components/MinimalNavbar"
import { api } from "@/lib/api"

const CEFR_LEVELS = [
  { value: "A1", label: "A1 — Principiante", desc: "Saludos, números, colores" },
  { value: "A2", label: "A2 — Básico", desc: "Situaciones simples del día a día" },
  { value: "B1", label: "B1 — Intermedio", desc: "Entiendo series con subtítulos" },
  { value: "B2", label: "B2 — Intermedio-alto", desc: "Películas sin subtítulos" },
  { value: "C1", label: "C1 — Avanzado", desc: "Uso flexible y profesional" },
  { value: "C2", label: "C2 — Maestría", desc: "Dominio casi nativo" },
]

const contexts = [
  { value: "general", label: "General", icon: GraduationCap, desc: "Mezcla equilibrada de todo", locked: false },
  { value: "work", label: "Trabajo", icon: Briefcase, desc: "Llamadas, emails, reuniones", locked: true },
  { value: "travel", label: "Viajes", icon: Plane, desc: "Aeropuertos, hoteles, restaurantes", locked: true },
  { value: "gaming", label: "Gaming", icon: Gamepad2, desc: "Vocabulario de videojuegos", locked: true },
]

const progressSteps = [
  { id: 1, label: "Extrayendo" },
  { id: 2, label: "Analizando" },
  { id: 3, label: "Generando" },
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

  const getVideoId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? match[1] : null
  }

  const videoId = getVideoId(url)

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

    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= 3) {
          clearInterval(stepTimer)
          return prev
        }
        return prev + 1
      })
    }, 1800)

    try {
      const data = await api.generateDeck({
        youtube_url: url,
        level: level as "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
        context,
      })

      clearInterval(stepTimer)
      router.push(`/preview/${data.deck_id}`)
    } catch (err: unknown) {
      clearInterval(stepTimer)
      const errorMessage = err instanceof Error ? err.message : "Algo salió mal. Intenta de nuevo."
      setError(errorMessage)
      setLoading(false)
      setCurrentStep(0)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <MinimalNavbar />

      {/* Hero Section */}
      <section className="pt-16 pb-8 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface mb-4 leading-tight">
            Empieza ahora.{" "}
            <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
              Sin complicaciones.
            </span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-xl mx-auto mb-4">
            Pega la URL de cualquier video de YouTube y genera tu mazo Anki en segundos.
          </p>
          <a
            href="#formulario"
            className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors duration-300"
          >
            Empieza ahora →
          </a>
        </div>
      </section>

      {/* Form Section */}
      <section id="formulario" className="pb-16 px-6 md:px-12">
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
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              {/* URL Preview - Real-time detection */}
              {isValidUrl && videoId && (
                <div className="mt-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 flex items-center gap-3">
                  <div className="w-16 h-12 rounded-lg bg-primary-container/20 flex-shrink-0 overflow-hidden">
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-on-surface truncate">
                      Video de YouTube
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      YouTube · Video detectado
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                </div>
              )}

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
                  title="Selecciona tu nivel de inglés CEFR"
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
                {contexts.map((ctx) => {
                  const Icon = ctx.icon
                  const isSelected = context === ctx.value
                  return (
                    <button
                      key={ctx.value}
                      onClick={() => {
                        if (!ctx.locked) setContext(ctx.value)
                      }}
                      disabled={loading}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                        ctx.locked
                          ? "border-outline-variant/30 bg-surface-container-low opacity-70 cursor-not-allowed"
                          : isSelected
                          ? "border-primary bg-primary-container/20 text-on-primary-container"
                          : "border-outline-variant/50 bg-surface hover:border-primary/50 text-on-surface-variant"
                      } disabled:opacity-50`}
                    >
                      {ctx.locked && (
                        <div className="absolute top-2 right-2">
                          <Lock className="w-3.5 h-3.5 text-outline" />
                        </div>
                      )}
                      <Icon className={`w-6 h-6 ${isSelected ? "text-primary" : ctx.locked ? "text-outline" : ""}`} />
                      <div className="text-center">
                        <span className={`block text-sm font-medium ${isSelected ? "text-primary" : ctx.locked ? "text-outline" : "text-on-surface"}`}>
                          {ctx.label}
                        </span>
                        <span className={`text-xs ${isSelected ? "text-on-surface-variant" : "text-outline"}`}>
                          {ctx.desc}
                        </span>
                      </div>
                      {ctx.locked && (
                        <span className="text-[10px] font-semibold text-outline bg-surface-container-low px-2 py-0.5 rounded-full border border-outline-variant/20">
                          Fluente
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-on-surface-variant mt-2">
                Los contextos Fluente generan frases más específicas para ese mundo.
              </p>
            </div>

            {/* Progress Steps */}
            {loading && (
              <div className="mb-6 p-5 bg-primary-container/10 rounded-xl border border-primary/10">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <span className="text-sm font-semibold text-on-surface">
                    {currentStep > 0 && currentStep <= 3
                      ? progressSteps[currentStep - 1]?.label
                      : "Procesando..."}
                  </span>
                </div>

                {/* Progress dots */}
                <div className="flex items-center gap-2">
                  {progressSteps.map((step) => (
                    <div key={step.id} className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          currentStep > step.id
                            ? "bg-[#B5D4F4]" // visto
                            : currentStep === step.id
                            ? "bg-[#1A56DB] scale-125" // actual
                            : "bg-outline-variant/40" // no visto
                        }`}
                      />
                      {step.id < 3 && (
                        <div
                          className={`w-8 h-0.5 rounded-full transition-all duration-300 ${
                            currentStep > step.id ? "bg-[#B5D4F4]" : "bg-outline-variant/20"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-surface-container rounded-full h-2 mt-4">
                  <div
                    className="bg-gradient-to-r from-primary to-primary-container h-2 rounded-full transition-all duration-700"
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleGenerate}
              disabled={loading || !isValidUrl}
              className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full font-bold text-base transition-all duration-200 ${
                loading
                  ? "bg-surface-variant text-on-surface-variant cursor-not-allowed"
                  : isValidUrl
                  ? "bg-gradient-to-r from-primary to-primary-container text-white shadow-lg shadow-primary/30 hover:opacity-90 hover:shadow-xl active:scale-[0.98]"
                  : "bg-surface-container-low text-outline cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generando tu mazo...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generar mazo gratis
                </>
              )}
            </button>

            <p className="text-center text-xs text-on-surface-variant mt-4">
              Sin tarjeta de crédito · Sin registro · 1 mazo gratis por día
            </p>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
      </section>
    </div>
  )
}
