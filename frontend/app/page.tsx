"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Play,
  Sparkles,
  ChevronDown,
  Loader2,
  Briefcase,
  Plane,
  Gamepad2,
  GraduationCap,
  Star,
  History,
  Timer,
  XCircle,
  Link as LinkIcon,
  Brain,
  Download,
  CheckCircle2,
  Volume2,
} from "lucide-react"
import MinimalNavbar from "@/components/MinimalNavbar"
import { api } from "@/lib/api"

// Data
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

const PROBLEMS = [
  { icon: History, text: "Ves horas de YouTube en inglés pero al día siguiente no recuerdas nada." },
  { icon: Timer, text: "Crear mazos en Anki a mano toma 2-3 horas por video." },
  { icon: XCircle, text: "Duolingo, Babbel, apps genéricas. Ninguna usa el contenido que tú ya consumes." },
]

const STEPS = [
  { icon: LinkIcon, title: "1. Pega el enlace", desc: "Cualquier video de YouTube que te guste. Sin límites." },
  { icon: Brain, title: "2. La IA analiza", desc: "Extraemos frases reales, pronunciación y contexto cultural." },
  { icon: Download, title: "3. Descarga y estudia", desc: "Importa a Anki en un clic y empieza a memorizar de verdad." },
]

const FEATURES = [
  "Jerga y expresiones locales de Colombia.",
  "Explicaciones sencillas, como te las diría un parcero.",
]

const PLANS = [
  {
    name: "Explorador",
    price: "$0",
    period: "/ siempre",
    features: ["1 mazo/día", "IA Estándar", "Exportación Anki"],
    cta: "Elegir Gratis",
    popular: false,
    dark: false,
  },
  {
    name: "Fluente",
    price: "$15.000",
    period: "/ mes",
    features: ["Mazos ilimitados", "IA Contextual Pro", "Audio HD natural", "Sin anuncios"],
    cta: "¡Me vuelvo fluente!",
    popular: true,
    dark: true,
  },
  {
    name: "Nativo",
    price: "$120.000",
    period: "/ año",
    features: ["Todo en Fluente", "Soporte vía WhatsApp", "Comunidad privada", "Acceso anticipado beta"],
    cta: "Plan Pro",
    popular: false,
    dark: true,
    pro: true,
  },
]

const FAQS = [
  {
    question: "¿Necesito tener Anki instalado?",
    answer: "¡Sí! Generamos los archivos `.apkg` que puedes importar directamente en Anki (PC, Mac, iOS o Android). Si no lo tienes, te enseñamos a instalarlo en 2 minutos.",
  },
  {
    question: "¿Funciona con cualquier video?",
    answer: "Casi todos. Solo necesitamos que el video tenga subtítulos en inglés (ya sean automáticos o subidos por el creador).",
  },
  {
    question: "¿El audio es real o generado por IA?",
    answer: "Recortamos el audio original del video para que escuches la voz real del creador, pero también puedes elegir voces de IA premium para mayor claridad.",
  },
  {
    question: "¿Puedo cancelar cuando quiera?",
    answer: "Claro que sí, parcero. No tenemos contratos de permanencia. Cancelas en un clic desde tu perfil.",
  },
]

