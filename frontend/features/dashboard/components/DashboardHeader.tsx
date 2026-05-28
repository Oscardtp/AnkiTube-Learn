"use client"

import type { User } from "../types"

interface DashboardHeaderProps {
  user: User | null
  pendingCards?: number
}

export function DashboardHeader({ user, pendingCards = 0 }: DashboardHeaderProps) {
  const displayName = user?.name || user?.email?.split("@")[0] || "Parcero"

  return (
    <header className="mb-6 md:mb-10">
      <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
        Hola, {displayName} 👋
      </h2>
      <p className="text-on-surface-variant font-medium mt-1 text-sm md:text-base">
        {pendingCards > 0
          ? `Tenés ${pendingCards} tarjetas para repasar hoy`
          : "Pegá un link y creá tu mazo con IA"}
      </p>
    </header>
  )
}
