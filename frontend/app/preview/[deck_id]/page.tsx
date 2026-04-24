"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Download,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Square,
  CheckSquare,
} from "lucide-react"
import MinimalNavbar from "@/components/MinimalNavbar"
import CardFlip from "@/components/CardFlip"
import RegisterModal from "@/components/RegisterModal"
import { api } from "@/lib/api"

interface Card {
  front: string
  back: string
  keyword: string
  grammar_note: string
  context_note: string
  colombian_note: string
  timestamp_start: number
  timestamp_end: number
  audio_filename?: string
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

interface Card {
  front: string
  back: string
  keyword: string
  grammar_note: string
  context_note: string
  colombian_note: string
  timestamp_start: number
  timestamp_end: number
  audio_filename?: string
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
  const [currentCard, setCurrentCard] = useState(0)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<"download" | "study" | null>(null)
  const [toast, setToast] = useState("")
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set())

  const isAuthenticated = typeof window !== "undefined" && !!localStorage.getItem("token")

  useEffect(() => {
    async function fetchDeck() {
      try {
        const data = await api.getDeck(deckId)
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

    if (!isAuthenticated) {
      setPendingAction("download")
      setShowRegisterModal(true)
      return
    }

    setDownloading(true)
    try {
      const blob = await api.downloadDeck(deckId)
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

  function handleStudy() {
    if (!isAuthenticated) {
      setPendingAction("study")
      setShowRegisterModal(true)
      return
    }

    // Navigate to study page (to be implemented)
    router.push(`/study/${deckId}`)
  }

  function handleRegisterSuccess() {
    // Show toast
    setToast("Mazo guardado en tu cuenta ✓")
    setTimeout(() => setToast(""), 4000)

    // Execute pending action
    if (pendingAction === "download") {
      handleDownload()
    } else if (pendingAction === "study") {
      router.push(`/study/${deckId}`)
    }
    setPendingAction(null)
  }

  function toggleCardSelection(index: number) {
    setSelectedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  function selectAll() {
    if (deck) {
      setSelectedCards(new Set(deck.cards.map((_, i) => i)))
    }
  }

  function deselectAll() {
    setSelectedCards(new Set())
  }

  function goToPrevCard() {
    if (currentCard > 0) setCurrentCard(currentCard - 1)
  }

  function goToNextCard() {
    if (deck && currentCard < deck.cards.length - 1) setCurrentCard(currentCard + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface">
        <MinimalNavbar logoNotLink />
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
              <ChevronLeft className="w-4 h-4" />
              Volver a generar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!deck) {
    return null
  }

  return (
    <div className="min-h-screen bg-surface">
      <MinimalNavbar logoNotLink />

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-8">
        {/* Video Info */}
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <img
              src={deck.video_thumbnail}
              alt={deck.video_title}
              className="w-32 h-24 object-cover rounded-xl shadow-card"
            />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-on-surface mb-2">{deck.video_title}</h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
                <span className="bg-primary-container/30 text-on-primary-container px-3 py-1 rounded-full text-xs font-semibold">
                  {deck.level}
                </span>
                <span>{deck.total_cards} tarjetas</span>
                <span className="text-outline">•</span>
                <span className="capitalize">{deck.context}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CardFlip Component */}
        {deck.cards.length > 0 && (
          <div className="mb-8">
            <CardFlip
              card={deck.cards[currentCard]}
              index={currentCard}
              total={deck.cards.length}
              isSelected={selectedCards.has(currentCard)}
              onToggleSelection={toggleCardSelection}
              showSelection={selectedCards.size > 0}
            />

            {/* Navigation dots */}
            <div className="flex items-center justify-center gap-1.5 mt-6">
              {deck.cards.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentCard(idx)}
                  title={`Ir a tarjeta ${idx + 1}`}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                    idx === currentCard
                      ? "bg-[#1A56DB] scale-125"
                      : selectedCards.has(idx)
                      ? "bg-primary"
                      : idx < currentCard
                      ? "bg-[#B5D4F4]"
                      : "bg-outline-variant/40"
                  }`}
                />
              ))}
            </div>

            {/* Previous/Next buttons */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                onClick={goToPrevCard}
                disabled={currentCard === 0}
                title="Tarjeta anterior"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  currentCard === 0
                    ? "bg-surface-container-low text-outline cursor-not-allowed"
                    : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-high shadow-sm"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNextCard}
                disabled={currentCard === deck.cards.length - 1}
                title="Tarjeta siguiente"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  currentCard === deck.cards.length - 1
                    ? "bg-surface-container-low text-outline cursor-not-allowed"
                    : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-high shadow-sm"
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Selection Actions */}
        {deck.cards.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <button
              onClick={selectedCards.size === deck.cards.length ? deselectAll : selectAll}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high text-on-surface font-medium text-sm hover:bg-surface-container-highest transition-all"
            >
              {selectedCards.size === deck.cards.length ? (
                <>
                  <CheckSquare className="w-4 h-4" />
                  Deseleccionar todas
                </>
              ) : (
                <>
                  <Square className="w-4 h-4" />
                  Seleccionar todas
                </>
              )}
            </button>
            {selectedCards.size > 0 && (
              <span className="text-sm text-on-surface-variant font-medium">
                {selectedCards.size} seleccionada{selectedCards.size !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-container text-white px-8 py-4 rounded-full font-bold text-base hover:opacity-90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {downloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Descargando...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                {selectedCards.size > 0 ? `Descargar seleccionadas (${selectedCards.size})` : "Descargar mazo"}
              </>
            )}
          </button>

          <button
            onClick={handleStudy}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-surface-container-high text-on-surface px-8 py-4 rounded-full font-bold text-base hover:bg-surface-container-highest transition-all active:scale-[0.98]"
          >
            Estudiar aquí
          </button>

          <button
            onClick={() => router.push("/generate")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-on-surface-variant font-medium px-6 py-4 rounded-full hover:text-primary transition-colors"
          >
            <Plus className="w-4 h-4" />
            Generar otro
          </button>
        </div>
      </div>

      {/* Register Modal */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => {
          setShowRegisterModal(false)
          setPendingAction(null)
        }}
        deckId={deckId}
        onSuccess={handleRegisterSuccess}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-secondary text-white px-6 py-3 rounded-full shadow-elevated flex items-center gap-2 animate-in">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}
    </div>
  )
}
