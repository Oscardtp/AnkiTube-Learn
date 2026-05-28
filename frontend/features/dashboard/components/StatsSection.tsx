"use client"

import MaterialIcon from "@/components/MaterialIcon"
import type { UserStats } from "../types"

interface StatsSectionProps {
  stats: UserStats
}

interface StatCardProps {
  icon: string
  label: string
  value: string
  subtitle: string
  trend?: { text: string; positive: boolean }
  bars?: number
}

function StatCard({ icon, label, value, subtitle, trend, bars }: StatCardProps) {
  return (
    <div
      className="bg-white dark:bg-slate-800/30 p-5 rounded-2xl border border-outline-variant/20 shadow-sm"
      role="region"
      aria-label={label}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-highlight/10 flex items-center justify-center">
          <MaterialIcon name={icon} className="text-highlight text-xl" />
        </div>
        <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-black text-on-surface leading-tight">{value}</p>
      <p className="text-xs text-on-surface-variant font-medium mt-0.5">{subtitle}</p>
      {trend && (
        <p className={`text-xs font-semibold mt-1 ${trend.positive ? "text-highlight" : "text-error"}`}>
          {trend.positive ? "↑" : "↓"} {trend.text}
        </p>
      )}
      {bars !== undefined && (
        <div className="mt-3 flex gap-1" aria-label={`${bars} de 7 días completados`}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i < bars ? "bg-highlight" : "bg-surface-container-high"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 md:mb-12" aria-label="Estadísticas de progreso">
      <StatCard
        icon="local_fire_department"
        label="Racha"
        value={`${stats.studyStreak} días`}
        subtitle={stats.studyStreak > 0 ? "¡Sigue así! 🔥" : "Empezá hoy tu racha"}
        bars={stats.studyStreak}
      />
      <StatCard
        icon="style"
        label="Progreso"
        value={stats.cardsCreated.toLocaleString()}
        subtitle="Tarjetas creadas"
      />
      <StatCard
        icon="timer"
        label="Tiempo"
        value={stats.totalStudyMinutes >= 60 ? `${(stats.totalStudyMinutes / 60).toFixed(1)}h` : `${stats.totalStudyMinutes}m`}
        subtitle="Esta semana"
      />
    </section>
  )
}
