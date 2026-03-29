"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Download, Loader2, AlertCircle } from "lucide-react"

interface Card {
  front: string
  back: string
  keyword: string
  grammar_note: string
  context_note: string
  colombian_note: string
  timestamp_start: number
  timestamp_end: number
  card_type: string
}

interface DeckData {
  deck_id: string
  video_id: string
  video_title: string
  video_thumbnail: string
  level: string
  context: string
  cards: Card[]
  model_used: string
  total_cards: number
}

export default function PreviewPage() {
  const params = useParams()
  const router = useRouter()
  const deckId = params.deck_id as string

  const [deck, setDeck] = useState<DeckData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    async function fetchDeck() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
        const res = await fetch(`${apiUrl}/api/decks/${deckId}`)

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.detail || "No pudimos cargar el mazo")
        }

        const data = await res.json()
        setDeck(data)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Algo salió mal"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (deckId) {
      fetchDeck()
    }
  }, [deckId])

  async function handleDownload() {
    if (!deck) return

    setDownloading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
      const res = await fetch(`${apiUrl}/api/decks/${deckId}/download`)

      if (!res.ok) {
        throw new Error("Error al descargar el archivo")
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `AnkiTube_${deck.video_title.slice(0, 30)}.apkg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al descargar"
      setError(errorMessage)
    } finally {
      setDownloading(false)
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
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-error-container/30 rounded-xl p-6 border border-error/20">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-error" />
            <h2 className="text-lg font-semibold text-on-error-container">Error</h2>
          </div>
          <p className="text-on-error-container mb-4">{error}</p>
          <button
            onClick={() => router.push("/generate")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a generar
          </button>
        </div>
      </div>
    )
  }

  if (!deck) {
    return null
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/generate")}
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Generar otro mazo
        </button>

        <div className="flex items-start gap-4">
          <img
            src={deck.video_thumbnail}
            alt={deck.video_title}
            className="w-32 h-24 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-on-surface mb-1">{deck.video_title}</h1>
            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
              <span className="bg-primary-container/30 text-on-primary-container px-2 py-1 rounded">
                {deck.level}
              </span>
              <span>{deck.total_cards} tarjetas</span>
              <span className="text-outline">•</span>
              <span>{deck.context}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Download button */}
      <div className="mb-6">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {downloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Descargando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Descargar mazo Anki (.apkg)
            </>
          )}
        </button>
      </div>

      {/* Cards preview */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-on-surface">Vista previa de tarjetas</h2>

        {deck.cards.map((card, index) => (
          <div
            key={index}
            className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/20"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-primary bg-primary-container/30 px-2 py-1 rounded">
                {card.card_type}
              </span>
              <span className="text-xs text-outline">
                {Math.floor(card.timestamp_start / 60)}:{String(Math.floor(card.timestamp_start % 60)).padStart(2, "0")} - {Math.floor(card.timestamp_end / 60)}:{String(Math.floor(card.timestamp_end % 60)).padStart(2, "0")}
              </span>
            </div>

            <div className="mb-3">
              <p className="text-sm font-medium text-on-surface mb-1">Frente:</p>
              <p className="text-on-surface">{card.front}</p>
            </div>

            <div className="mb-3">
              <p className="text-sm font-medium text-on-surface mb-1">Atrás:</p>
              <p className="text-on-surface">{card.back}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="font-medium text-on-surface-variant mb-1">Palabra clave:</p>
                <p className="text-on-surface">{card.keyword}</p>
              </div>
              <div>
                <p className="font-medium text-on-surface-variant mb-1">Nota colombiana:</p>
                <p className="text-on-surface">{card.colombian_note}</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-outline-variant/20">
              <p className="text-xs text-on-surface-variant">
                <span className="font-medium">Gramática:</span> {card.grammar_note}
              </p>
              <p className="text-xs text-on-surface-variant mt-1">
                <span className="font-medium">Contexto:</span> {card.context_note}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
