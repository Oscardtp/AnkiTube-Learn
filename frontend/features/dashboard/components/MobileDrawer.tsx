"use client"

import { useEffect, useCallback } from "react"
import Link from "next/link"
import MaterialIcon from "@/components/MaterialIcon"
import { useDashboardStore } from "../stores/useDashboardStore"

interface MobileDrawerProps {
  onLogout: () => void
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/discover", label: "Descubrir", icon: "explore" },
  { href: "/my-flashcards", label: "Biblioteca", icon: "library_books" },
  { href: "/profile", label: "Mi perfil", icon: "person" },
]

export function MobileDrawer({ onLogout }: MobileDrawerProps) {
  const { showMobileDrawer, closeMobileDrawer } = useDashboardStore()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileDrawer()
    },
    [closeMobileDrawer]
  )

  useEffect(() => {
    if (showMobileDrawer) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
      return () => {
        document.removeEventListener("keydown", handleKeyDown)
        document.body.style.overflow = ""
      }
    }
  }, [showMobileDrawer, handleKeyDown])

  if (!showMobileDrawer) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
        onClick={closeMobileDrawer}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-background-dark shadow-2xl md:hidden flex flex-col animate-in slide-in-from-left duration-200"
      >
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/15">
          <Link href="/" className="flex items-center gap-2.5" onClick={closeMobileDrawer}>
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1.5" fill="white" />
                <rect x="9" y="2" width="5" height="5" rx="1.5" fill="white" opacity=".7" />
                <rect x="2" y="9" width="5" height="5" rx="1.5" fill="white" opacity=".7" />
                <rect x="9" y="9" width="5" height="5" rx="1.5" fill="white" opacity=".4" />
              </svg>
            </div>
            <span className="text-base font-bold text-primary">AnkiTube</span>
          </Link>
          <button
            onClick={closeMobileDrawer}
            className="p-2 -mr-2 rounded-lg hover:bg-surface-container-high transition-colors"
            aria-label="Cerrar menú"
          >
            <MaterialIcon name="close" className="text-xl" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1" role="navigation" aria-label="Menú lateral">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileDrawer}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
            >
              <MaterialIcon name={item.icon} className="text-xl" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-outline-variant/15">
          <button
            onClick={() => { closeMobileDrawer(); onLogout() }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:text-error hover:bg-error/5 transition-colors w-full text-left"
          >
            <MaterialIcon name="logout" className="text-xl" />
            <span className="text-sm font-medium">Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}
