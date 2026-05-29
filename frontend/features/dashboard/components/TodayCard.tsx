"use client"

import Link from "next/link"
import type { Deck } from "../types"

interface TodayCardProps {
  deck: Deck | null
  pendingNew: number
  pendingReview: number
  onSeeAll?: () => void
}

export function TodayCard({ deck, pendingNew, pendingReview, onSeeAll }: TodayCardProps) {
  if (!deck) return null

  const totalPending = pendingNew + pendingReview
  if (totalPending === 0) return null

  const maxBar = Math.max(pendingNew, pendingReview, 1)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3.5">
      <div className="flex justify-between items-start mb-2.5">
        <div>
          <div className="text-[13px] font-semibold text-gray-900">Para estudiar hoy</div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            {deck.video_title.length > 35 ? deck.video_title.slice(0, 35) + "…" : deck.video_title} · {totalPending} pendientes
          </div>
        </div>
        <Link
          href={`/preview/${deck.deck_id}`}
          className="h-9 px-3.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-[#1648c2] transition-colors whitespace-nowrap"
        >
          Estudiar →
        </Link>
      </div>

      <div className="space-y-[7px]">
        {/* Nuevas */}
        <div className="flex items-center gap-[7px] text-[11px] text-gray-500">
          <span className="w-[50px] flex-shrink-0">Nuevas</span>
          <div className="flex-1 h-[5px] bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-400"
              style={{ width: `${(pendingNew / maxBar) * 100}%` }}
            />
          </div>
          <span className="w-4 text-right">{pendingNew}</span>
        </div>

        {/* Repaso */}
        <div className="flex items-center gap-[7px] text-[11px] text-gray-500">
          <span className="w-[50px] flex-shrink-0">Repaso</span>
          <div className="flex-1 h-[5px] bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-400"
              style={{ width: `${(pendingReview / maxBar) * 100}%`, background: "#0F6E56" }}
            />
          </div>
          <span className="w-4 text-right">{pendingReview}</span>
        </div>

        {/* Completadas */}
        <div className="flex items-center gap-[7px] text-[11px] text-gray-500">
          <span className="w-[50px] flex-shrink-0">Completadas</span>
          <div className="flex-1 h-[5px] bg-gray-100 rounded-full overflow-hidden" />
          <span className="w-4 text-right text-gray-300">0</span>
        </div>
      </div>

      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="w-full mt-3 h-8 border border-gray-200 rounded-lg text-xs text-gray-500 font-medium hover:bg-gray-50 transition-colors"
        >
          Ver todos los pendientes
        </button>
      )}
    </div>
  )
}