export default function LandingPage() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [level, setLevel] = useState("B1")
  const [context, setContext] = useState("general")
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState("")
  const [openFaq, setOpenFaq] = useState<number | null>(0)

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
    } catch (err: any) {
      clearInterval(stepTimer)
      setError(err.message || "Algo salió mal. Intenta de nuevo.")
      setLoading(false)
      setCurrentStep(0)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <MinimalNavbar />
      {/* Hero Section */}
      <section id="hero" className="pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Content */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-on-surface mb-6 leading-tight">
              Llevas años viendo YouTube en inglés.
              <br />
              <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
                Ya es hora de que te quede algo.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-8">
              Convierte cualquier video de YouTube en tu clase de inglés personalizada.
              Pegas la URL. La IA genera las tarjetas. Tú estudias. Gratis para empezar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="#generador"
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-container text-white px-8 py-4 rounded-full font-bold text-base hover:opacity-90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Generar mi primer mazo
              </Link>
            </div>
            <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mt-4">
              Sin tarjeta. Sin registro. Solo pega el enlace.
            </p>
          </div>

          {/* Demo Placeholder */}
          <div className="relative group max-w-4xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-surface-container-lowest rounded-2xl aspect-video shadow-2xl overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-primary/90 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer transform hover:scale-110 transition-transform"
                >
                  <Play className="w-8 h-8 ml-1" fill="currentColor" />
                </div>
                <span className="mt-4 font-bold text-on-surface bg-white/90 px-4 py-2 rounded-full shadow-sm">
                  Ver cómo funciona en 30s
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-surface-container-low py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center items-center gap-6 md:gap-12">
          <div className="flex items-center gap-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4" fill="currentColor" />
              ))}
            </div>
            <span className="text-sm font-medium text-on-surface-variant italic">
              "Por fin algo que funciona para el call center — Juan D., Medellín"
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm font-medium text-on-surface-variant italic">
              "Anki era un lío, ahora es automático — Elena V., Bogotá"
            </span>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section id="problema" className="section-padding">
        <div className="container-limit">
          <h2 className="text-3xl font-extrabold text-on-surface mb-12 text-center">
            ¿Te suena esto?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROBLEMS.map((problem, idx) => (
              <div
                key={idx}
                className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border-l-[4px] border-error card-hover"
              >
                <problem.icon className="w-8 h-8 text-error mb-4" />
                <p className="text-lg text-on-surface font-medium leading-relaxed">{problem.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Generator Section - Hero Feature */}
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

          {/* Generator Form Card */}
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
              {loading && (
                <div className="mb-6 p-5 bg-primary-container/20 rounded-xl border border-primary/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <span className="text-sm font-semibold text-on-surface">
                      {PROGRESS_STEPS[currentStep - 1]?.label || "Procesando..."}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-primary to-primary-container h-2.5 rounded-full transition-all duration-700"
                      style={{ width: `${(currentStep / 3) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-3">
                    {PROGRESS_STEPS.map((step) => (
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
                className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full font-bold text-base transition-all duration-200 ${
                  loading
                    ? "bg-surface-variant text-on-surface-variant cursor-not-allowed"
                    : "bg-gradient-to-r from-primary to-primary-container text-white shadow-lg shadow-primary/30 hover:opacity-90 hover:shadow-xl active:scale-[0.98]"
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

      {/* How It Works */}
      <section className="section-padding">
        <div className="container-limit">
          <h2 className="text-3xl font-extrabold text-on-surface mb-16 text-center">Así funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {STEPS.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg ${
                    idx === 2 ? "bg-secondary text-white shadow-secondary/30" : "bg-primary text-white shadow-primary/30"
                  }`}
                >
                  <step.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-on-surface">{step.title}</h3>
                <p className="text-on-surface-variant">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiator - Colombian Context */}
      <section id="features" className="section-padding overflow-hidden">
        <div className="container-limit">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-6 leading-tight">
                No es traducción.
                <br />
                <span className="text-secondary">Es contexto colombiano.</span>
              </h2>
              <p className="text-lg text-on-surface-variant mb-8">
                Nuestra IA no traduce como un robot. Entiende cómo hablamos nosotros para que cuando
                escuches una expresión, sepas exactamente qué significa en tu mundo.
              </p>
              <div className="space-y-4">
                {FEATURES.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
                    <p className="text-on-surface">{feature}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Card Example */}
            <div className="flex-1 w-full max-w-md">
              <div className="bg-surface-container-lowest rounded-3xl p-1 shadow-2xl relative">
                <div className="absolute -top-4 -right-4 bg-secondary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg z-10 rotate-6"
                >
                  ¡Correcto! +10xp
                </div>
                <div className="p-8">
                  <div className="mb-8">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-4">
                      Front (Inglés)
                    </span>
                    <div className="flex justify-between items-center">
                      <h4 className="text-2xl font-bold text-primary">"I've been meaning to tell you"</h4>
                      <button className="w-10 h-10 bg-primary-container/30 rounded-full flex items-center justify-center text-primary hover:bg-primary-container/50 transition-colors"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-outline-variant/30">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-4">
                      Back (Contexto Colombiano)
                    </span>
                    <p className="text-lg text-on-surface font-medium italic mb-2">
                      Lo que significa: Te lo quería decir hace rato.
                    </p>
                    <p className="text-lg text-secondary font-bold">
                      En Colombia dirías: "Te tenía que contar algo".
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section-padding bg-surface-container-low">
        <div className="container-limit">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-6 tracking-tight">
              Planes simples. Resultados reales.
            </h2>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
              Empieza gratis. Crece cuando quieras.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
            {/* Explorador - Left */}
            <div className="bg-surface-container-lowest rounded-3xl p-8 flex flex-col transition-all hover:shadow-2xl hover:shadow-on-surface/5 relative overflow-hidden group" style={{ boxShadow: '0 8px 24px rgba(25, 28, 30, 0.06)' }}>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-on-surface mb-2">Explorador</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-on-surface">$0</span>
                  <span className="text-on-surface-variant text-sm">/ siempre</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-start gap-3 text-on-surface-variant">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">1 mazo/día</span>
                </li>
                <li className="flex items-start gap-3 text-on-surface-variant">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">IA Estándar</span>
                </li>
                <li className="flex items-start gap-3 text-on-surface-variant">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Exportación Anki</span>
                </li>
              </ul>
              <button className="w-full py-4 rounded-full font-bold text-sm bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors">
                Elegir Gratis
              </button>
            </div>

            {/* Fluente - Center (Featured) */}
            <div className="bg-surface-container-lowest rounded-3xl p-8 flex flex-col relative overflow-hidden md:-translate-y-4" style={{ boxShadow: '0 8px 24px rgba(25, 28, 30, 0.06)', backdropFilter: 'blur(12px)', background: 'rgba(255, 255, 255, 0.9)' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary-container text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg z-10">
                Más popular
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-on-surface mb-2">Fluente</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-primary">$15.000</span>
                  <span className="text-on-surface-variant text-sm">/ mes</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-start gap-3 text-on-surface-variant">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-on-surface">Mazos ilimitados</span>
                </li>
                <li className="flex items-start gap-3 text-on-surface-variant">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">IA Contextual Pro</span>
                </li>
                <li className="flex items-start gap-3 text-on-surface-variant">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Audio HD natural</span>
                </li>
                <li className="flex items-start gap-3 text-on-surface-variant">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Sin anuncios</span>
                </li>
              </ul>
              <button className="w-full py-4 rounded-full font-bold text-sm bg-gradient-to-r from-primary to-primary-container text-white hover:opacity-90 transition-all">
                ¡Me vuelvo fluente!
              </button>
            </div>

            {/* Nativo - Right */}
            <div className="bg-surface-container-lowest rounded-3xl p-8 flex flex-col transition-all hover:shadow-2xl hover:shadow-on-surface/5" style={{ boxShadow: '0 8px 24px rgba(25, 28, 30, 0.06)' }}>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-on-surface mb-2">Nativo</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-on-surface">$120.000</span>
                  <span className="text-on-surface-variant text-sm">/ año</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-start gap-3 text-on-surface-variant">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-on-surface">Todo en Fluente</span>
                </li>
                <li className="flex items-start gap-3 text-on-surface-variant">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Soporte vía WhatsApp</span>
                </li>
                <li className="flex items-start gap-3 text-on-surface-variant">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Comunidad privada</span>
                </li>
                <li className="flex items-start gap-3 text-on-surface-variant">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Acceso anticipado beta</span>
                </li>
              </ul>
              <button className="w-full py-4 rounded-full font-bold text-sm bg-gradient-to-r from-primary to-primary-container text-white hover:opacity-90 transition-all">
                Plan Pro
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-on-surface-variant mt-8">
            Sin contratos. Cancelas cuando quieras.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section-padding bg-surface-container-low">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-on-surface mb-12 text-center">Preguntas Frecuentes</h2>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex justify-between items-center w-full p-6 text-left hover:bg-surface-container-high/50 transition-colors"
                >
                  <span className="text-lg font-bold text-on-surface pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-6 h-6 text-on-surface-variant flex-shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === idx ? "max-h-48" : "max-h-0"
                  }`}
                >
                  <div className="px-6 pb-6 text-on-surface-variant leading-relaxed">{faq.answer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-6">
            ¿Listo para empezar a aprender de verdad?
          </h2>
          <p className="text-lg text-on-surface-variant mb-8 max-w-xl mx-auto">
            Únete a miles de colombianos que están mejorando su inglés con el contenido que ya aman.
          </p>
          <Link
            href="#generador"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-container text-white px-10 py-4 rounded-full font-bold text-lg hover:opacity-90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all"
          >
            <Sparkles className="w-5 h-5" />
            Generar mi primer mazo
          </Link>
        </div>
      </section>
    </div>
  )
}
