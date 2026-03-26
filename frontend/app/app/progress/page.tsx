"use client"

import { useState } from "react"
import { 
  TrendingUp,
  Trophy,
  Flame,
  Target,
  Clock,
  BookOpen,
  CheckCircle2,
  Calendar,
  Star,
  Zap,
  Award,
  ChevronRight,
  BarChart3
} from "lucide-react"
import { motion } from "framer-motion"

// Mock progress data
const WEEKLY_ACTIVITY = [
  { day: "Lun", phrases: 8, minutes: 25, completed: true },
  { day: "Mar", phrases: 12, minutes: 35, completed: true },
  { day: "Mie", phrases: 5, minutes: 15, completed: true },
  { day: "Jue", phrases: 10, minutes: 30, completed: true },
  { day: "Vie", phrases: 7, minutes: 20, completed: true },
  { day: "Sab", phrases: 3, minutes: 10, completed: false },
  { day: "Dom", phrases: 0, minutes: 0, completed: false },
]

const ACHIEVEMENTS = [
  {
    id: 1,
    title: "Primera leccion",
    description: "Completaste tu primera leccion",
    icon: BookOpen,
    unlocked: true,
    date: "15 Mar 2024",
    color: "primary"
  },
  {
    id: 2,
    title: "Racha de 5 dias",
    description: "Practica 5 dias seguidos",
    icon: Flame,
    unlocked: true,
    date: "20 Mar 2024",
    color: "secondary"
  },
  {
    id: 3,
    title: "100 frases",
    description: "Aprende 100 frases",
    icon: Target,
    unlocked: false,
    progress: 47,
    total: 100,
    color: "primary"
  },
  {
    id: 4,
    title: "Experto en empatia",
    description: "Domina todas las frases de empatia",
    icon: Star,
    unlocked: false,
    progress: 8,
    total: 15,
    color: "secondary"
  },
  {
    id: 5,
    title: "Simulador Pro",
    description: "Completa 10 simulaciones con 90%+ precision",
    icon: Trophy,
    unlocked: false,
    progress: 3,
    total: 10,
    color: "primary"
  },
  {
    id: 6,
    title: "Madrugador",
    description: "Practica antes de las 8am por 7 dias",
    icon: Clock,
    unlocked: false,
    progress: 2,
    total: 7,
    color: "secondary"
  },
]

const SKILL_PROGRESS = [
  { name: "Saludos", level: 3, maxLevel: 5, phrases: 12, mastered: 10 },
  { name: "Empatia", level: 2, maxLevel: 5, phrases: 15, mastered: 8 },
  { name: "Resolucion", level: 2, maxLevel: 5, phrases: 18, mastered: 7 },
  { name: "Cierre", level: 1, maxLevel: 5, phrases: 10, mastered: 3 },
  { name: "Quejas", level: 1, maxLevel: 5, phrases: 15, mastered: 5 },
]

