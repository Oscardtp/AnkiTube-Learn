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

const LEVEL_BADGE: Record<string, { bg: string; text: string }> = {
  A1: { bg: "bg-emerald-50", text: "text-emerald-800" },
  A2: { bg: "bg-gray-100", text: "text-gray-700" },
  B1: { bg: "bg-emerald-50", text: "text-emerald-800" },
  B2: { bg: "bg-blue-50", text: "text-blue-800" },
  C1: { bg: "bg-purple-50", text: "text-purple-800" },
  C2: { bg: "bg-amber-50", text: "text-amber-800" },
}

export function DeckCard({ deck }: DeckCardProps) {
  const { expandedDeckId, toggleDeck } = useDashboardStore()
  const isExpanded = expandedDeckId === deck.deck_id
  const badge = LEVEL_BADGE[deck.level] || LEVEL_BADGE.B1

  return (
    <article
      className="bg-white dark:bg-slate-800/50 rounded-2xl border border-outline-variant/20 overflow-hidden transition-all hover:border-primary/30 hover:shadow-sm"
      aria-expanded={isExpanded}
    >
      <button
        onClick={() => toggleDeck(deck.deck_id)}
        className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-surface-container-low/50 transition-colors"
        aria-label={`${deck.video_title}, nivel ${deck.level}, ${getRelativeDate(deck.created_at)}`}
      >
        <div className="w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-800 to-blue-900">
          <img
            src={deck.video_thumbnail}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-on-surface line-clamp-1">{deck.video_title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
              {deck.level}
            </span>
            <span className="text-[11px] text-on-surface-variant">{getRelativeDate(deck.created_at)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-gray-300" title="Pendiente" />
          <MaterialIcon
            name={isExpanded ? "expand_less" : "expand_more"}
            className="text-on-surface-variant text-xl"
          />
        </div>
      </button>

      {isExpanded && (
        <div className="px-3.5 pb-3.5 border-t border-outline-variant/10 pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant">
              {deck.total_cards} tarjetas · {deck.model_used}
            </span>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/preview/${deck.deck_id}`}
              className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-white py-2.5 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all active:scale-[0.98]"
            >
              <MaterialIcon name="school" className="text-base" />
              Estudiar
            </Link>
            <button
              className="px-4 py-2.5 border border-outline-variant/30 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-[0.98]"
              title="Exportar a Anki"
            >
              ANKI
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/preview/${deck.deck_id}`}
              className="flex items-center justify-center gap-1.5 bg-surface-container-high text-on-surface py-2 rounded-lg text-[11px] font-medium hover:bg-surface-container-highest transition-colors"
            >
              <MaterialIcon name="grid_view" className="text-sm" />
              Ver tarjetas
            </Link>
            <button className="flex items-center justify-center gap-1.5 bg-surface-container-high text-on-surface py-2 rounded-lg text-[11px] font-medium hover:bg-surface-container-highest transition-colors">
              <MaterialIcon name="download" className="text-sm" />
              Descargar
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
