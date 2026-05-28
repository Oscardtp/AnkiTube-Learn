"use client"

import Link from "next/link"
import MaterialIcon from "@/components/MaterialIcon"
import { useDashboardStore } from "../stores/useDashboardStore"
import type { Deck } from "../types"

interface DeckCardProps {
  deck: Deck
}

function getRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Hoy"
  if (diffDays === 1) return "Ayer"
  if (diffDays < 7) return `Hace ${diffDays} días`
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "short" })
}

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  A1: { bg: "bg-green-100", text: "text-green-800" },
  A2: { bg: "bg-gray-100", text: "text-gray-700" },
  B1: { bg: "bg-emerald-50", text: "text-emerald-800" },
  B2: { bg: "bg-blue-50", text: "text-blue-800" },
  C1: { bg: "bg-purple-50", text: "text-purple-800" },
  C2: { bg: "bg-amber-50", text: "text-amber-800" },
}

export function DeckCard({ deck }: DeckCardProps) {
  const { expandedDeckId, toggleDeck } = useDashboardStore()
  const isExpanded = expandedDeckId === deck.deck_id
  const colors = LEVEL_COLORS[deck.level] || LEVEL_COLORS.B1

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-hidden transition-all hover:shadow-card">
      <button
        onClick={() => toggleDeck(deck.deck_id)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-surface-container-low transition-colors"
      >
        <div className="w-12 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-800 to-blue-900">
          <img
            src={deck.video_thumbnail}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-on-surface truncate">{deck.video_title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
              {deck.level}
            </span>
            <span className="text-[11px] text-on-surface-variant">{getRelativeDate(deck.created_at)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-gray-300" />
          <MaterialIcon
            name={isExpanded ? "expand_less" : "expand_more"}
            className="text-on-surface-variant text-xl"
          />
        </div>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 border-t border-outline-variant/10">
          <div className="flex items-center justify-between py-3">
            <span className="text-xs text-on-surface-variant">
              {deck.total_cards} tarjetas · {deck.model_used}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/preview/${deck.deck_id}`}
              className="flex items-center justify-center gap-1.5 bg-primary text-white py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-all active:scale-95"
            >
              <MaterialIcon name="play_arrow" filled className="text-sm" />
              Ver mazo
            </Link>
            <button className="flex items-center justify-center gap-1.5 bg-surface-container-high text-on-surface py-2 rounded-lg text-xs font-bold hover:bg-surface-container-highest transition-all active:scale-95">
              <MaterialIcon name="download" className="text-sm" />
              Exportar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