const MONTHLY_STATS = [
  { month: "Ene", phrases: 45 },
  { month: "Feb", phrases: 62 },
  { month: "Mar", phrases: 78 },
]

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "achievements" | "skills">("overview")

  // Calculate stats
  const totalPhrases = 47
  const totalMinutes = 128
  const streakDays = 5
  const accuracy = 84
  const weeklyGoal = 50
  const weeklyProgress = WEEKLY_ACTIVITY.reduce((acc, day) => acc + day.phrases, 0)

  const maxDailyPhrases = Math.max(...WEEKLY_ACTIVITY.map(d => d.phrases))

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-on-surface mb-2">
          Tu progreso
        </h1>
        <p className="text-on-surface-variant">
          Mira cuanto has avanzado en tu entrenamiento
        </p>
      </div>

      {/* Main Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: "Frases aprendidas", value: totalPhrases, icon: BookOpen, color: "primary", suffix: "" },
          { label: "Minutos de practica", value: totalMinutes, icon: Clock, color: "secondary", suffix: " min" },
          { label: "Racha actual", value: streakDays, icon: Flame, color: "primary", suffix: " dias" },
          { label: "Precision", value: accuracy, icon: Target, color: "secondary", suffix: "%" },
        ].map((stat, idx) => {
          const Icon = stat.icon
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                stat.color === "primary" ? "bg-primary/10" : "bg-secondary/10"
              }`}>
                <Icon className={`w-5 h-5 ${stat.color === "primary" ? "text-primary" : "text-secondary"}`} />
              </div>
              <p className="text-2xl font-bold text-on-surface">
                {stat.value}{stat.suffix}
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">{stat.label}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-surface-container rounded-xl">
        {[
          { id: "overview", label: "Resumen", icon: BarChart3 },
          { id: "achievements", label: "Logros", icon: Trophy },
          { id: "skills", label: "Habilidades", icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                isActive 
                  ? "bg-surface-container-lowest text-on-surface shadow-sm" 
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Weekly Activity */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-on-surface">Actividad semanal</h3>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  {weeklyProgress} de {weeklyGoal} frases esta semana
                </p>
              </div>
              <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">+12%</span>
              </div>
            </div>

            {/* Weekly Goal Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-on-surface-variant">Meta semanal</span>
                <span className="text-sm font-medium text-on-surface">
                  {Math.round((weeklyProgress / weeklyGoal) * 100)}%
                </span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-3">
                <motion.div 
                  className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((weeklyProgress / weeklyGoal) * 100, 100)}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </div>
            </div>

            {/* Daily Bars */}
            <div className="flex items-end justify-between gap-2 h-32">
              {WEEKLY_ACTIVITY.map((day, idx) => {
                const height = maxDailyPhrases > 0 ? (day.phrases / maxDailyPhrases) * 100 : 0
                const isToday = idx === 5 // Saturday in this example

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center justify-end h-24">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(height, 8)}%` }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                        className={`w-full max-w-8 rounded-t-lg ${
                          day.completed 
                            ? "bg-gradient-to-t from-primary to-primary/70" 
                            : isToday 
                            ? "bg-primary/30 border-2 border-dashed border-primary"
                            : "bg-surface-container"
                        }`}
                      />
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${isToday ? "text-primary" : "text-on-surface-variant"}`}>
                        {day.day}
                      </p>
                      <p className="text-[10px] text-on-surface-variant">{day.phrases}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Monthly Trend */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10"
          >
            <h3 className="font-semibold text-on-surface mb-4">Progreso mensual</h3>
            <div className="flex items-end justify-between gap-4 h-40">
              {MONTHLY_STATS.map((month, idx) => {
                const maxPhrases = Math.max(...MONTHLY_STATS.map(m => m.phrases))
                const height = (month.phrases / maxPhrases) * 100

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="w-full bg-gradient-to-t from-secondary to-secondary/60 rounded-t-xl relative"
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-semibold text-on-surface">
                        {month.phrases}
                      </span>
                    </motion.div>
                    <p className="text-sm font-medium text-on-surface-variant">{month.month}</p>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10"
          >
            <h3 className="font-semibold text-on-surface mb-4">Actividad reciente</h3>
            <div className="space-y-3">
              {[
                { action: "Completaste modulo de Saludos", time: "Hace 2 horas", icon: CheckCircle2, color: "secondary" },
                { action: "Nueva racha de 5 dias!", time: "Hoy", icon: Flame, color: "primary" },
                { action: "Simulacion completada: 90% precision", time: "Ayer", icon: Target, color: "secondary" },
                { action: "10 frases nuevas aprendidas", time: "Ayer", icon: BookOpen, color: "primary" },
              ].map((item, idx) => {
                const Icon = item.icon
                return (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-surface-container rounded-xl">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      item.color === "primary" ? "bg-primary/10" : "bg-secondary/10"
                    }`}>
                      <Icon className={`w-5 h-5 ${item.color === "primary" ? "text-primary" : "text-secondary"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-on-surface">{item.action}</p>
                      <p className="text-xs text-on-surface-variant">{item.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === "achievements" && (
        <div className="space-y-6">
          {/* Unlocked Achievements */}
          <div>
            <h3 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Logros desbloqueados
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ACHIEVEMENTS.filter(a => a.unlocked).map((achievement, idx) => {
                const Icon = achievement.icon
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-gradient-to-br from-surface-container-lowest to-surface-container rounded-2xl p-5 shadow-sm border border-primary/20"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        achievement.color === "primary" 
                          ? "bg-primary/20" 
                          : "bg-secondary/20"
                      }`}>
                        <Icon className={`w-7 h-7 ${
                          achievement.color === "primary" ? "text-primary" : "text-secondary"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-on-surface">{achievement.title}</h4>
                          <CheckCircle2 className="w-4 h-4 text-secondary" />
                        </div>
                        <p className="text-sm text-on-surface-variant mt-0.5">{achievement.description}</p>
                        <p className="text-xs text-primary mt-2 font-medium">{achievement.date}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Locked Achievements */}
          <div>
            <h3 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-on-surface-variant" />
              Proximos logros
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ACHIEVEMENTS.filter(a => !a.unlocked).map((achievement, idx) => {
                const Icon = achievement.icon
                const progress = achievement.progress || 0
                const total = achievement.total || 100
                const percentage = (progress / total) * 100

                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10 opacity-80"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-surface-container">
                        <Icon className="w-7 h-7 text-on-surface-variant" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-on-surface">{achievement.title}</h4>
                        <p className="text-sm text-on-surface-variant mt-0.5">{achievement.description}</p>
                        
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-on-surface-variant">{progress}/{total}</span>
                            <span className="text-xs font-medium text-primary">{Math.round(percentage)}%</span>
                          </div>
                          <div className="w-full bg-surface-container rounded-full h-2">
                            <div 
                              className="bg-primary/50 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === "skills" && (
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10"
          >
            <h3 className="font-semibold text-on-surface mb-6">Tus habilidades</h3>
            
            <div className="space-y-6">
              {SKILL_PROGRESS.map((skill, idx) => {
                const levelProgress = (skill.level / skill.maxLevel) * 100
                const masteryProgress = (skill.mastered / skill.phrases) * 100

                return (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 bg-surface-container rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">{skill.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-on-surface">{skill.name}</h4>
                          <p className="text-xs text-on-surface-variant">
                            {skill.mastered}/{skill.phrases} frases dominadas
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          {[...Array(skill.maxLevel)].map((_, i) => (
                            <Star 
                              key={i}
                              className={`w-4 h-4 ${
                                i < skill.level 
                                  ? "text-yellow-400 fill-yellow-400" 
                                  : "text-surface-container-high"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1">Nivel {skill.level}</p>
                      </div>
                    </div>

                    {/* Mastery Progress */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-on-surface-variant">Dominio</span>
                        <span className="text-xs font-medium text-primary">{Math.round(masteryProgress)}%</span>
                      </div>
                      <div className="w-full bg-surface-container-high rounded-full h-2">
                        <motion.div 
                          className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${masteryProgress}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Skill Tips */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-2xl p-6 border border-secondary/20"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h4 className="font-semibold text-on-surface mb-1">Consejo para mejorar</h4>
                <p className="text-sm text-on-surface-variant">
                  Tu habilidad mas debil es <span className="font-medium text-on-surface">Cierre</span>. 
                  Practica las frases de despedida para subir de nivel mas rapido.
                </p>
                <button className="mt-3 text-sm font-medium text-secondary hover:underline flex items-center gap-1">
                  Ir a practicar
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
