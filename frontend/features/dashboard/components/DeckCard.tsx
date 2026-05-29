"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import MaterialIcon from "@/components/MaterialIcon"
import { useDashboardStore } from "../stores/useDashboardStore"
import { api } from "@/lib/api"
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

  const [downloading, setDownloading] = useState(false)
  const [showDeleteSheet, setShowDeleteSheet] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState("")

  const raw = deck as unknown as Record<string, unknown>
  const pendingCards = (raw.new_cards as number) || 0
  const reviewCards = (raw.review_cards as number) || 0
  const studiedToday = (raw.studied_today as boolean) || false
  const totalPending = pendingCards + reviewCards

  const handleDownload = useCallback(async () => {
    setDownloading(true)
    try {
      const blob = await api.downloadDeck(deck.deck_id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `AnkiTube_${deck.video_title.slice(0, 30)}.apkg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      // error handled silently
    } finally {
      setDownloading(false)
    }
  }, [deck])

  const handleDelete = useCallback(() => {
    setShowDeleteSheet(true)
    setDeleteConfirm("")
  }, [])

  const confirmDelete = useCallback(() => {
    if (deleteConfirm !== deck.video_title) return
    // Soft delete — mark as deleted
    setShowDeleteSheet(false)
    setDeleteConfirm("")
  }, [deleteConfirm, deck.video_title])

  return (
    <div>
      <article
        className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all"
        aria-expanded={isExpanded}
      >
        {/* Main row */}
        <div className="flex gap-2.5 p-3 items-start">
          <div className="w-[52px] h-[36px] rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-800 to-blue-900">
            <img
              src={deck.video_thumbnail}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-900 line-clamp-1">{deck.video_title}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                {deck.level}
              </span>
              <span className="text-[11px] text-gray-400">{getRelativeDate(deck.created_at)}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span
              className={`w-2 h-2 rounded-full ${studiedToday ? "bg-emerald-500" : totalPending > 0 ? "bg-gray-300" : "bg-gray-200"}`}
              title={studiedToday ? "Estudiado hoy" : "Pendiente"}
            />
            <button
              onClick={() => toggleDeck(deck.deck_id)}
              className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Opciones del mazo"
            >
              ⋮
            </button>
          </div>
        </div>

        {/* Expanded actions */}
        {isExpanded && (
          <div className="px-3 pb-3 border-t border-gray-100 pt-2.5 space-y-2">
            {/* Study bar — only if pending cards */}
            {totalPending > 0 && (
              <div className="bg-blue-50 rounded-lg px-3 py-2.5 flex justify-between items-center">
                <span className="text-xs text-blue-800 font-medium">
                  🃏 {totalPending} tarjetas pendientes
                </span>
                <Link
                  href={`/preview/${deck.deck_id}`}
                  className="h-7 px-3 bg-primary text-white rounded-md text-[11px] font-semibold hover:bg-[#1648c2] transition-colors"
                >
                  Estudiar →
                </Link>
              </div>
            )}

            {/* Studied today banner */}
            {studiedToday && totalPending === 0 && (
              <div className="bg-emerald-50 rounded-lg px-3 py-2 text-xs text-emerald-800 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M13 4L6.5 11.5L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Estudiado hoy · {deck.total_cards} tarjetas
              </div>
            )}

            {/* Action grid 2×2 */}
            <div className="grid grid-cols-2 gap-1.5">
              <Link
                href={`/preview/${deck.deck_id}`}
                className="h-[34px] rounded-lg border border-gray-200 bg-white text-gray-700 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors"
              >
                <MaterialIcon name="grid_view" className="text-sm" />
                Ver tarjetas
              </Link>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="h-[34px] rounded-lg border border-gray-200 bg-white text-gray-700 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {downloading ? (
                  <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <MaterialIcon name="download" className="text-sm" />
                )}
                Descargar .apkg
              </button>
              <button
                className="h-[34px] rounded-lg border border-gray-200 bg-white text-gray-700 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors"
              >
                <MaterialIcon name="share" className="text-sm" />
                Compartir
              </button>
              <button
                onClick={handleDelete}
                className="h-[34px] rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-red-100 transition-colors"
              >
                <MaterialIcon name="delete" className="text-sm" />
                Eliminar
              </button>
            </div>
          </div>
        )}
      </article>

      {/* Delete confirmation bottom sheet */}
      {showDeleteSheet && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center" style={{ background: "rgba(0,0,0,.45)" }}>
          <div className="bg-white rounded-t-[14px] w-full max-w-[390px] p-5 pb-6 animate-slide-up">
            <div className="text-[15px] font-medium text-gray-900 mb-2">¿Eliminás este mazo?</div>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-4">
              No hay vuelta atrás, parce. Se borran todas las tarjetas y no se pueden recuperar.
            </p>
            <div className="text-xs text-gray-500 mb-1.5">Escribí el nombre del mazo para confirmar</div>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={deck.video_title}
              className="w-full h-9 border border-gray-200 rounded-lg px-2.5 text-[13px] bg-white text-gray-900 outline-none focus:border-red-400 mb-4"
            />
            <button
              disabled={deleteConfirm !== deck.video_title}
              onClick={confirmDelete}
              className={`w-full h-10 bg-red-500 text-white rounded-[9px] text-sm font-medium transition-opacity ${deleteConfirm === deck.video_title ? "opacity-100" : "opacity-40 cursor-not-allowed"}`}
            >
              Eliminar para siempre
            </button>
            <button
              onClick={() => { setShowDeleteSheet(false); setDeleteConfirm("") }}
              className="w-full h-9 mt-2 border border-gray-200 rounded-lg text-[13px] text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
