"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, User } from "lucide-react"
import { useEffect, useState } from "react"

interface PreviewNavbarProps {
  isAuthenticated: boolean
  customName?: string
}

export default function PreviewNavbar({ isAuthenticated, customName }: PreviewNavbarProps) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    if (!showMenu) return
    function handleClick() {
      setShowMenu(false)
    }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [showMenu])

  return (
    <nav className="sticky top-0 z-40 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/30">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <button
          onClick={() => router.push("/generate")}
          className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface transition-colors text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Generar otro
        </button>

        <span className="text-base font-bold text-on-surface tracking-tight">
          AnkiTube
        </span>

        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="w-8 h-8 rounded-full bg-primary-container/30 flex items-center justify-center text-primary font-bold text-sm hover:bg-primary-container/50 transition-colors"
              aria-label="Menú de perfil"
            >
              {customName ? customName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-lowest rounded-xl shadow-elevated border border-outline-variant/20 py-1 z-50">
                <div className="px-4 py-2 border-b border-outline-variant/20">
                  <p className="text-xs text-on-surface-variant">Conectado como</p>
                  <p className="text-sm font-medium text-on-surface truncate">{customName || "Usuario"}</p>
                </div>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => router.push("/my-decks")}
                  className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  Mis decks
                </button>
                <button
                  onClick={() => router.push("/settings")}
                  className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  Configuración
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-8" />
        )}
      </div>
    </nav>
  )
}
