"use client"

import type { DeckData } from "@/types/preview"

interface DeckHeaderProps {
  deck: DeckData
  isAuthenticated: boolean
  customName?: string
}

const CEFR_COLORS: Record<string, { bg: string; text: string }> = {
  A1: { bg: "bg-surface-container-high", text: "text-on-surface-variant" },
  A2: { bg: "bg-surface-container-high", text: "text-on-surface-variant" },
  B1: { bg: "bg-[#E1F5EE]", text: "text-[#0F6E56]" },
  B2: { bg: "bg-[#E1F5EE]", text: "text-[#0F6E56]" },
  C1: { bg: "bg-[#EEEDFE]", text: "text-[#5B4FCF]" },
  C2: { bg: "bg-[#EEEDFE]", text: "text-[#5B4FCF]" },
}

export default function DeckHeader({ deck, isAuthenticated, customName }: DeckHeaderProps) {
  const colors = CEFR_COLORS[deck.level] || CEFR_COLORS.A1

  return (
    <div className="mb-8">
      <h1 className="text-xl md:text-2xl font-extrabold text-on-surface mb-3 leading-tight">
        {isAuthenticated && customName
          ? `${customName}, tu mazo está listo`
          : deck.video_title}
      </h1>
      <div className="flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
        <span className={`${colors.bg} ${colors.text} px-3 py-1 rounded-full text-xs font-bold`}>
          {deck.level}
        </span>
        <span>{deck.total_cards} tarjetas</span>
        <span className="text-outline">·</span>
        <span className="capitalize">{deck.context}</span>
      </div>
    </div>
  )
}
