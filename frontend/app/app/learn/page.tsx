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
  Sparkles,
  BookOpen,
  Star,
  Zap
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Mock learning data - Call center phrases
const LEARNING_MODULES = [
  {
    id: 1,
    title: "Saludos y bienvenida",
    description: "Frases para iniciar una llamada con confianza",
    phrases: 12,
    completed: 10,
    icon: "wave",
    color: "primary",
  },
  {
    id: 2,
    title: "Manejo de quejas",
    description: "Responde con empatia y profesionalismo",
    icon: "shield",
    phrases: 15,
    completed: 7,
    color: "secondary",
  },
  {
    id: 3,
    title: "Cierre de llamadas",
    description: "Termina la conversacion de forma positiva",
    icon: "check",
    phrases: 10,
    completed: 3,
    color: "primary",
  },
]

const PHRASES_DATA = [
  {
    id: 1,
    english: "How may I assist you today?",
    spanish: "Como puedo ayudarte hoy?",
    phonetic: "/haʊ meɪ aɪ əˈsɪst juː təˈdeɪ/",
    context: "Usa esta frase al inicio de cada llamada para mostrar disposicion a ayudar.",
    example: "Customer: Hi, I have a problem with my order.\nYou: How may I assist you today?",
    tip: "Manten un tono amigable y profesional. Sonrie al hablar, se nota en tu voz.",
    category: "Saludo inicial",
    difficulty: "easy",
  },
  {
    id: 2,
    english: "I understand your concern.",
    spanish: "Entiendo tu preocupacion.",
    phonetic: "/aɪ ˌʌndərˈstænd jɔːr kənˈsɜːrn/",
    context: "Muestra empatia cuando el cliente expresa frustración o problemas.",
    example: "Customer: I've been waiting for two weeks!\nYou: I understand your concern. Let me help you right away.",
    tip: "No interrumpas al cliente. Escucha primero, luego valida sus emociones.",
    category: "Empatia",
    difficulty: "easy",
  },
  {
    id: 3,
    english: "Let me look into that for you.",
    spanish: "Dejame revisar eso por ti.",
    phonetic: "/let miː lʊk ˈɪntuː ðæt fɔːr juː/",
    context: "Cuando necesitas investigar o buscar informacion antes de responder.",
    example: "Customer: Why was I charged twice?\nYou: Let me look into that for you. One moment please.",
    tip: "Siempre indica que estas trabajando en su caso, evita silencios prolongados.",
    category: "Investigacion",
    difficulty: "medium",
  },
  {
    id: 4,
    english: "Could you please hold for a moment?",
    spanish: "Podrias esperar un momento por favor?",
    phonetic: "/kʊd juː pliːz hoʊld fɔːr ə ˈmoʊmənt/",
    context: "Pide permiso antes de poner a un cliente en espera.",
    example: "You: Could you please hold for a moment while I check your account?\nCustomer: Sure, no problem.",
    tip: "Nunca pongas en espera sin permiso. Estima cuanto tiempo tomara.",
    category: "Espera",
    difficulty: "easy",
  },
  {
    id: 5,
    english: "I apologize for any inconvenience this may have caused.",
    spanish: "Me disculpo por cualquier inconveniente que esto haya causado.",
    phonetic: "/aɪ əˈpɑːlədʒaɪz fɔːr ˈeni ˌɪnkənˈviːniəns/",
    context: "Usa esta frase cuando hay un error o problema por parte de la empresa.",
    example: "You: I apologize for any inconvenience this may have caused. Let me fix this right away.",
    tip: "Disculparse no significa aceptar culpa, muestra profesionalismo y empatia.",
    category: "Disculpas",
    difficulty: "medium",
  },
]

