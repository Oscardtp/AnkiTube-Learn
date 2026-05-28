"use client"

import { UserMenu } from "./UserMenu"
import type { User } from "../types"

interface DashboardHeaderProps {
  user: User | null
  onLogout: () => void
}

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  const displayName = user?.name || user?.email?.split("@")[0] || "Usuario"

  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-12">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
          ¡Hola de nuevo, {displayName}!
        </h2>
        <p className="text-on-surface-variant font-medium mt-1 text-sm md:text-base">
          ¿Listo para otro video? Tu progreso hoy va volando.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-on-surface">{user?.email || "Usuario"}</p>
          <p className="text-xs text-on-surface-variant">{user?.role || "Estudiante"}</p>
        </div>
        {user && <UserMenu user={user} onLogout={onLogout} />}
      </div>
    </header>
  )
}
