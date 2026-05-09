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
  ArrowRight,
  Check,
  Youtube,
  Brain,
  Download,
  Zap,
  Users,
  Trophy,
  ChevronRight,
  Menu,
  X,
} from "lucide-react"
import { api } from "@/lib/api"

// Data
const CEFR_LEVELS = [
  { value: "A1", label: "A1 — Principiante", desc: "Empezando desde cero, parcero" },
  { value: "A2", label: "A2 — Basico", desc: "Ya le pillas a lo basico" },
  { value: "B1", label: "B1 — Intermedio", desc: "Series con subtitulos, sin lio" },
  { value: "B2", label: "B2 — Intermedio-alto", desc: "Pelis sin subtitulos, que chimba" },
  { value: "C1", label: "C1 — Avanzado", desc: "Le metes al ingles profesional" },
  { value: "C2", label: "C2 — Maestria", desc: "Casi que nativo, crack" },
]

const CONTEXTS = [
  { value: "general", label: "General", icon: GraduationCap, desc: "De todito un poquito" },
  { value: "work", label: "Trabajo", icon: Briefcase, desc: "Pa&apos; las reuniones y correos" },
  { value: "travel", label: "Viajes", icon: Plane, desc: "Pa&apos; cuando te vayas de paseo" },
  { value: "gaming", label: "Gaming", icon: Gamepad2, desc: "Pa&apos; jugar con los parceros" },
]

const STEPS = [
  { 
    icon: Youtube, 
    title: "Pega el link", 
    desc: "Cualquier video de YouTube que te guste. Tutoriales, podcasts, vlogs... lo que sea.",
    color: "bg-red-500/10 text-red-600"
  },
  { 
    icon: Brain, 
    title: "La IA hace la magia", 
    desc: "Extraemos frases reales con pronunciacion y te las explicamos como un parcero.",
    color: "bg-primary/10 text-primary"
  },
  { 
    icon: Download, 
    title: "Descarga y estudia", 
    desc: "Importa a Anki en un clic y empieza a memorizar de verdad. Asi de facil.",
    color: "bg-secondary/10 text-secondary"
  },
]

const STATS = [
  { value: "2,847", label: "Mazos creados", icon: Trophy },
  { value: "50K+", label: "Tarjetas generadas", icon: Zap },
  { value: "1,200+", label: "Parceros activos", icon: Users },
]

const TESTIMONIALS = [
  {
    quote: "Por fin algo que sirve pa&apos; el call center. En dos semanas ya le pillo mas a los gringos.",
    author: "Juan David",
    role: "Agente de soporte",
    location: "Medellin",
    avatar: "JD"
  },
  {
    quote: "Anki me daba pereza armarlo. Esto me ahorra un monton de tiempo y las tarjetas quedan bien chimba.",
    author: "Elena Vargas",
    role: "Estudiante de medicina",
    location: "Bogota",
    avatar: "EV"
  },
  {
    quote: "Lo uso con videos de gaming y ahora entiendo todo lo que dicen en Twitch. Que gonorrea de bueno.",
    author: "Santiago Mejia",
    role: "Streamer",
    location: "Cali",
    avatar: "SM"
  },
]

const FAQS = [
  {
    question: "¿Necesito tener Anki instalado?",
    answer: "Si parce, Anki es donde estudias las tarjetas. Pero tranqui, es gratis y te lo instalas en 2 minutos. Nosotros generamos los archivos .apkg que importas directo ahi.",
  },
  {
    question: "¿Funciona con cualquier video?",
    answer: "Casi todos. Solo necesitamos que el video tenga subtitulos en ingles (los automaticos sirven). Si no tiene, no hay forma de sacar las frases.",
  },
  {
    question: "¿El audio es real o de robot?",
    answer: "Real, parcero. Recortamos el audio original del video para que escuches la voz del creador tal cual. Nada de voces raras de IA.",
  },
  {
    question: "¿Puedo cancelar cuando quiera?",
    answer: "Claro que si. Sin contratos raros ni letras pequenas. Cancelas cuando te de la gana desde tu perfil.",
  },
]

// Navbar Component
function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-outline/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-lg text-foreground">AnkiTube</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Como funciona
            </Link>
            <Link href="#testimonios" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Testimonios
            </Link>
            <Link href="#preguntas" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Preguntas
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link 
              href="/login" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
            >
              Iniciar sesion
            </Link>
            <Link 
              href="/register" 
              className="text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition-colors"
            >
              Empezar gratis
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-outline/10">
            <div className="flex flex-col gap-4">
              <Link href="#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Como funciona
              </Link>
              <Link href="#testimonios" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Testimonios
              </Link>
              <Link href="#preguntas" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Preguntas
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-outline/10">
                <Link href="/login" className="text-sm font-medium text-center py-2 text-muted-foreground">
                  Iniciar sesion
                </Link>
                <Link href="/register" className="text-sm font-semibold text-center bg-primary text-primary-foreground py-2 rounded-full">
                  Empezar gratis
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

