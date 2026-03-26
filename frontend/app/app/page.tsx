"use client"

import Link from "next/link"
import { 
  Play, 
  BookOpen, 
  Headphones,
  ChevronRight,
  Target,
  Clock,
  TrendingUp,
  Zap,
  Phone,
  MessageSquare,
  Star,
  Loader2
} from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { useUserProgress, usePhrases } from "@/hooks/useCallCenter"

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { data: progressData, isLoading: progressLoading } = useUserProgress()
  const { data: phrasesData, isLoading: phrasesLoading } = usePhrases({ limit: 3 })

  const isLoading = authLoading || progressLoading || phrasesLoading

  // Fallback data when not authenticated or loading
  const progress = progressData || {
    total_phrases_learned: 0,
    total_practice_sessions: 0,
    current_streak: 0,
    total_points: 0,
    level: 1,
    skills: {
      greetings: 0,
      problem_solving: 0,
      empathy: 0,
      closing: 0,
      pronunciation: 0
    }
  }

  const phrases = phrasesData?.phrases || []
  const userName = user?.email?.split("@")[0] || "Estudiante"

  const QUICK_STATS = [
    { label: "Frases aprendidas", value: progress.total_phrases_learned.toString(), icon: BookOpen, color: "primary" },
    { label: "Sesiones completadas", value: progress.total_practice_sessions.toString(), icon: Clock, color: "secondary" },
    { label: "Puntos totales", value: progress.total_points.toString(), icon: Target, color: "primary" },
    { label: "Racha actual", value: `${progress.current_streak} dias`, icon: TrendingUp, color: "secondary" },
  ]

  const RECENT_MODULES = [
    {
      id: 1,
      title: "Saludos y bienvenida",
      progress: Math.min(progress.skills.greetings, 100),
      totalPhrases: 12,
      completedPhrases: Math.floor(progress.skills.greetings / 10),
      icon: Phone,
    },
    {
      id: 2,
      title: "Manejo de quejas",
      progress: Math.min(progress.skills.problem_solving, 100),
      totalPhrases: 15,
      completedPhrases: Math.floor(progress.skills.problem_solving / 10),
      icon: MessageSquare,
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-on-surface-variant">Cargando tu progreso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-on-surface">
            Buen dia, <span className="text-gradient">{userName}</span>
          </h1>
          <p className="text-on-surface-variant mt-1">
            Nivel <span className="font-semibold text-primary">{progress.level}</span> - {progress.total_points} puntos totales
          </p>
        </div>

        <Link
          href="/app/practice"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-container text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:opacity-95 active:scale-[0.98] transition-all"
        >
          <Zap className="w-5 h-5" />
          Comenzar practica rapida
        </Link>
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {QUICK_STATS.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div 
              key={idx}
              className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10 hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                stat.color === "primary" ? "bg-primary/10" : "bg-secondary/10"
              }`}>
                <Icon className={`w-5 h-5 ${stat.color === "primary" ? "text-primary" : "text-secondary"}`} />
              </div>
              <p className="text-2xl font-bold text-on-surface">{stat.value}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{stat.label}</p>
            </div>
          )
        })}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Practice Card - Main CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-2 bg-gradient-to-br from-primary to-primary-container rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full border-2 border-white/50" />
            <div className="absolute -right-20 -bottom-20 w-60 h-60 rounded-full border-2 border-white/30" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white/20 px-3 py-1 rounded-full">
                <span className="text-xs font-semibold">Leccion de hoy</span>
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3" />
                <span className="text-xs font-semibold">+50 XP</span>
              </div>
            </div>

            <h2 className="text-xl lg:text-2xl font-bold mb-2">
              Frases esenciales para atencion al cliente
            </h2>
            <p className="text-white/80 mb-6 max-w-md">
              Aprende las frases mas usadas en llamadas reales de soporte tecnico y ventas.
            </p>

            {/* Preview Phrase */}
            {phrases.length > 0 && (
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/20">
                <p className="text-sm text-white/70 mb-1">Frase del dia:</p>
                <p className="text-lg font-semibold">
                  &quot;{phrases[0].english}&quot;
                </p>
                <p className="text-white/70 text-sm mt-1">
                  {phrases[0].spanish}
                </p>
              </div>
            )}

            <Link
              href="/app/learn"
              className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3.5 rounded-2xl font-bold text-sm hover:bg-white/95 active:scale-[0.98] transition-all shadow-lg"
            >
              <Play className="w-5 h-5" />
              Comenzar leccion
            </Link>
          </div>
        </motion.div>

        {/* Quick Practice Module */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/10"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-on-surface">Practica rapida</h3>
            <Headphones className="w-5 h-5 text-primary" />
          </div>

          <div className="space-y-3">
            {[
              { label: "Simulacion de llamada", duration: "5 min", icon: Phone },
              { label: "Escucha activa", duration: "3 min", icon: MessageSquare },
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <Link
                  key={idx}
                  href="/app/practice"
                  className="flex items-center gap-3 p-4 bg-surface-container rounded-2xl hover:bg-surface-container-high transition-colors group"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-on-surface text-sm">{item.label}</p>
                    <p className="text-xs text-on-surface-variant">{item.duration}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors" />
                </Link>
              )
            })}
          </div>

          <Link
            href="/app/practice"
            className="flex items-center justify-center gap-2 w-full mt-4 py-3 border-2 border-dashed border-outline-variant/50 rounded-2xl text-on-surface-variant font-medium text-sm hover:border-primary hover:text-primary transition-colors"
          >
            Ver todas las practicas
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

      {/* Recent Modules */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-on-surface">Continuar aprendiendo</h2>
          <Link href="/app/learn" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            Ver todo
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RECENT_MODULES.map((module) => {
            const Icon = module.icon
            return (
              <Link
                key={module.id}
                href="/app/learn"
                className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10 hover:shadow-md hover:border-primary/20 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-on-surface mb-1 group-hover:text-primary transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant mb-3">
                      {module.completedPhrases}/{module.totalPhrases} frases completadas
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-surface-container rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
                        style={{ width: `${module.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-on-surface-variant mt-2">{module.progress}% completado</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </motion.div>

      {/* Daily Phrases Preview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-on-surface">Frases de hoy</h2>
          <span className="text-sm text-on-surface-variant">{phrases.length} disponibles</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {phrases.map((phrase, idx) => (
            <div
              key={phrase.id}
              className={`bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10 relative overflow-hidden ${
                idx === 0 ? "ring-2 ring-primary/20" : ""
              }`}
            >
              {idx === 0 && (
                <span className="absolute top-3 right-3 text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  Siguiente
                </span>
              )}
              
              <div className="mb-3">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  phrase.difficulty === "beginner" 
                    ? "bg-secondary/10 text-secondary" 
                    : "bg-primary/10 text-primary"
                }`}>
                  {phrase.category}
                </span>
              </div>

              <p className="font-semibold text-on-surface mb-2 leading-relaxed line-clamp-2">
                &quot;{phrase.english}&quot;
              </p>
              <p className="text-sm text-on-surface-variant line-clamp-2">
                {phrase.spanish}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
