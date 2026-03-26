"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  ArrowLeft,
  Phone,
  Volume2,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  ChevronRight,
  RotateCcw,
  Send,
  User,
  Headphones,
  Target,
  Loader2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useScenarios, useStartPracticeSession, useSubmitResponse, useCompletePracticeSession } from "@/hooks/useCallCenter"
import { mutate } from "swr"

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

// Listening exercises (static for now)
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

// Typing exercises (static for now)
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
  const [sessionComplete, setSessionComplete] = useState(false)
  const [activeSession, setActiveSession] = useState<{ id: string; scenario_id: string } | null>(null)
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState("")

  // Backend hooks
  const { data: scenariosData, isLoading: scenariosLoading } = useScenarios()
  const { trigger: startSession, isMutating: isStarting } = useStartPracticeSession()
  const { trigger: submitResponse, isMutating: isSubmitting } = useSubmitResponse()
  const { trigger: completeSession, isMutating: isCompleting } = useCompletePracticeSession()

  const scenarios = scenariosData?.scenarios || []
  const currentScenario = scenarios.find(s => s.id === selectedScenarioId)

  // Reset state when changing modes
  const resetSession = () => {
    setCurrentStep(0)
    setScore(0)
    setShowFeedback(false)
    setIsCorrect(false)
    setSelectedAnswer(null)
    setTypedAnswer("")
    setSessionComplete(false)
    setActiveSession(null)
    setSelectedScenarioId(null)
    setFeedbackMessage("")
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

  const handleStartScenario = async (scenarioId: string) => {
    try {
      const session = await startSession(scenarioId)
      setActiveSession({ id: session.id, scenario_id: scenarioId })
      setSelectedScenarioId(scenarioId)
    } catch (error) {
      console.error("Error starting session:", error)
    }
  }

  const handleSimulationAnswer = async (answerIndex: number) => {
    if (!currentScenario || !activeSession) return
    
    setSelectedAnswer(answerIndex)
    const expectedResponses = currentScenario.expected_responses
    const userResponse = expectedResponses[answerIndex] || ""
    const expectedResponse = expectedResponses[0] // First is typically the best answer

    try {
      const result = await submitResponse({
        session_id: activeSession.id,
        scenario_id: activeSession.scenario_id,
        user_response: userResponse,
        expected_response: expectedResponse
      })

      setIsCorrect(result.is_correct)
      setScore(prev => prev + result.score)
      setFeedbackMessage(result.feedback)
      setShowFeedback(true)

      setTimeout(() => {
        setShowFeedback(false)
        setSelectedAnswer(null)
        setFeedbackMessage("")
        
        if (currentStep < expectedResponses.length - 1) {
          setCurrentStep(prev => prev + 1)
        } else {
          handleCompleteSession()
        }
      }, 2500)
    } catch (error) {
      console.error("Error submitting response:", error)
      // Fallback to local logic
      const correct = answerIndex === 0 // First answer is usually correct
      setIsCorrect(correct)
      setShowFeedback(true)
      if (correct) setScore(prev => prev + 10)
      
      setTimeout(() => {
        setShowFeedback(false)
        setSelectedAnswer(null)
        if (currentStep < expectedResponses.length - 1) {
          setCurrentStep(prev => prev + 1)
        } else {
          setSessionComplete(true)
        }
      }, 2500)
    }
  }

  const handleCompleteSession = async () => {
    if (!activeSession) {
      setSessionComplete(true)
      return
    }

    try {
      await completeSession(activeSession.id)
      mutate("userProgress")
    } catch (error) {
      console.error("Error completing session:", error)
    }
    setSessionComplete(true)
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
              <p className="text-3xl font-bold text-secondary">{Math.min(percentage, 100)}%</p>
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

  // Simulation Mode - Scenario Selection
  if (selectedMode === "simulation" && !selectedScenarioId) {
    if (scenariosLoading) {
      return (
        <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-on-surface-variant">Cargando escenarios...</p>
          </div>
        </div>
      )
    }

    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setSelectedMode(null)}
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Volver</span>
        </button>

        <h2 className="text-xl font-bold text-on-surface mb-2">Elige un escenario</h2>
        <p className="text-on-surface-variant mb-6">Practica situaciones reales de call center</p>

        <div className="space-y-4">
          {scenarios.map((scenario, idx) => (
            <motion.button
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => handleStartScenario(scenario.id)}
              disabled={isStarting}
              className="w-full text-left bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10 hover:shadow-md hover:border-primary/20 transition-all group disabled:opacity-50"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  scenario.difficulty === "beginner" ? "bg-secondary/10" : 
                  scenario.difficulty === "intermediate" ? "bg-primary/10" : "bg-error/10"
                }`}>
                  <Phone className={`w-6 h-6 ${
                    scenario.difficulty === "beginner" ? "text-secondary" : 
                    scenario.difficulty === "intermediate" ? "text-primary" : "text-error"
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                    {scenario.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant mt-1">
                    {scenario.description}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      scenario.difficulty === "beginner" ? "bg-secondary/10 text-secondary" : 
                      scenario.difficulty === "intermediate" ? "bg-primary/10 text-primary" : 
                      "bg-error/10 text-error"
                    }`}>
                      {scenario.difficulty === "beginner" ? "Basico" : 
                       scenario.difficulty === "intermediate" ? "Intermedio" : "Avanzado"}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {scenario.category}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // Simulation Mode - Active Practice
  if (selectedMode === "simulation" && currentScenario) {
    const expectedResponses = currentScenario.expected_responses
    const progress = ((currentStep + 1) / expectedResponses.length) * 100

    return (
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => {
              setSelectedScenarioId(null)
              setActiveSession(null)
              setCurrentStep(0)
            }}
            className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Volver</span>
          </button>

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-on-surface-variant">
              Paso {currentStep + 1} de {expectedResponses.length}
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
            <p className="font-medium text-on-surface">{currentScenario.customer_persona}</p>
            <p className="text-xs text-on-surface-variant">{currentScenario.title}</p>
          </div>
        </div>

        {/* Customer Situation */}
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
              <p className="text-sm font-medium text-on-surface-variant mb-1">Situacion:</p>
              <p className="text-on-surface leading-relaxed">&quot;{currentScenario.situation}&quot;</p>
            </div>
          </div>
          <button
            onClick={() => playAudio(currentScenario.situation)}
            className="mt-3 flex items-center gap-2 text-sm text-primary font-medium hover:underline"
          >
            <Volume2 className={`w-4 h-4 ${isPlaying ? "animate-pulse" : ""}`} />
            {isPlaying ? "Reproduciendo..." : "Escuchar"}
          </button>
        </motion.div>

        {/* Response Options */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-on-surface mb-3">Elige tu respuesta:</p>
          {expectedResponses.slice(0, 3).map((response, idx) => {
            const isSelected = selectedAnswer === idx
            const showResult = showFeedback && isSelected
            const isCorrectAnswer = idx === 0 // First response is typically the best

            return (
              <motion.button
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => !showFeedback && !isSubmitting && handleSimulationAnswer(idx)}
                disabled={showFeedback || isSubmitting}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mt-6 p-4 rounded-xl border ${
                isCorrect 
                  ? "bg-secondary/10 border-secondary/20" 
                  : "bg-error/10 border-error/20"
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-error flex-shrink-0" />
                )}
                <p className={`text-sm ${isCorrect ? "text-secondary" : "text-error"}`}>
                  {feedbackMessage || (isCorrect ? "Excelente respuesta!" : "Intenta de nuevo con una respuesta mas empatica.")}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hints */}
        {currentScenario.hints.length > 0 && !showFeedback && (
          <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <p className="text-sm font-medium text-primary mb-2">Tips:</p>
            <ul className="space-y-1">
              {currentScenario.hints.map((hint, idx) => (
                <li key={idx} className="text-sm text-on-surface-variant flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {hint}
                </li>
              ))}
            </ul>
          </div>
        )}
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest rounded-2xl p-6 mb-6 text-center border border-outline-variant/10"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Headphones className="w-8 h-8 text-primary" />
          </div>
          <p className="text-on-surface-variant mb-4">Escucha la frase y selecciona su significado</p>
          <button
            onClick={() => playAudio(exercise.audio)}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              isPlaying 
                ? "bg-primary/20 text-primary" 
                : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            <span className="flex items-center gap-2">
              <Volume2 className={`w-5 h-5 ${isPlaying ? "animate-pulse" : ""}`} />
              {isPlaying ? "Reproduciendo..." : "Escuchar frase"}
            </span>
          </button>
        </motion.div>

        {/* Options */}
        <div className="space-y-3">
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
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
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
                      <span className="text-xs font-medium">{String.fromCharCode(65 + idx)}</span>
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
          className="bg-surface-container-lowest rounded-2xl p-6 mb-6 border border-outline-variant/10"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-on-surface">{exercise.prompt}</p>
            </div>
          </div>

          {/* Hints */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs text-on-surface-variant">Pistas:</span>
            {exercise.hints.map((hint, idx) => (
              <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {hint}
              </span>
            ))}
          </div>

          {/* Input */}
          <div className="relative">
            <input
              type="text"
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && typedAnswer.trim() && handleTypingSubmit()}
              placeholder="Escribe tu respuesta en ingles..."
              disabled={showFeedback}
              className="w-full p-4 pr-12 bg-surface-container rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none text-on-surface placeholder:text-on-surface-variant disabled:opacity-50"
            />
            <button
              onClick={handleTypingSubmit}
              disabled={!typedAnswer.trim() || showFeedback}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Feedback */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-xl border ${
                isCorrect 
                  ? "bg-secondary/10 border-secondary/20" 
                  : "bg-error/10 border-error/20"
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
                    {isCorrect ? "Correcto!" : "Respuesta correcta:"}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm text-on-surface mt-1">{exercise.expectedAnswer}</p>
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
