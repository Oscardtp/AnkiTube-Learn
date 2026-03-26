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
  Star,
  Zap,
  Award,
  BarChart3,
  Loader2
} from "lucide-react"
import { motion } from "framer-motion"
import { useUserProgress, useAchievements } from "@/hooks/useCallCenter"

// Icon mapping for achievements
const ICON_MAP: Record<string, typeof BookOpen> = {
  star: Star,
  book: BookOpen,
  play: Zap,
  flame: Flame,
  trophy: Trophy,
  zap: Zap,
  award: Award,
  heart: Target,
}

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "achievements" | "skills">("overview")

  // Fetch data from backend
  const { data: progressData, isLoading: progressLoading } = useUserProgress()
  const { data: achievementsData, isLoading: achievementsLoading } = useAchievements()

  const isLoading = progressLoading || achievementsLoading

  // Fallback data
  const progress = progressData || {
    total_phrases_learned: 0,
    total_practice_sessions: 0,
    current_streak: 0,
    longest_streak: 0,
    total_points: 0,
    level: 1,
    skills: {
      greetings: 0,
      problem_solving: 0,
      empathy: 0,
      closing: 0,
      pronunciation: 0
    },
    achievements: [],
    weekly_activity: [],
    last_session_at: null
  }

  const achievements = achievementsData?.achievements || progress.achievements || []
  const weeklyActivity = progress.weekly_activity || []

  // Calculate stats
  const totalPhrases = progress.total_phrases_learned
  const totalSessions = progress.total_practice_sessions
  const streakDays = progress.current_streak
  const totalPoints = progress.total_points
  const weeklyGoal = 50
  const weeklyProgress = weeklyActivity.reduce((acc, day) => acc + day.sessions * 5, 0)
  const maxDailyActivity = Math.max(...weeklyActivity.map(d => d.sessions), 1)

  // Skill data for display
  const SKILL_DISPLAY = [
    { key: "greetings", name: "Saludos", maxLevel: 5 },
    { key: "empathy", name: "Empatia", maxLevel: 5 },
    { key: "problem_solving", name: "Resolucion", maxLevel: 5 },
    { key: "closing", name: "Cierre", maxLevel: 5 },
    { key: "pronunciation", name: "Pronunciacion", maxLevel: 5 },
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-on-surface mb-2">
          Tu progreso
        </h1>
        <p className="text-on-surface-variant">
          Nivel {progress.level} - {totalPoints} puntos totales
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
          { label: "Sesiones completadas", value: totalSessions, icon: Clock, color: "secondary", suffix: "" },
          { label: "Racha actual", value: streakDays, icon: Flame, color: "primary", suffix: " dias" },
          { label: "Puntos totales", value: totalPoints, icon: Target, color: "secondary", suffix: "" },
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
              {progress.current_streak > 0 && (
                <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full">
                  <Flame className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">{progress.current_streak} dias</span>
                </div>
              )}
            </div>

            {/* Weekly Goal Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-on-surface-variant">Meta semanal</span>
                <span className="text-sm font-medium text-on-surface">
                  {Math.min(Math.round((weeklyProgress / weeklyGoal) * 100), 100)}%
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
            {weeklyActivity.length > 0 ? (
              <div className="flex items-end justify-between gap-2 h-32">
                {weeklyActivity.map((day, idx) => {
                  const height = maxDailyActivity > 0 ? (day.sessions / maxDailyActivity) * 100 : 0
                  const isToday = idx === weeklyActivity.length - 1

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center justify-end h-24">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(height, 8)}%` }}
                          transition={{ duration: 0.4, delay: idx * 0.05 }}
                          className={`w-full max-w-8 rounded-t-lg ${
                            day.sessions > 0 
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
                        <p className="text-[10px] text-on-surface-variant">{day.sessions}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-on-surface-variant">
                <p>Completa sesiones de practica para ver tu actividad semanal</p>
              </div>
            )}
          </motion.div>

          {/* Level Progress */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10"
          >
            <h3 className="font-semibold text-on-surface mb-4">Progreso de nivel</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{progress.level}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-on-surface">Nivel {progress.level}</span>
                  <span className="text-sm text-on-surface-variant">{totalPoints} XP</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full"
                    style={{ width: `${Math.min((totalPoints % 100) * 1, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-on-surface-variant mt-2">
                  {100 - (totalPoints % 100)} XP para el siguiente nivel
                </p>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10"
          >
            <h3 className="font-semibold text-on-surface mb-4">Resumen de actividad</h3>
            <div className="space-y-3">
              {[
                { action: `${totalPhrases} frases aprendidas en total`, icon: BookOpen, color: "primary" },
                { action: `${totalSessions} sesiones de practica completadas`, icon: CheckCircle2, color: "secondary" },
                { action: `Racha mas larga: ${progress.longest_streak} dias`, icon: Flame, color: "primary" },
                { action: `${totalPoints} puntos acumulados`, icon: Target, color: "secondary" },
              ].map((item, idx) => {
                const Icon = item.icon
                return (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-surface-container rounded-xl">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      item.color === "primary" ? "bg-primary/10" : "bg-secondary/10"
                    }`}>
                      <Icon className={`w-5 h-5 ${item.color === "primary" ? "text-primary" : "text-secondary"}`} />
                    </div>
                    <p className="text-sm font-medium text-on-surface">{item.action}</p>
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
              Logros desbloqueados ({achievements.filter(a => a.unlocked).length})
            </h3>
            {achievements.filter(a => a.unlocked).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.filter(a => a.unlocked).map((achievement, idx) => {
                  const Icon = ICON_MAP[achievement.icon] || Star
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-gradient-to-br from-surface-container-lowest to-surface-container rounded-2xl p-5 shadow-sm border border-primary/20"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary/20">
                          <Icon className="w-7 h-7 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-on-surface">{achievement.title}</h4>
                            <CheckCircle2 className="w-4 h-4 text-secondary" />
                          </div>
                          <p className="text-sm text-on-surface-variant mt-0.5">{achievement.description}</p>
                          {achievement.unlocked_at && (
                            <p className="text-xs text-primary mt-2 font-medium">
                              {new Date(achievement.unlocked_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-surface-container-lowest rounded-2xl p-8 text-center border border-outline-variant/10">
                <Trophy className="w-12 h-12 text-on-surface-variant mx-auto mb-4 opacity-50" />
                <p className="text-on-surface-variant">Aun no has desbloqueado logros</p>
                <p className="text-sm text-on-surface-variant mt-1">Completa lecciones y practicas para ganar tu primer logro</p>
              </div>
            )}
          </div>

          {/* Locked Achievements */}
          <div>
            <h3 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-on-surface-variant" />
              Proximos logros
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.filter(a => !a.unlocked).map((achievement, idx) => {
                const Icon = ICON_MAP[achievement.icon] || Star
                const progressVal = achievement.progress || 0
                const total = achievement.target || 100
                const percentage = (progressVal / total) * 100

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
                            <span className="text-xs text-on-surface-variant">{progressVal}/{total}</span>
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
              {SKILL_DISPLAY.map((skill, idx) => {
                const skillValue = progress.skills[skill.key as keyof typeof progress.skills] || 0
                const level = Math.min(Math.floor(skillValue / 20) + 1, skill.maxLevel)
                const levelProgress = Math.min(skillValue, 100)

                return (
                  <motion.div
                    key={skill.key}
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
                            {skillValue} puntos de experiencia
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          {[...Array(skill.maxLevel)].map((_, i) => (
                            <Star 
                              key={i}
                              className={`w-4 h-4 ${
                                i < level 
                                  ? "text-yellow-400 fill-yellow-400" 
                                  : "text-surface-container-high"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1">Nivel {level}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-on-surface-variant">Progreso</span>
                        <span className="text-xs font-medium text-primary">{levelProgress}%</span>
                      </div>
                      <div className="w-full bg-surface-container-lowest rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${levelProgress}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                          className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
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
            className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6 border border-primary/10"
          >
            <h3 className="font-semibold text-on-surface mb-3">Tips para mejorar</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-on-surface-variant">
                <span className="text-primary mt-1">1.</span>
                <span>Practica las frases de empatia para mejorar tu habilidad de comprension</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-on-surface-variant">
                <span className="text-primary mt-1">2.</span>
                <span>Completa simulaciones para aumentar tu nivel de resolucion de problemas</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-on-surface-variant">
                <span className="text-primary mt-1">3.</span>
                <span>Usa el modo de escucha activa para mejorar tu pronunciacion</span>
              </li>
            </ul>
          </motion.div>
        </div>
      )}
    </div>
  )
}
