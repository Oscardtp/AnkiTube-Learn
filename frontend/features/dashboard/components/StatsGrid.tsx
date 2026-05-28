"use client"

import MaterialIcon from "@/components/MaterialIcon"
import type { UserStats } from "../types"

interface StatsGridProps {
  stats: UserStats
  generationsToday: number
}

interface StatCardProps {
  icon: string
  label: string
  value: string
  iconBg: string
  iconColor: string
}

function StatCard({ icon, label, value, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-card border border-outline-variant/10 flex items-center gap-5 transition-transform hover:-translate-y-1 duration-300">
      <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center ${iconColor}`}>
        <MaterialIcon name={icon} className="text-2xl" />
      </div>
      <div>
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-on-surface">{value}</p>
      </div>
    </div>
  )
}

export function StatsGrid({ stats, generationsToday }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
      <StatCard
        icon="style"
        label="Tarjetas creadas"
        value={stats.cardsCreated.toLocaleString()}
        iconBg="bg-primary/10"
        iconColor="text-primary"
      />
      <StatCard
        icon="local_fire_department"
        label="Racha de estudio"
        value={`${stats.studyStreak} días`}
        iconBg="bg-secondary/10"
        iconColor="text-secondary"
      />
      <StatCard
        icon="auto_stories"
        label="Mazos generados"
        value={stats.decksGenerated.toString()}
        iconBg="bg-tertiary-fixed"
        iconColor="text-tertiary"
      />
      <StatCard
        icon="bolt"
        label="Generaciones hoy"
        value={generationsToday.toString()}
        iconBg="bg-warning/10"
        iconColor="text-warning"
      />
    </div>
  )
}
