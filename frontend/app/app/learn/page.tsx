"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  ArrowLeft,
  ArrowRight,
  Volume2,
  RotateCcw,
  Check,
  X,
  Lightbulb,
  ChevronRight,
  Eye,
  EyeOff,
  BookOpen,
  Star,
  Zap,
  Loader2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { usePhrases, useMarkPhraseAsLearned, useUserProgress } from "@/hooks/useCallCenter"
import { mutate } from "swr"

// Static modules for navigation
const LEARNING_MODULES = [
  {
    id: 1,
    title: "Saludos y bienvenida",
    description: "Frases para iniciar una llamada con confianza",
    category: "greetings",
    icon: "wave",
    color: "primary",
  },
  {
    id: 2,
    title: "Empatia y comprension",
    description: "Responde con empatia y profesionalismo",
    category: "empathy",
    icon: "heart",
    color: "secondary",
  },
  {
    id: 3,
    title: "Resolucion de problemas",
    description: "Ayuda a resolver situaciones dificiles",
    category: "problem_solving",
    icon: "check",
    color: "primary",
  },
  {
    id: 4,
    title: "Cierre de llamadas",
    description: "Termina la conversacion de forma positiva",
    category: "closing",
    icon: "check",
    color: "secondary",
  },
]

export default function LearnPage() {
  const [selectedModule, setSelectedModule] = useState<typeof LEARNING_MODULES[0] | null>(null)
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [showTranslation, setShowTranslation] = useState(false)
  const [showTip, setShowTip] = useState(false)
  const [learnedInSession, setLearnedInSession] = useState<string[]>([])

  // Fetch data from backend
  const { data: progressData } = useUserProgress()
  const { data: phrasesData, isLoading: phrasesLoading, error: phrasesError } = usePhrases(
    selectedModule ? { category: selectedModule.category, limit: 20 } : { limit: 20 }
  )
  const { trigger: markAsLearned, isMutating: isMarking } = useMarkPhraseAsLearned()

  const phrases = phrasesData?.phrases || []
  const currentPhrase = phrases[currentPhraseIndex]
  const progress = phrases.length > 0 ? ((currentPhraseIndex + 1) / phrases.length) * 100 : 0

  const handleNext = () => {
    if (currentPhraseIndex < phrases.length - 1) {
      setCurrentPhraseIndex(prev => prev + 1)
      setShowTranslation(false)
      setShowTip(false)
    }
  }

  const handlePrevious = () => {
    if (currentPhraseIndex > 0) {
      setCurrentPhraseIndex(prev => prev - 1)
      setShowTranslation(false)
      setShowTip(false)
    }
  }

  const handleKnown = async () => {
    if (currentPhrase && !learnedInSession.includes(currentPhrase.id)) {
      try {
        await markAsLearned(currentPhrase.id)
        setLearnedInSession(prev => [...prev, currentPhrase.id])
        // Refresh progress data
        mutate("userProgress")
      } catch (error) {
        console.error("Error marking phrase as learned:", error)
      }
    }
    handleNext()
  }

  const handleNotKnown = () => {
    handleNext()
  }

  const playAudio = () => {
    if (currentPhrase && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentPhrase.english)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      speechSynthesis.speak(utterance)
    }
  }

  const resetSession = () => {
    setCurrentPhraseIndex(0)
    setLearnedInSession([])
    setShowTranslation(false)
    setShowTip(false)
  }

  // Module Selection View
  if (selectedModule === null) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-on-surface mb-2">
            Aprende frases esenciales
          </h1>
          <p className="text-on-surface-variant">
            Selecciona un modulo para comenzar tu entrenamiento
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid gap-4">
          {LEARNING_MODULES.map((module, idx) => {
            const skillProgress = progressData?.skills?.[module.category as keyof typeof progressData.skills] || 0
            const estimatedTotal = 12
            const completed = Math.floor(skillProgress / 10)
            
            return (
              <motion.button
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                onClick={() => {
                  setSelectedModule(module)
                  resetSession()
                }}
                className="w-full bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10 hover:shadow-md hover:border-primary/20 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    module.color === "primary" ? "bg-primary/10" : "bg-secondary/10"
                  } group-hover:scale-105 transition-transform`}>
                    <BookOpen className={`w-7 h-7 ${
                      module.color === "primary" ? "text-primary" : "text-secondary"
                    }`} />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-on-surface text-lg group-hover:text-primary transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                      {module.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs text-on-surface-variant">
                        {completed}/{estimatedTotal} frases
                      </span>
                      <div className="flex-1 max-w-32 bg-surface-container rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            module.color === "primary" ? "bg-primary" : "bg-secondary"
                          }`}
                          style={{ width: `${Math.min(skillProgress, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-on-surface-variant">
                        {Math.min(skillProgress, 100)}%
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Quick Start Card */}
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6 border border-primary/10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-on-surface">Practica rapida</h3>
              <p className="text-sm text-on-surface-variant mt-1">
                Repasa frases aleatorias de todas las categorias
              </p>
            </div>
            <button
              onClick={() => setSelectedModule(LEARNING_MODULES[0])}
              className="px-4 py-2 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              Comenzar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (phrasesLoading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-on-surface-variant">Cargando frases...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (phrasesError || phrases.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setSelectedModule(null)}
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Volver a modulos</span>
        </button>
        
        <div className="bg-surface-container-lowest rounded-2xl p-8 text-center">
          <p className="text-on-surface-variant mb-4">
            {phrasesError ? "Error al cargar las frases. Por favor intenta de nuevo." : "No hay frases disponibles en esta categoria."}
          </p>
          <button
            onClick={() => setSelectedModule(null)}
            className="px-4 py-2 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  // Learning Card View
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header with Progress */}
      <div className="mb-6">
        <button
          onClick={() => setSelectedModule(null)}
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Volver a modulos</span>
        </button>

        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-on-surface-variant">
            Frase {currentPhraseIndex + 1} de {phrases.length}
          </span>
          <span className="text-sm font-semibold text-primary">
            {learnedInSession.length} aprendidas
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-surface-container rounded-full h-2">
          <motion.div 
            className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Flashcard */}
      {currentPhrase && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhraseIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-surface-container-lowest rounded-3xl shadow-elevated border border-outline-variant/10 overflow-hidden"
          >
            {/* Category Badge */}
            <div className="px-6 pt-6 flex items-center justify-between">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                currentPhrase.difficulty === "beginner" 
                  ? "bg-secondary/10 text-secondary" 
                  : "bg-primary/10 text-primary"
              }`}>
                {currentPhrase.category}
              </span>
              <button
                onClick={playAudio}
                className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center hover:bg-primary/20 transition-colors group"
              >
                <Volume2 className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Main Content */}
            <div className="p-6 pt-4">
              {/* English Phrase */}
              <div className="mb-4">
                <p className="text-2xl lg:text-3xl font-bold text-on-surface leading-relaxed text-balance">
                  &quot;{currentPhrase.english}&quot;
                </p>
                <p className="text-sm text-on-surface-variant mt-2 font-mono">
                  {currentPhrase.phonetic}
                </p>
              </div>

              {/* Translation Toggle */}
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className="flex items-center gap-2 text-primary font-medium text-sm mb-4 hover:underline"
              >
                {showTranslation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showTranslation ? "Ocultar traduccion" : "Ver traduccion"}
              </button>

              <AnimatePresence>
                {showTranslation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-surface-container rounded-xl p-4 mb-4"
                  >
                    <p className="text-lg text-on-surface">
                      {currentPhrase.spanish}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Context */}
              <div className="bg-surface-container rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-on-surface mb-1">Contexto:</p>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {currentPhrase.context}
                </p>
              </div>

              {/* Example Dialog */}
              <div className="bg-primary/5 rounded-xl p-4 mb-4 border border-primary/10">
                <p className="text-sm font-medium text-primary mb-2">Ejemplo en conversacion:</p>
                <div className="space-y-2">
                  <p className="text-sm text-on-surface-variant">
                    <span className="font-medium">Customer:</span> {currentPhrase.example_dialogue.customer}
                  </p>
                  <p className="text-sm text-primary font-medium">
                    <span>Agent:</span> {currentPhrase.example_dialogue.agent}
                  </p>
                </div>
              </div>

              {/* Tip Toggle */}
              <button
                onClick={() => setShowTip(!showTip)}
                className="flex items-center gap-2 text-secondary font-medium text-sm hover:underline"
              >
                <Lightbulb className="w-4 h-4" />
                {showTip ? "Ocultar tips" : "Ver tips de pronunciacion"}
              </button>

              <AnimatePresence>
                {showTip && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 bg-secondary/10 rounded-xl p-4 border border-secondary/20"
                  >
                    <ul className="text-sm text-on-surface leading-relaxed space-y-2">
                      {currentPhrase.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-secondary">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 space-y-4">
              <p className="text-center text-sm text-on-surface-variant">
                Conocias esta frase?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleNotKnown}
                  disabled={isMarking}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-error/10 text-error rounded-2xl font-semibold hover:bg-error/20 transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                  No la sabia
                </button>
                <button
                  onClick={handleKnown}
                  disabled={isMarking}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-secondary/10 text-secondary rounded-2xl font-semibold hover:bg-secondary/20 transition-colors disabled:opacity-50"
                >
                  {isMarking ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  Ya la sabia
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentPhraseIndex === 0}
          className="flex items-center gap-2 px-4 py-2 text-on-surface-variant hover:text-on-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </button>

        <button
          onClick={resetSession}
          className="flex items-center gap-2 px-4 py-2 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reiniciar
        </button>

        <button
          onClick={handleNext}
          disabled={currentPhraseIndex === phrases.length - 1}
          className="flex items-center gap-2 px-4 py-2 text-primary font-medium hover:underline disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Completion Card */}
      {currentPhraseIndex === phrases.length - 1 && learnedInSession.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-2xl p-6 border border-secondary/20 text-center"
        >
          <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-secondary" />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2">
            Excelente trabajo!
          </h3>
          <p className="text-on-surface-variant mb-4">
            Aprendiste {learnedInSession.length} de {phrases.length} frases en esta sesion
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/app/practice"
              className="px-6 py-3 bg-secondary text-white rounded-xl font-semibold hover:bg-secondary/90 transition-colors"
            >
              Ir a practicar
            </Link>
            <button
              onClick={resetSession}
              className="px-6 py-3 bg-surface-container text-on-surface rounded-xl font-semibold hover:bg-surface-container-high transition-colors"
            >
              Repetir leccion
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
