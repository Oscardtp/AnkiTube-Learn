"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, Check, SkipForward } from "lucide-react"
import { api } from "@/lib/api"
import { useNotifications } from "@/context/NotificationContext"

const STEPS = [
  { id: 1, title: "Tu nivel" },
  { id: 2, title: "Tu objetivo" },
  { id: 3, title: "Tiempo diario" },
  { id: 4, title: "Tipo de contenido" },
  { id: 5, title: "Tarjetas por día" },
]

const LEVELS = [
  { value: "A1", label: "A1", desc: "Principiante" },
  { value: "A2", label: "A2", desc: "Elemental" },
  { value: "B1", label: "B1", desc: "Intermedio" },
  { value: "B2", label: "B2", desc: "Intermedio alto" },
  { value: "C1", label: "C1", desc: "Avanzado" },
  { value: "C2", label: "C2", desc: "Dominio nativo" },
]

const GOALS = [
  { value: "work", label: "Trabajo", icon: "💼" },
  { value: "travel", label: "Viajes", icon: "✈️" },
  { value: "exams", label: "Exámenes", icon: "📝" },
  { value: "conversation", label: "Conversaciones", icon: "💬" },
  { value: "series", label: "Series / Películas", icon: "🎬" },
]

const MINUTES = [5, 10, 15, 20, 30]

const CONTENT_TYPES = [
  { value: "general", label: "General", desc: "Vida cotidiana y culture" },
  { value: "bpo", label: "BPO / Call Center", desc: "Atención al cliente" },
  { value: "tech", label: "Tech", desc: "Programación y tecnología" },
  { value: "gaming", label: "Gaming", desc: "Videojuegos y streaming" },
  { value: "travel", label: "Travel", desc: "Turismo y hotelería" },
]

const CARDS_PER_DAY = [5, 10, 15, 20, 30]

export default function WizardPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useNotifications()
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState({
    level: "",
    goal: "",
    daily_minutes: 15,
    content_type: "",
    cards_per_day: 15,
  })
  const [submitting, setSubmitting] = useState(false)

  const canNext = () => {
    switch (step) {
      case 1: return answers.level !== ""
      case 2: return answers.goal !== ""
      case 3: return answers.daily_minutes > 0
      case 4: return answers.content_type !== ""
      case 5: return answers.cards_per_day > 0
      default: return false
    }
  }

  const handleNext = () => {
    if (step < 5 && canNext()) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await api.updateWizard(answers)
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      toast("¡Configuración guardada! Tu experiencia está personalizada.", "success")
      router.push("/dashboard")
    } catch {
      toast("Error al guardar la configuración. Intenta de nuevo.", "error")
      setSubmitting(false)
    }
  }

  const handleSkip = async () => {
    setSubmitting(true)
    try {
      await api.updateWizard({
        level: "B1",
        goal: "conversation",
        daily_minutes: 15,
        content_type: "general",
        cards_per_day: 15,
      })
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      toast("Configuración omitida. Puedes completarla desde tu perfil.", "info")
      router.push("/dashboard")
    } catch {
      toast("Error al guardar. Intenta de nuevo.", "error")
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Progress bar */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-on-surface-variant">
            Paso {step} de {STEPS.length}
          </span>
          <button
            onClick={handleSkip}
            disabled={submitting}
            className="flex items-center gap-1 text-sm text-outline hover:text-on-surface transition-colors"
          >
            <SkipForward className="w-4 h-4" />
            Omitir por ahora
          </button>
        </div>
        <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(step / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-lg animate-fade-up">
          {step === 1 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-on-surface text-center mb-2">
                ¿Cuál es tu nivel de inglés?
              </h2>
              <p className="text-on-surface-variant text-center mb-8">
                Esto nos ayuda a personalizar tus tarjetas
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {LEVELS.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setAnswers({ ...answers, level: l.value })}
                    className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                      answers.level === l.value
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-outline-variant/30 bg-surface-container-lowest hover:border-outline-variant"
                    }`}
                  >
                    {answers.level === l.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="text-2xl font-black text-on-surface block">{l.label}</span>
                    <span className="text-xs text-on-surface-variant">{l.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-on-surface text-center mb-2">
                ¿Cuál es tu objetivo?
              </h2>
              <p className="text-on-surface-variant text-center mb-8">
                ¿Para qué necesitas el inglés?
              </p>
              <div className="grid grid-cols-1 gap-3">
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setAnswers({ ...answers, goal: g.value })}
                    className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      answers.goal === g.value
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-outline-variant/30 bg-surface-container-lowest hover:border-outline-variant"
                    }`}
                  >
                    {answers.goal === g.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="text-2xl">{g.icon}</span>
                    <span className="text-base font-semibold text-on-surface">{g.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-on-surface text-center mb-2">
                ¿Cuánto tiempo puedes dedicar al día?
              </h2>
              <p className="text-on-surface-variant text-center mb-8">
                Sé realista, ¡lo importante es la constancia!
              </p>
              <div className="flex justify-center mb-6">
                <span className="text-6xl font-black text-primary">{answers.daily_minutes}</span>
                <span className="text-lg text-on-surface-variant self-end mb-2 ml-2">min</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={5}
                value={answers.daily_minutes}
                onChange={(e) => setAnswers({ ...answers, daily_minutes: Number(e.target.value) })}
                className="w-full h-2 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between mt-2">
                {MINUTES.map((m) => (
                  <button
                    key={m}
                    onClick={() => setAnswers({ ...answers, daily_minutes: m })}
                    className={`text-xs font-semibold px-2 py-1 rounded-full transition-colors ${
                      answers.daily_minutes === m
                        ? "text-primary bg-primary/10"
                        : "text-outline hover:text-on-surface"
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-on-surface text-center mb-2">
                ¿Qué tipo de contenido prefieres?
              </h2>
              <p className="text-on-surface-variant text-center mb-8">
                Elige el vocabulario que más te sirva
              </p>
              <div className="grid grid-cols-1 gap-3">
                {CONTENT_TYPES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setAnswers({ ...answers, content_type: c.value })}
                    className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                      answers.content_type === c.value
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-outline-variant/30 bg-surface-container-lowest hover:border-outline-variant"
                    }`}
                  >
                    {answers.content_type === c.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="text-base font-semibold text-on-surface block">{c.label}</span>
                    <span className="text-xs text-on-surface-variant">{c.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-on-surface text-center mb-2">
                ¿Cuántas tarjetas quieres por día?
              </h2>
              <p className="text-on-surface-variant text-center mb-8">
                Más tarjetas = más práctica, pero menos repetición
              </p>
              <div className="grid grid-cols-5 gap-3 mb-8">
                {CARDS_PER_DAY.map((n) => (
                  <button
                    key={n}
                    onClick={() => setAnswers({ ...answers, cards_per_day: n })}
                    className={`p-4 rounded-2xl border-2 transition-all text-center ${
                      answers.cards_per_day === n
                        ? "border-primary bg-primary text-white shadow-md"
                        : "border-outline-variant/30 bg-surface-container-lowest text-on-surface hover:border-outline-variant"
                    }`}
                  >
                    <span className="text-2xl font-black block">{n}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-8">
        <div className="w-full max-w-lg mx-auto flex gap-3">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-outline-variant/30 text-on-surface font-semibold hover:bg-surface-container-high transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Atrás
            </button>
          )}
          <button
            onClick={step === 5 ? handleSubmit : handleNext}
            disabled={!canNext() || submitting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-bold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {step === 5 ? (
              submitting ? "Guardando..." : "¡Listo!"
            ) : (
              <>
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
