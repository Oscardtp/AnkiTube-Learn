"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"

interface PreviewNavbarProps {
  isAuthenticated: boolean
  customName?: string
}

export default function PreviewNavbar({ isAuthenticated, customName }: PreviewNavbarProps) {
  const router = useRouter()
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

  function handleLogout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setShowDropdown(false)
    router.push("/")
  }

  const initial = customName?.charAt(0).toUpperCase() || "U"

  return (
    <nav
      className={`sticky top-0 z-50 h-[56px] bg-white border-b border-gray-200 transition-all duration-200 ${
        scrolled ? "rounded-none" : "rounded-b-xl"
      }`}
    >
      <div className="max-w-4xl mx-auto px-5 h-full flex items-center justify-between">
        {/* Left — Back button */}
        <button
          onClick={() => isAuthenticated ? router.push("/dashboard") : router.push("/")}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors text-[13px] font-medium h-[34px] px-2.5 rounded-lg hover:bg-gray-50"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Generar otro
        </button>

        {/* Center — Logo (no link, muted) */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          <div className="w-[22px] h-[22px] bg-primary rounded-[5px] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="5" rx="1.5" fill="white" />
              <rect x="9" y="2" width="5" height="5" rx="1.5" fill="white" opacity=".7" />
              <rect x="2" y="9" width="5" height="5" rx="1.5" fill="white" opacity=".7" />
              <rect x="9" y="9" width="5" height="5" rx="1.5" fill="white" opacity=".4" />
            </svg>
          </div>
          <span className="text-[13px] font-semibold text-gray-400">AnkiTube</span>
        </div>

        {/* Right — Avatar (authenticated only) */}
        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-[11px] font-semibold border-[1.5px] border-gray-200 hover:border-primary transition-colors duration-150 cursor-pointer"
              aria-label="Menú de perfil"
              aria-haspopup="menu"
              aria-expanded={showDropdown}
            >
              {initial}
            </button>

            {showDropdown && (
              <div
                role="menu"
                className="absolute top-[36px] right-0 bg-white border border-gray-200 rounded-[10px] py-1.5 min-w-[160px] shadow-[0_4px_16px_rgba(0,0,0,.08)] z-[60] animate-dropdown-in"
              >
                <button
                  role="menuitem"
                  onClick={() => { setShowDropdown(false); router.push("/dashboard") }}
                  className="flex items-center gap-2 px-2.5 mx-1.5 py-2 rounded-md text-[13px] text-gray-600 hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="2" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="8.5" y="2" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="2" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                  Mis mazos
                </button>
                <div className="h-px bg-gray-200 mx-1.5 my-1" />
                <button
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-2.5 mx-1.5 py-2 rounded-md text-[13px] text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-7" />
        )}
      </div>
    </nav>
  )
}