export default function LearnPage() {
  const [selectedModule, setSelectedModule] = useState<number | null>(null)
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [showTranslation, setShowTranslation] = useState(false)
  const [showTip, setShowTip] = useState(false)
  const [knownPhrases, setKnownPhrases] = useState<number[]>([])
  const [isFlipped, setIsFlipped] = useState(false)

  const currentPhrase = PHRASES_DATA[currentPhraseIndex]
  const progress = ((currentPhraseIndex + 1) / PHRASES_DATA.length) * 100

  const handleNext = () => {
    if (currentPhraseIndex < PHRASES_DATA.length - 1) {
      setCurrentPhraseIndex(prev => prev + 1)
      setShowTranslation(false)
      setShowTip(false)
      setIsFlipped(false)
    }
  }

  const handlePrevious = () => {
    if (currentPhraseIndex > 0) {
      setCurrentPhraseIndex(prev => prev - 1)
      setShowTranslation(false)
      setShowTip(false)
      setIsFlipped(false)
    }
  }

  const handleKnown = () => {
    if (!knownPhrases.includes(currentPhrase.id)) {
      setKnownPhrases(prev => [...prev, currentPhrase.id])
    }
    handleNext()
  }

  const handleNotKnown = () => {
    handleNext()
  }

  const playAudio = () => {
    // Simulates playing audio - in production this would use Web Speech API or audio files
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentPhrase.english)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      speechSynthesis.speak(utterance)
    }
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
          {LEARNING_MODULES.map((module, idx) => (
            <motion.button
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              onClick={() => setSelectedModule(module.id)}
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
                      {module.completed}/{module.phrases} frases
                    </span>
                    <div className="flex-1 max-w-32 bg-surface-container rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          module.color === "primary" ? "bg-primary" : "bg-secondary"
                        }`}
                        style={{ width: `${(module.completed / module.phrases) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-on-surface-variant">
                      {Math.round((module.completed / module.phrases) * 100)}%
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </motion.button>
          ))}
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
                Repasa 5 frases aleatorias en menos de 3 minutos
              </p>
            </div>
            <button
              onClick={() => setSelectedModule(1)}
              className="px-4 py-2 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              Comenzar
            </button>
          </div>
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
            Frase {currentPhraseIndex + 1} de {PHRASES_DATA.length}
          </span>
          <span className="text-sm font-semibold text-primary">
            {knownPhrases.length} aprendidas
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
              currentPhrase.difficulty === "easy" 
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
                {currentPhrase.example.split('\n').map((line, idx) => (
                  <p key={idx} className={`text-sm ${
                    line.startsWith('You:') 
                      ? 'text-primary font-medium' 
                      : 'text-on-surface-variant'
                  }`}>
                    {line}
                  </p>
                ))}
              </div>
            </div>

            {/* Tip Toggle */}
            <button
              onClick={() => setShowTip(!showTip)}
              className="flex items-center gap-2 text-secondary font-medium text-sm hover:underline"
            >
              <Lightbulb className="w-4 h-4" />
              {showTip ? "Ocultar tip" : "Ver tip de pronunciacion"}
            </button>

            <AnimatePresence>
              {showTip && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 bg-secondary/10 rounded-xl p-4 border border-secondary/20"
                >
                  <p className="text-sm text-on-surface leading-relaxed">
                    {currentPhrase.tip}
                  </p>
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
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-error/10 text-error rounded-2xl font-semibold hover:bg-error/20 transition-colors"
              >
                <X className="w-5 h-5" />
                No la sabia
              </button>
              <button
                onClick={handleKnown}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-secondary/10 text-secondary rounded-2xl font-semibold hover:bg-secondary/20 transition-colors"
              >
                <Check className="w-5 h-5" />
                Ya la sabia
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

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
          onClick={() => {
            setCurrentPhraseIndex(0)
            setKnownPhrases([])
          }}
          className="flex items-center gap-2 px-4 py-2 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reiniciar
        </button>

        <button
          onClick={handleNext}
          disabled={currentPhraseIndex === PHRASES_DATA.length - 1}
          className="flex items-center gap-2 px-4 py-2 text-primary font-medium hover:underline disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Completion Card */}
      {currentPhraseIndex === PHRASES_DATA.length - 1 && knownPhrases.length > 0 && (
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
            Aprendiste {knownPhrases.length} de {PHRASES_DATA.length} frases en esta sesion
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/app/practice"
              className="px-6 py-3 bg-secondary text-white rounded-xl font-semibold hover:bg-secondary/90 transition-colors"
            >
              Ir a practicar
            </Link>
            <button
              onClick={() => {
                setCurrentPhraseIndex(0)
                setKnownPhrases([])
              }}
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
