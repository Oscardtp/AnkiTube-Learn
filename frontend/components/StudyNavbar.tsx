"use client"

import { useRouter } from "next/navigation"

interface StudyNavbarProps {
  deckTitle: string
  current: number
  total: number
}

export default function StudyNavbar({ deckTitle, current, total }: StudyNavbarProps) {
  const router = useRouter()
  const progress = total > 0 ? (current / total) * 100 : 0

  return (
    <nav className="sticky top-0 z-50 h-12 bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-5 h-full flex items-center justify-between relative">
        {/* Left —Salir */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors text-[13px] font-medium h-[34px] px-2.5 rounded-lg hover:bg-gray-50"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Salir
        </button>

        {/* Center — Deck title (truncated) */}
        <div className="absolute left-1/2 -translate-x-1/2 max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
          <span className="text-[13px] text-gray-500 font-medium">{deckTitle}</span>
        </div>

        {/* Right — Progress */}
        <div className="flex items-center gap-1">
          <span className="text-[12px] text-primary font-semibold">{current}</span>
          <span className="text-[12px] text-gray-500 font-medium"> / {total}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-[3px] bg-gray-200 absolute bottom-0 left-0 right-0 rounded-b-xl overflow-hidden">
        <div
          className="h-full bg-primary transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </nav>
  )
}
