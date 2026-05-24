"use client"

import { ChevronLeft } from "lucide-react"
import { useState } from "react"

interface PreviewNavbarProps {
  isAuthenticated: boolean
  userName?: string
  onBackClick: () => void
}

export default function PreviewNavbar({
  isAuthenticated,
  userName,
  onBackClick,
}: PreviewNavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <nav className="h-[52px] bg-white border-b border-[#E5E7EB] flex items-center px-4 relative">
      {/* Back Button */}
      <button
        onClick={onBackClick}
        className="flex items-center gap-1 text-[#6B7280] text-sm font-medium hover:text-[#374151] transition-colors"
        title="Volver a generar"
      >
        <ChevronLeft className="w-[13px] h-[13px]" />
        <span>Generar otro</span>
      </button>

      {/* Centered Logo */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1.5">
        <div className="w-5 h-5 bg-[#1A56DB] rounded-[5px] flex items-center justify-center flex-shrink-0">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1.5" fill="white" />
            <rect x="9" y="2" width="5" height="5" rx="1.5" fill="white" opacity=".7" />
            <rect x="2" y="9" width="5" height="5" rx="1.5" fill="white" opacity=".7" />
            <rect x="9" y="9" width="5" height="5" rx="1.5" fill="white" opacity=".4" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-[#9CA3AF]">AnkiTube</span>
      </div>

      {/* Right: Avatar + Dropdown (only if authenticated) */}
      {isAuthenticated && (
        <div className="ml-auto relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-7 h-7 bg-[#1A56DB] text-white rounded-full flex items-center justify-center text-xs font-semibold hover:bg-[#1648c2] transition-colors"
            title="Menú usuario"
          >
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-[140px] bg-white border border-[#E5E7EB] rounded-[9px] shadow-lg z-20 overflow-hidden">
              <button className="w-full h-[33px] flex items-center gap-2 px-2 text-xs text-[#374151] hover:bg-[#F9FAFB] transition-colors">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <rect x="8.5" y="2" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <rect x="2" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                </svg>
                Mis mazos
              </button>
              <div className="h-[1px] bg-[#E5E7EB] my-0.5" />
              <button className="w-full h-[33px] flex items-center gap-2 px-2 text-xs text-[#DC2626] hover:bg-[#FEF2F2] transition-colors">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
