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
  const [showDropdown, setShowDropdown] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (!showDropdown) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowDropdown(false)
    }
    document.addEventListener("mousedown", handler)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handler)
      document.removeEventListener("keydown", handleKey)
    }
  }, [showDropdown])

  const handleLogout = useCallback(() => {
    setShowDropdown(false)
    onLogout()
  }, [onLogout])

  const initial = user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"
  const userName = user?.name || user?.email || "Usuario"
  const userPlan: string = "Explorador"

  const planChipClass =
    userPlan === "Fluente"
      ? "bg-blue-50 text-blue-800 border border-blue-200"
      : userPlan === "Nativo"
        ? "bg-purple-50 text-purple-800 border border-purple-200"
        : "bg-emerald-50 text-emerald-800 border border-emerald-200"

  return (
    <nav
      className={`sticky top-0 z-50 h-[56px] bg-white border-b border-gray-200 transition-all duration-200 ${
        scrolled ? "rounded-none" : "rounded-b-xl"
      }`}
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="flex items-center justify-between h-full px-5 max-w-6xl mx-auto">
        {/* Logo — link a /dashboard */}
        <div className="flex items-center gap-2.5">
          <button
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={openMobileDrawer}
            aria-label="Abrir menú"
          >
            <MaterialIcon name="menu" className="text-xl" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-[7px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1.5" fill="white" />
                <rect x="9" y="2" width="5" height="5" rx="1.5" fill="white" opacity=".7" />
                <rect x="2" y="9" width="5" height="5" rx="1.5" fill="white" opacity=".7" />
                <rect x="9" y="9" width="5" height="5" rx="1.5" fill="white" opacity=".4" />
              </svg>
            </div>
            <span className="text-[15px] font-semibold text-primary hidden sm:block">AnkiTube</span>
          </Link>
        </div>

        {/* Nav links — desktop */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/discover"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <MaterialIcon name="explore" className="text-base" />
            <span>Descubrir</span>
          </Link>
        </div>

        {/* CTA — always visible */}
        <button
          onClick={onGenerate}
          className="flex items-center gap-2 h-[34px] px-3.5 bg-primary text-white text-[13px] font-medium rounded-lg hover:bg-[#1648c2] transition-colors"
        >
          <MaterialIcon name="add" className="text-base" />
          <span>Generar mazo</span>
        </button>

        {/* Avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-[13px] font-semibold border-[1.5px] border-gray-200 hover:border-primary transition-colors duration-150 cursor-pointer"
            aria-label="Menú de usuario"
            aria-haspopup="menu"
            aria-expanded={showDropdown}
          >
            {initial}
          </button>

          {showDropdown && (
            <div
              role="menu"
              className="absolute top-[40px] right-0 bg-white border border-gray-200 rounded-[10px] py-1.5 min-w-[180px] shadow-[0_4px_16px_rgba(0,0,0,.08)] z-[60] animate-dropdown-in"
            >
              <div className="px-3 py-2 mb-1">
                <p className="text-[11px] text-gray-400 font-medium">
                  {userName} ·{" "}
                  <span className={`inline-flex items-center h-5 px-2 rounded-full text-[11px] font-medium ${planChipClass}`}>
                    {userPlan}
                  </span>
                </p>
              </div>
              <div className="h-px bg-gray-200 mx-1.5 mb-1" />
              <Link
                href="/profile"
                role="menuitem"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2 px-2.5 mx-1.5 py-2 rounded-md text-[13px] text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M2.5 13c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                Mi perfil
              </Link>
              <div className="h-px bg-gray-200 mx-1.5 my-1" />
              <button
                role="menuitem"
                onClick={handleLogout}
                className="flex items-center gap-2 px-2.5 mx-1.5 py-2 rounded-md text-[13px] text-red-600 hover:bg-red-50 transition-colors w-full"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
