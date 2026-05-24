"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AlertCircle, Loader2 } from "lucide-react"
import {
  PreviewNavbar,
  PreviewHero,
  PreviewVideo,
  PreviewCardCarousel,
  PreviewCTAs,
  PreviewMissing,
  PreviewFeedback,
} from "@/components/PreviewComponents"
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
  const [showFeedback, setShowFeedback] = useState(false)
  const [pendingAction, setPendingAction] = useState<"download" | "study" | null>(null)
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
      
      // Show feedback after 3 seconds
      setTimeout(() => setShowFeedback(true), 3000)
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

    router.push(`/study/${deckId}`)
    // Show feedback after 3 seconds
    setTimeout(() => setShowFeedback(true), 3000)
  }

  function handleRegisterSuccess() {
    // Execute pending action
    if (pendingAction === "download") {
      handleDownload()
    } else if (pendingAction === "study") {
      handleStudy()
    }
    setPendingAction(null)
  }

  function toggleCardSelection(index: number) {
    setSelectedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A56DB]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <PreviewNavbar isAuthenticated={isAuthenticated} onBackClick={() => router.push("/generate")} />
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-[#DC2626]" />
              <h2 className="text-lg font-semibold text-[#DC2626]">Error</h2>
            </div>
            <p className="text-[#991B1B] mb-4">{error}</p>
            <button
              onClick={() => router.push("/generate")}
              className="px-4 py-2 bg-[#1A56DB] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
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
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Navbar */}
      <PreviewNavbar
        isAuthenticated={isAuthenticated}
        onBackClick={() => router.push("/generate")}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-8">
        {/* Hero Section */}
        <PreviewHero
          level={deck.level}
          cardCount={deck.total_cards}
          title={deck.video_title}
          context={deck.context}
          isAuthenticated={isAuthenticated}
        />

        {/* Video Section */}
        <PreviewVideo
          thumbnail={deck.video_thumbnail}
          title={deck.video_title}
          videoId={deck.video_id}
        />

        {/* Card Carousel */}
        <PreviewCardCarousel
          cards={deck.cards}
          currentCardIndex={currentCard}
          onCardChange={setCurrentCard}
          selectedCards={selectedCards}
          onToggleSelection={toggleCardSelection}
        />

        {/* CTAs */}
        <PreviewCTAs
          isAuthenticated={isAuthenticated}
          isDownloading={downloading}
          deckSaved={false}
          onDownload={handleDownload}
          onStudy={handleStudy}
          onGenerateAnother={() => router.push("/generate")}
        />

        {/* Missing Phrase Section */}
        <PreviewMissing deckId={deckId} isAuthenticated={isAuthenticated} />
      </div>

      {/* Feedback Modal */}
      <PreviewFeedback
        deckId={deckId}
        visible={showFeedback}
        onClose={() => setShowFeedback(false)}
      />

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
    </div>
  )
}
