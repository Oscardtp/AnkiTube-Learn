"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import MaterialIcon from "@/components/MaterialIcon"
import { useDashboardStore } from "../stores/useDashboardStore"
import type { User } from "../types"

interface DashboardNavbarProps {
  user: User | null
  onLogout: () => void
  onGenerate: () => void
}

export function DashboardNavbar({ user, onLogout, onGenerate }: DashboardNavbarProps) {
  const { openMobileDrawer } = useDashboardStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    if (showUserMenu) {
      document.addEventListener("mousedown", handler)
      return () => document.removeEventListener("mousedown", handler)
    }
  }, [showUserMenu])

  const handleLogout = useCallback(() => {
    setShowUserMenu(false)
    onLogout()
  }, [onLogout])

  const initial = user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"

  return (
    <nav
      className="sticky top-0 z-40 h-14 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-outline-variant/15"
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="flex items-center justify-between h-full px-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-surface-container-high transition-colors"
            onClick={openMobileDrawer}
            aria-label="Abrir menú"
          >
            <MaterialIcon name="menu" className="text-xl" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1.5" fill="white" />
                <rect x="9" y="2" width="5" height="5" rx="1.5" fill="white" opacity=".7" />
                <rect x="2" y="9" width="5" height="5" rx="1.5" fill="white" opacity=".7" />
                <rect x="9" y="9" width="5" height="5" rx="1.5" fill="white" opacity=".4" />
              </svg>
            </div>
            <span className="text-sm font-bold text-primary hidden sm:block">AnkiTube</span>
          </Link>
        </div>

        <button
          onClick={onGenerate}
          className="hidden md:flex items-center gap-2 h-9 px-4 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
        >
          <MaterialIcon name="add" className="text-base" />
          <span>+ Generar mazo</span>
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow-sm hover:ring-2 hover:ring-primary/20 transition-all"
            aria-label="Menú de usuario"
            aria-haspopup="menu"
            aria-expanded={showUserMenu}
          >
            {initial}
          </button>

          {showUserMenu && (
            <div
              role="menu"
              className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-outline-variant/20 py-1.5 z-50 min-w-[180px]"
            >
              <div className="px-4 py-2 border-b border-outline-variant/10">
                <p className="text-xs font-medium text-on-surface-variant truncate">
                  {user?.name || user?.email}
                </p>
              </div>
              <Link
                href="/settings"
                role="menuitem"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                <MaterialIcon name="person" className="text-base" />
                <span>Mi perfil</span>
              </Link>
              <button
                role="menuitem"
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors w-full text-left"
              >
                <MaterialIcon name="logout" className="text-base" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
