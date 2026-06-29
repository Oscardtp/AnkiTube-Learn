"use client"

import type { DeckData } from "@/types/preview"
import { Sparkles, Clock } from "lucide-react"

interface DeckHeaderProps {
  deck: DeckData
  isAuthenticated: boolean
  customName?: string
  createdAt?: string
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return ""
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "ahora mismo"
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `hace ${days}d`
}

export default function DeckHeader({ deck, isAuthenticated, customName, createdAt }: DeckHeaderProps) {
  return (
    <div className="mb-6">
      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#E6F1FB] text-[#0C447C]">
          {deck.level}
        </span>
        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
          {deck.total_cards} tarjetas
        </span>
        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#EAF3DE] text-[#27500A] flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {deck.model_used || "Gemini Flash"}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-1.5">
        {isAuthenticated && customName
          ? `${customName}, tu mazo está listo`
          : deck.video_title}
      </h1>

      {/* Subtitle */}
      <div className="flex items-center gap-2 text-[13px] text-gray-400">
        {createdAt && (
          <>
            <Clock className="w-3 h-3" />
            <span>Generado {timeAgo(createdAt)}</span>
            <span className="w-[3px] h-[3px] bg-gray-300 rounded-full" />
          </>
        )}
        <span className="capitalize">{deck.context}</span>
      </div>
    </div>
  )
}
