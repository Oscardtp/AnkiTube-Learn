"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { 
  ArrowLeft,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Send,
  User,
  Headphones,
  Sparkles,
  Target
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Practice modes
const PRACTICE_MODES = [
  {
    id: "simulation",
    title: "Simulacion de llamada",
    description: "Practica una conversacion real con un cliente virtual",
    duration: "5-10 min",
    difficulty: "Intermedio",
    icon: Phone,
    color: "primary",
  },
  {
    id: "listening",
    title: "Escucha activa",
    description: "Escucha frases y selecciona la respuesta correcta",
    duration: "3-5 min",
    difficulty: "Basico",
    icon: Headphones,
    color: "secondary",
  },
  {
    id: "typing",
    title: "Respuesta rapida",
    description: "Escribe la respuesta correcta en ingles",
    duration: "5 min",
    difficulty: "Avanzado",
    icon: MessageSquare,
    color: "primary",
  },
]

// Simulation scenarios
const SIMULATION_SCENARIOS = [
  {
    id: 1,
    title: "Cliente con problema de facturacion",
    customerName: "Sarah Mitchell",
    difficulty: "medium",
    steps: [
      {
        customer: "Hi, I just received my bill and I think there's an error. I was charged $50 more than usual.",
        expectedResponses: [
          "I understand your concern. Let me look into that for you.",
          "I apologize for any confusion. Can you tell me your account number?",
          "Thank you for calling. I'll be happy to review your charges."
        ],
        correctIndex: 0,
        feedback: {
          correct: "Perfecto! Mostraste empatia y te ofreciste a ayudar.",
          incorrect: "Intenta mostrar empatia primero antes de pedir informacion."
        }
      },
      {
        customer: "My account number is 45892. I've been a customer for 5 years and this has never happened before.",
        expectedResponses: [
          "I see your account. You're right, there's an additional charge for premium support.",
          "Thank you for being a loyal customer. Let me check what happened with your account.",
          "You should have read the terms and conditions more carefully."
        ],
        correctIndex: 1,
        feedback: {
          correct: "Excelente! Reconociste su lealtad como cliente.",
          incorrect: "Recuerda valorar a los clientes de largo plazo."
        }
      },
      {
        customer: "Can you please remove this charge? I never signed up for premium support.",
        expectedResponses: [
          "I'll process a refund for you right away. Is there anything else I can help you with?",
          "Unfortunately, we can't do refunds. It's company policy.",
          "Let me transfer you to another department."
        ],
        correctIndex: 0,
        feedback: {
          correct: "Muy bien! Resolviste el problema y preguntaste si necesita mas ayuda.",
          incorrect: "Siempre busca resolver el problema del cliente cuando sea posible."
        }
      }
    ]
  }
]

// Listening exercises
const LISTENING_EXERCISES = [
  {
    id: 1,
    audio: "How may I assist you today?",
    options: [
      "Como puedo ayudarte hoy?",
      "Que hora es?",
      "Donde esta el baño?",
      "Cuanto cuesta?"
    ],
    correctIndex: 0
  },
  {
    id: 2,
    audio: "I apologize for the inconvenience.",
    options: [
      "Me alegra conocerte.",
      "Disculpa por la inconveniencia.",
      "Feliz cumpleaños.",
      "Gracias por llamar."
    ],
    correctIndex: 1
  },
  {
    id: 3,
    audio: "Let me transfer you to the right department.",
    options: [
      "La llamada se corto.",
      "Dejame transferirte al departamento correcto.",
      "No tenemos ese producto.",
      "Puedes llamar mañana."
    ],
    correctIndex: 1
  }
]

// Typing exercises
const TYPING_EXERCISES = [
  {
    id: 1,
    prompt: "El cliente pregunta como puede ayudarte. Responde en ingles:",
    expectedAnswer: "How may I assist you today?",
    hints: ["How", "assist", "today"]
  },
  {
    id: 2,
    prompt: "Necesitas poner al cliente en espera. Pidele permiso en ingles:",
    expectedAnswer: "Could you please hold for a moment?",
    hints: ["Could", "please", "hold"]
  },
  {
    id: 3,
    prompt: "Despidete del cliente deseandole un buen dia:",
    expectedAnswer: "Have a great day! Thank you for calling.",
    hints: ["Have", "great", "Thank"]
  }
]

