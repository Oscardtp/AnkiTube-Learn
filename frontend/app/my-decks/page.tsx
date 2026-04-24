"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle, Trash2, Download, Eye } from "lucide-react"
import MinimalNavbar from "@/components/MinimalNavbar"
import { api } from "@/lib/api"

interface Deck {
  deck_id: string
  video_title: string
  video_thumbnail: string
  video_id: string
  level: string
  context: string
  total_cards: number
  model_used: string
  created_at: string
}

interface Deck {
  deck_id: string
  video_title: string
  video_thumbnail: string
  video_id: string
  level: string
  context: string
  total_cards: number
  model_used: string
  created_at: string
}

export default function MyDecksPage() {
  const router = useRouter()
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchDecks()
  }, [])

  async function fetchDecks() {
    try {
      try {
        const data = await api.getMyDecks()
        setDecks(data.decks)
      } catch (error: any) {
        if (error.status === 401) {
          localStorage.removeItem("token")
          router.push("/login")
          return
        }
        throw error
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar los mazos"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(deckId: string) {
    if (!confirm("¿Estás seguro de que quieres eliminar este mazo?")) {
      return
    }

    setDeletingId(deckId)
    try {
      await api.deleteDeck(deckId)
      setDecks(decks.filter((d) => d.deck_id !== deckId))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar el mazo"
      alert(errorMessage)
    } finally {
      setDeletingId(null)
    }
  }

  async function handleDownload(deckId: string, videoTitle: string) {
    try {
      const blob = await api.downloadDeck(deckId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `AnkiTube_${videoTitle.slice(0, 30)}.apkg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al descargar"
      alert(errorMessage)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-error-container/30 rounded-xl p-6 border border-error/20">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-error" />
            <h2 className="text-lg font-semibold text-on-error-container">Error</h2>
          </div>
          <p className="text-on-error-container">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <MinimalNavbar />
      <div className="p-6 max-w-4xl mx-auto pt-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-on-surface mb-2">Mis mazos</h1>
          <p className="text-on-surface-variant">
            {decks.length === 0
              ? "Aún no has generado ningún mazo"
              : `${decks.length} mazo${decks.length !== 1 ? "s" : ""} generado${decks.length !== 1 ? "s" : ""}`}
          </p>
        </div>

      {decks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-on-surface-variant mb-4">Genera tu primer mazo para comenzar</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90"
          >
            Ir al dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decks.map((deck) => (
            <div
              key={deck.deck_id}
              className="bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-hidden"
            >
              <div className="flex">
                <img
                  src={deck.video_thumbnail}
                  alt={deck.video_title}
                  className="w-32 h-24 object-cover"
                />
                <div className="flex-1 p-4">
                  <h3 className="font-semibold text-on-surface mb-1 line-clamp-2">
                    {deck.video_title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-2">
                    <span className="bg-primary-container/30 text-on-primary-container px-2 py-0.5 rounded text-xs">
                      {deck.level}
                    </span>
                    <span>{deck.total_cards} tarjetas</span>
                  </div>
                  <p className="text-xs text-outline">
                    {new Date(deck.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex border-t border-outline-variant/20">
                <button
                  onClick={() => router.push(`/preview/${deck.deck_id}`)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Ver
                </button>
                <button
                  onClick={() => handleDownload(deck.deck_id, deck.video_title)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-on-surface hover:bg-surface-container transition-colors border-l border-outline-variant/20"
                >
                  <Download className="w-4 h-4" />
                  Descargar
                </button>
                <button
                  onClick={() => handleDelete(deck.deck_id)}
                  disabled={deletingId === deck.deck_id}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-error hover:bg-error-container/30 transition-colors border-l border-outline-variant/20 disabled:opacity-50"
                >
                  {deletingId === deck.deck_id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