// FAQ Item Component
function FAQItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-outline/10">
      <button 
        onClick={onClick}
        className="w-full py-5 flex items-center justify-between text-left"
      >
        <span className="font-semibold text-foreground pr-4">{question}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-5 pr-8">
          <p className="text-muted-foreground leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [level, setLevel] = useState("B1")
  const [context, setContext] = useState("general")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const isValidUrl = url.includes("youtube.com/watch") || url.includes("youtu.be/")

  async function handleGenerate() {
    if (!url.trim()) {
      setError("Ey parcero, pega el link del video primero")
      return
    }
    if (!isValidUrl) {
      setError("Hmm, eso no parece ser un link de YouTube. Revisa que este bien escrito")
      return
    }

    setError("")
    setLoading(true)

    try {
      const data = await api.generateDeck({
        youtube_url: url,
        level: level as "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
        context,
      })

      router.push(`/preview/${data.deck_id}`)
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || "Algo fallo, parcero. Intentalo de nuevo.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Nuevo: Ahora con audio del video original</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 text-balance">
            Aprende ingles con los videos que{" "}
            <span className="text-primary">ya te gustan</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
            Convierte cualquier video de YouTube en tarjetas Anki personalizadas. 
            Pega el link, nosotros hacemos el resto. Asi de simple, parcero.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="#generador"
              className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-base hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
            >
              <Sparkles className="w-5 h-5" />
              Crear mi primer mazo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#como-funciona"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground px-6 py-4 font-medium transition-colors"
            >
              Ver como funciona
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Trust Badge */}
          <p className="text-sm text-muted-foreground">
            Sin tarjeta de credito • Sin registro • 1 mazo gratis al dia
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 border-y border-outline/10 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon className="w-5 h-5 text-primary hidden sm:block" />
                  <span className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Generator Section */}
      <section id="generador" className="py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Empieza ahora mismo
            </h2>
            <p className="text-muted-foreground">
              Pega el link del video y deja que la magia suceda
            </p>
          </div>

          {/* Generator Card */}
          <div className="bg-card border border-outline/10 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/5">
            {/* URL Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Link del video de YouTube
              </label>
              <div className="relative">
                <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    setError("")
                  }}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full bg-background border border-outline/20 rounded-xl px-4 py-3.5 pl-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  disabled={loading}
                />
              </div>
              {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
            </div>

            {/* Level Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Tu nivel de ingles
              </label>
              <div className="relative">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-background border border-outline/20 rounded-xl px-4 py-3.5 pr-10 text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  disabled={loading}
                >
                  {CEFR_LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label} — {l.desc}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ¿No sabes tu nivel? Elige <span className="font-medium text-foreground">B1</span> si entiendes series con subtitulos
              </p>
            </div>

            {/* Context Selector */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground mb-3">
                ¿Pa&apos; que lo necesitas?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CONTEXTS.map((ctx) => {
                  const Icon = ctx.icon
                  const isSelected = context === ctx.value
                  return (
                    <button
                      key={ctx.value}
                      onClick={() => setContext(ctx.value)}
                      disabled={loading}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-outline/10 bg-background hover:border-primary/30 text-muted-foreground hover:text-foreground"
                      } disabled:opacity-50`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{ctx.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <span className="text-sm font-medium text-foreground">
                    Creando tu mazo... Dame unos segunditos
                  </span>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 ${
                loading
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
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

            <p className="text-center text-xs text-muted-foreground mt-4">
              Sin registro • Descarga directa • Listo pa&apos; Anki
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-20 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Asi de facil funciona
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Tres pasos y ya estas aprendiendo ingles con tus videos favoritos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, idx) => (
              <div key={idx} className="relative">
                {/* Connector Line */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-outline/20" />
                )}
                
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-5`}>
                    <step.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonios" className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Mira lo que dicen los parceros
            </h2>
            <p className="text-muted-foreground">
              Gente real que ya esta aprendiendo con AnkiTube
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, idx) => (
              <div 
                key={idx} 
                className="bg-card border border-outline/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                
                {/* Quote */}
                <p className="text-foreground mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role} • {testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="preguntas" className="py-20 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Preguntas frecuentes
            </h2>
            <p className="text-muted-foreground">
              Todo lo que necesitas saber antes de empezar
            </p>
          </div>

          <div className="bg-card border border-outline/10 rounded-2xl p-6 sm:p-8">
            {FAQS.map((faq, idx) => (
              <FAQItem
                key={idx}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFaq === idx}
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            ¿Listo pa&apos; aprender de verdad?
          </h2>
          <p className="text-muted-foreground mb-8">
            Deja de perder el tiempo con apps genericas. Aprende con el contenido que ya te gusta.
          </p>
          <Link
            href="#generador"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-base hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
          >
            <Sparkles className="w-5 h-5" />
            Crear mi primer mazo gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-outline/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-bold text-foreground">AnkiTube Learn</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Hecho con amor desde Colombia
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