export default function PracticePage() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [score, setScore] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [typedAnswer, setTypedAnswer] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [sessionComplete, setSessionComplete] = useState(false)

  // Reset state when changing modes
  const resetSession = () => {
    setCurrentStep(0)
    setScore(0)
    setShowFeedback(false)
    setIsCorrect(false)
    setSelectedAnswer(null)
    setTypedAnswer("")
    setSessionComplete(false)
  }

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsPlaying(true)
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.85
      utterance.onend = () => setIsPlaying(false)
      speechSynthesis.speak(utterance)
    }
  }

  const handleSimulationAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    const scenario = SIMULATION_SCENARIOS[0]
    const step = scenario.steps[currentStep]
    const correct = answerIndex === step.correctIndex

    setIsCorrect(correct)
    setShowFeedback(true)

    if (correct) {
      setScore(prev => prev + 10)
    }

    setTimeout(() => {
      setShowFeedback(false)
      setSelectedAnswer(null)
      if (currentStep < scenario.steps.length - 1) {
        setCurrentStep(prev => prev + 1)
      } else {
        setSessionComplete(true)
      }
    }, 2500)
  }

  const handleListeningAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    const exercise = LISTENING_EXERCISES[currentStep]
    const correct = answerIndex === exercise.correctIndex

    setIsCorrect(correct)
    setShowFeedback(true)

    if (correct) {
      setScore(prev => prev + 10)
    }

    setTimeout(() => {
      setShowFeedback(false)
      setSelectedAnswer(null)
      if (currentStep < LISTENING_EXERCISES.length - 1) {
        setCurrentStep(prev => prev + 1)
      } else {
        setSessionComplete(true)
      }
    }, 2000)
  }

  const handleTypingSubmit = () => {
    const exercise = TYPING_EXERCISES[currentStep]
    // Simple comparison - in production, use fuzzy matching
    const correct = typedAnswer.toLowerCase().trim() === exercise.expectedAnswer.toLowerCase().trim()

    setIsCorrect(correct)
    setShowFeedback(true)

    if (correct) {
      setScore(prev => prev + 15)
    }

    setTimeout(() => {
      setShowFeedback(false)
      setTypedAnswer("")
      if (currentStep < TYPING_EXERCISES.length - 1) {
        setCurrentStep(prev => prev + 1)
      } else {
        setSessionComplete(true)
      }
    }, 2500)
  }

  // Mode Selection View
  if (selectedMode === null) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-on-surface mb-2">
            Practica tu ingles
          </h1>
          <p className="text-on-surface-variant">
            Elige un modo de practica para mejorar tus habilidades
          </p>
        </div>

        <div className="grid gap-4">
          {PRACTICE_MODES.map((mode, idx) => {
            const Icon = mode.icon
            return (
              <motion.button
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                onClick={() => {
                  setSelectedMode(mode.id)
                  resetSession()
                }}
                className="w-full bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10 hover:shadow-md hover:border-primary/20 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    mode.color === "primary" ? "bg-primary/10" : "bg-secondary/10"
                  } group-hover:scale-105 transition-transform`}>
                    <Icon className={`w-7 h-7 ${
                      mode.color === "primary" ? "text-primary" : "text-secondary"
                    }`} />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-on-surface text-lg group-hover:text-primary transition-colors">
                      {mode.title}
                    </h3>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                      {mode.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                        <Clock className="w-3 h-3" />
                        {mode.duration}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        mode.difficulty === "Basico" 
                          ? "bg-secondary/10 text-secondary" 
                          : mode.difficulty === "Intermedio"
                          ? "bg-primary/10 text-primary"
                          : "bg-error/10 text-error"
                      }`}>
                        {mode.difficulty}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Daily Challenge */}
        <div className="bg-gradient-to-br from-primary to-primary-container rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5" />
              <span className="font-semibold">Reto del dia</span>
            </div>
            <p className="text-white/90 mb-4">
              Completa 3 simulaciones de llamada y gana 50 puntos extra
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{ width: "33%" }} />
              </div>
              <span className="text-sm font-medium">1/3</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Session Complete View
  if (sessionComplete) {
    const maxScore = selectedMode === "typing" ? 45 : selectedMode === "simulation" ? 30 : 30
    const percentage = Math.round((score / maxScore) * 100)
    const stars = percentage >= 90 ? 3 : percentage >= 70 ? 2 : percentage >= 50 ? 1 : 0

    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-24 h-24 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-12 h-12 text-secondary" />
        </motion.div>

        <h2 className="text-2xl font-bold text-on-surface mb-2">
          Sesion completada!
        </h2>
        <p className="text-on-surface-variant mb-6">
          {percentage >= 70 ? "Excelente trabajo! Sigue asi." : "Buen intento! Practica un poco mas."}
        </p>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((star) => (
            <motion.div
              key={star}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: star * 0.2 }}
            >
              <Star 
                className={`w-10 h-10 ${star <= stars ? "text-yellow-400 fill-yellow-400" : "text-surface-container-high"}`} 
              />
            </motion.div>
          ))}
        </div>

        {/* Score Card */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-3xl font-bold text-primary">{score}</p>
              <p className="text-sm text-on-surface-variant">Puntos ganados</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-secondary">{percentage}%</p>
              <p className="text-sm text-on-surface-variant">Precision</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={resetSession}
            className="w-full py-4 bg-primary text-white rounded-2xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Practicar de nuevo
          </button>
          <button
            onClick={() => {
              setSelectedMode(null)
              resetSession()
            }}
            className="w-full py-4 bg-surface-container text-on-surface rounded-2xl font-semibold hover:bg-surface-container-high transition-colors"
          >
            Elegir otro modo
          </button>
        </div>
      </div>
    )
  }

  // Simulation Mode
  if (selectedMode === "simulation") {
    const scenario = SIMULATION_SCENARIOS[0]
    const step = scenario.steps[currentStep]
    const progress = ((currentStep + 1) / scenario.steps.length) * 100

    return (
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => setSelectedMode(null)}
            className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Volver</span>
          </button>

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-on-surface-variant">
              Paso {currentStep + 1} de {scenario.steps.length}
            </span>
            <span className="text-sm font-semibold text-primary">
              {score} puntos
            </span>
          </div>

          <div className="w-full bg-surface-container rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Scenario Info */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 mb-4 flex items-center gap-3 border border-outline-variant/10">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-on-surface">{scenario.customerName}</p>
            <p className="text-xs text-on-surface-variant">{scenario.title}</p>
          </div>
        </div>

        {/* Customer Message */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container rounded-2xl p-5 mb-6"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-outline-variant/30 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-on-surface-variant" />
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface-variant mb-1">Cliente:</p>
              <p className="text-on-surface leading-relaxed">&quot;{step.customer}&quot;</p>
            </div>
          </div>
          <button
            onClick={() => playAudio(step.customer)}
            className="mt-3 flex items-center gap-2 text-sm text-primary font-medium hover:underline"
          >
            <Volume2 className={`w-4 h-4 ${isPlaying ? "animate-pulse" : ""}`} />
            {isPlaying ? "Reproduciendo..." : "Escuchar"}
          </button>
        </motion.div>

        {/* Response Options */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-on-surface mb-3">Elige tu respuesta:</p>
          {step.expectedResponses.map((response, idx) => {
            const isSelected = selectedAnswer === idx
            const showResult = showFeedback && isSelected
            const isCorrectAnswer = idx === step.correctIndex

            return (
              <motion.button
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => !showFeedback && handleSimulationAnswer(idx)}
                disabled={showFeedback}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  showResult
                    ? isCorrect
                      ? "border-secondary bg-secondary/10"
                      : "border-error bg-error/10"
                    : showFeedback && isCorrectAnswer
                    ? "border-secondary bg-secondary/10"
                    : isSelected
                    ? "border-primary bg-primary/5"
                    : "border-outline-variant/30 hover:border-primary/50 bg-surface-container-lowest"
                } disabled:cursor-not-allowed`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    showResult
                      ? isCorrect
                        ? "bg-secondary text-white"
                        : "bg-error text-white"
                      : showFeedback && isCorrectAnswer
                      ? "bg-secondary text-white"
                      : "bg-surface-container text-on-surface-variant"
                  }`}>
                    {showResult ? (
                      isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
                    ) : showFeedback && isCorrectAnswer ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-medium">{idx + 1}</span>
                    )}
                  </div>
                  <p className="text-sm text-on-surface">{response}</p>
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-6 p-4 rounded-xl ${
                isCorrect ? "bg-secondary/10 border border-secondary/20" : "bg-error/10 border border-error/20"
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-error flex-shrink-0" />
                )}
                <p className={`text-sm ${isCorrect ? "text-secondary" : "text-error"}`}>
                  {isCorrect ? step.feedback.correct : step.feedback.incorrect}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Listening Mode
  if (selectedMode === "listening") {
    const exercise = LISTENING_EXERCISES[currentStep]
    const progress = ((currentStep + 1) / LISTENING_EXERCISES.length) * 100

    return (
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => setSelectedMode(null)}
            className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Volver</span>
          </button>

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-on-surface-variant">
              Ejercicio {currentStep + 1} de {LISTENING_EXERCISES.length}
            </span>
            <span className="text-sm font-semibold text-primary">
              {score} puntos
            </span>
          </div>

          <div className="w-full bg-surface-container rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Audio Player */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-primary to-primary-container rounded-2xl p-8 text-white text-center mb-6"
        >
          <Headphones className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <p className="text-lg font-medium mb-6">Escucha la frase en ingles</p>
          <button
            onClick={() => playAudio(exercise.audio)}
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-all ${
              isPlaying 
                ? "bg-white/30 scale-110" 
                : "bg-white/20 hover:bg-white/30 hover:scale-105"
            }`}
          >
            {isPlaying ? (
              <Volume2 className="w-8 h-8 animate-pulse" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </button>
          <p className="text-sm text-white/70 mt-4">
            {isPlaying ? "Reproduciendo..." : "Toca para escuchar"}
          </p>
        </motion.div>

        {/* Options */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-on-surface mb-3">Que significa esta frase?</p>
          {exercise.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx
            const showResult = showFeedback && isSelected
            const isCorrectAnswer = idx === exercise.correctIndex

            return (
              <motion.button
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => !showFeedback && handleListeningAnswer(idx)}
                disabled={showFeedback}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  showResult
                    ? isCorrect
                      ? "border-secondary bg-secondary/10"
                      : "border-error bg-error/10"
                    : showFeedback && isCorrectAnswer
                    ? "border-secondary bg-secondary/10"
                    : "border-outline-variant/30 hover:border-primary/50 bg-surface-container-lowest"
                } disabled:cursor-not-allowed`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    showResult
                      ? isCorrect
                        ? "bg-secondary text-white"
                        : "bg-error text-white"
                      : showFeedback && isCorrectAnswer
                      ? "bg-secondary text-white"
                      : "bg-surface-container text-on-surface-variant"
                  }`}>
                    {showResult ? (
                      isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
                    ) : showFeedback && isCorrectAnswer ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{String.fromCharCode(65 + idx)}</span>
                    )}
                  </div>
                  <p className="text-on-surface">{option}</p>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    )
  }

  // Typing Mode
  if (selectedMode === "typing") {
    const exercise = TYPING_EXERCISES[currentStep]
    const progress = ((currentStep + 1) / TYPING_EXERCISES.length) * 100

    return (
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => setSelectedMode(null)}
            className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Volver</span>
          </button>

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-on-surface-variant">
              Ejercicio {currentStep + 1} de {TYPING_EXERCISES.length}
            </span>
            <span className="text-sm font-semibold text-primary">
              {score} puntos
            </span>
          </div>

          <div className="w-full bg-surface-container rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Prompt */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest rounded-2xl p-6 mb-6 shadow-sm border border-outline-variant/10"
        >
          <MessageSquare className="w-8 h-8 text-primary mb-4" />
          <p className="text-lg text-on-surface leading-relaxed">
            {exercise.prompt}
          </p>
          
          {/* Hints */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-on-surface-variant">Pistas:</span>
            {exercise.hints.map((hint, idx) => (
              <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                {hint}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Input */}
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              placeholder="Escribe tu respuesta en ingles..."
              disabled={showFeedback}
              className="w-full bg-surface-container-lowest border-2 border-outline-variant/30 rounded-xl px-4 py-4 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors resize-none h-32 disabled:opacity-50"
            />
          </div>

          <button
            onClick={handleTypingSubmit}
            disabled={!typedAnswer.trim() || showFeedback}
            className="w-full py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            Verificar respuesta
          </button>
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-6 p-4 rounded-xl ${
                isCorrect ? "bg-secondary/10 border border-secondary/20" : "bg-error/10 border border-error/20"
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-error flex-shrink-0" />
                )}
                <div>
                  <p className={`text-sm font-medium ${isCorrect ? "text-secondary" : "text-error"}`}>
                    {isCorrect ? "Correcto!" : "Casi! La respuesta correcta es:"}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm text-on-surface mt-1 font-medium">
                      &quot;{exercise.expectedAnswer}&quot;
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return null
}
