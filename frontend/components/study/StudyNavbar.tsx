"use client"

import { useRouter } from "next/navigation"

interface StudyNavbarProps {
  deckTitle: string
  current: number
  total: number
  skillLabel?: string
}

export default function StudyNavbar({ deckTitle, current, total, skillLabel }: StudyNavbarProps) {
  const router = useRouter()
  const progress = total > 0 ? (current / total) * 100 : 0

  return (
    <nav aria-label="Progreso de estudio" className="sticky top-0 z-50 h-12 bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-5 h-full flex items-center justify-between relative">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors text-[13px] font-medium h-[44px] px-3 rounded-lg hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Salir
        </button>

        <div className="flex-1 min-w-0 mx-3">
          <span className="text-[13px] text-gray-500 font-medium block truncate">{deckTitle}</span>
          {skillLabel && (
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
              {skillLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[12px] text-primary font-semibold">{current}</span>
          <span className="text-[12px] text-gray-500 font-medium"> / {total}</span>
        </div>
      </div>

      <div
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progreso: ${current} de ${total} tarjetas`}
        className="h-[3px] bg-gray-200 absolute bottom-0 left-0 right-0 rounded-b-xl overflow-hidden"
      >
        <div
          className="h-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </nav>
  )
}
