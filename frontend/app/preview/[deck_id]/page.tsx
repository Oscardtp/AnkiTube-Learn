"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, AlertCircle, ChevronLeft, CheckCircle2, MessageCircle } from "lucide-react"
import PreviewNavbar from "@/components/PreviewNavbar"
import DeckHeader from "@/components/DeckHeader"
import VideoEmbed from "@/components/VideoEmbed"
import CardList from "@/components/CardList"
import CardCarousel from "@/components/CardCarousel"
import ActionButtons from "@/components/ActionButtons"
import MissingPhraseWidget from "@/components/MissingPhraseWidget"
import FeedbackBanner from "@/components/FeedbackBanner"
import RegisterModal from "@/components/RegisterModal"
import { useDeck } from "@/hooks/useDeck"
import { useFeedbackTrigger } from "@/hooks/useFeedbackTrigger"
import { api } from "@/lib/api"

const AUDIO_BASE_URL = process.env.NEXT_PUBLIC_AUDIO_URL || "http://localhost:8000/audio"

export default function PreviewPage() {
  const params = useParams()
  const router = useRouter()
  const deckId = (params?.deck_id as string) ?? ""

  const { data: deck, isLoading, error } = useDeck(deckId)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [customName, setCustomName] = useState<string | undefined>()
  const [createdAt, setCreatedAt] = useState<string | undefined>()
  const [downloading, setDownloading] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<"download" | "study" | null>(null)
  const [toast, setToast] = useState("")
  const [excludedCards, setExcludedCards] = useState<string[]>([])
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackStep, setFeedbackStep] = useState<"emoji" | "details" | "done">("emoji")
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)

  const feedback = useFeedbackTrigger({ triggerDelayMs: 3000, autoDismissMs: 8000 })

  const toggleCardExclusion = useCallback((cardFront: string) => {
    setExcludedCards((prev) =>
      prev.includes(cardFront)
        ? prev.filter((f) => f !== cardFront)
        : [...prev, cardFront]
    )
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsAuthenticated(!!token)
    if (token) {
      api.getCurrentUser().then((user) => {
        setCustomName(user.custom_name)
      }).catch(() => {})
    }
  }, [])

  // Get created_at from deck response
  useEffect(() => {
    if (deck?.created_at) {
      setCreatedAt(deck.created_at)
    }
  }, [deck])

  const handleDownload = useCallback(async () => {
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

      feedback.trigger()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al descargar"
      setToast(msg)
      setTimeout(() => setToast(""), 4000)
    } finally {
      setDownloading(false)
    }
  }, [deck, deckId, isAuthenticated, feedback])

  const handleStudy = useCallback(() => {
    if (!isAuthenticated) {
      setPendingAction("study")
      setShowRegisterModal(true)
      return
    }
    router.push(`/study/${deckId}`)
  }, [isAuthenticated, deckId, router])

  const handleBookmark = useCallback(() => {
    if (!isAuthenticated) {
      setPendingAction(null)
      setShowRegisterModal(true)
      return
    }
    setIsBookmarked((prev) => !prev)
    setToast(isBookmarked ? "Eliminado de Mis mazos" : "Guardado en Mis mazos")
    setTimeout(() => setToast(""), 3000)
  }, [isAuthenticated, isBookmarked])

  const handleRegisterSuccess = useCallback(() => {
    setToast("Mazo guardado en tu cuenta ✓")
    setTimeout(() => setToast(""), 4000)
    setIsAuthenticated(true)

    if (pendingAction === "download") {
      handleDownload()
    } else if (pendingAction === "study") {
      router.push(`/study/${deckId}`)
    }
    setPendingAction(null)
  }, [pendingAction, handleDownload, router, deckId])

  const handleFeedbackEmoji = useCallback((emoji: string) => {
    setSelectedEmoji(emoji)
    if (emoji === "🔥") {
      setFeedbackStep("done")
      setTimeout(() => setShowFeedback(false), 2500)
    } else {
      setFeedbackStep("details")
    }
    api.submitFeedback({
      type: "post_download",
      deck_id: deckId,
      comment: emoji,
    }).catch(() => {})
  }, [deckId])

  const handleFeedbackDetail = useCallback((detail: string) => {
    api.submitFeedback({
      type: "post_download",
      deck_id: deckId,
      comment: `${selectedEmoji} - ${detail}`,
    }).catch(() => {})
    setFeedbackStep("done")
    setTimeout(() => setShowFeedback(false), 2000)
  }, [deckId, selectedEmoji])

  const handleDismissFeedback = useCallback(() => {
    setShowFeedback(false)
    setFeedbackStep("emoji")
    setSelectedEmoji(null)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <PreviewNavbar isAuthenticated={false} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#1A56DB]" />
        </div>
      </div>
    )
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen bg-white">
        <PreviewNavbar isAuthenticated={isAuthenticated} customName={customName} />
        <div className="p-6 max-w-3xl mx-auto">
          <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h2 className="text-lg font-semibold text-red-900">Error</h2>
            </div>
            <p className="text-red-700 mb-4">
              {error?.message || "No se pudo cargar el mazo"}
            </p>
            <button
              onClick={() => isAuthenticated ? router.push("/dashboard") : router.push("/")}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A56DB] text-white rounded-xl hover:bg-[#1648C2] text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              {isAuthenticated ? "Volver al dashboard" : "Ir al inicio"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <PreviewNavbar isAuthenticated={isAuthenticated} customName={customName} />

      <div className="max-w-2xl mx-auto px-5 py-6">
        {/* Header */}
        <DeckHeader
          deck={deck}
          isAuthenticated={isAuthenticated}
          customName={customName}
          createdAt={createdAt}
        />

        {/* Action buttons */}
        <div className="mb-6">
          <ActionButtons
            downloading={downloading}
            onDownload={handleDownload}
            onStudy={handleStudy}
            onBookmark={handleBookmark}
            isBookmarked={isBookmarked}
            isAuthenticated={isAuthenticated}
          />
        </div>

        {/* Video embed */}
        {deck.video_id && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Video original
            </h2>
            <VideoEmbed
              videoId={deck.video_id}
              thumbnail={deck.video_thumbnail}
              title={deck.video_title}
            />
          </div>
        )}

        {/* Cards */}
        <div className="mb-6">
          {isAuthenticated ? (
            <CardList
              cards={deck.cards}
              audioBaseUrl={AUDIO_BASE_URL}
              excludedCards={excludedCards}
              onToggleExclusion={toggleCardExclusion}
            />
          ) : (
            <>
              {/* Anonymous: show first 3 cards via carousel */}
              <CardCarousel
                cards={deck.cards}
                audioBaseUrl={AUDIO_BASE_URL}
                excludedCards={excludedCards}
                onToggleExclusion={toggleCardExclusion}
              />

              {/* CTA to register to see all cards */}
              <div className="mt-6 p-5 bg-gradient-to-r from-[#F0F4FF] to-[#EEF2FF] rounded-2xl border border-[#1A56DB]/10 text-center">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  Registrate para acceder a las {deck.total_cards} tarjetas
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Guarda tu progreso y estudia con repetición espaciada
                </p>
                <button
                  onClick={() => {
                    setPendingAction(null)
                    setShowRegisterModal(true)
                  }}
                  className="bg-[#1A56DB] text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#1648C2] transition-all"
                >
                  Crear cuenta gratis
                </button>
              </div>
            </>
          )}
        </div>

        {/* Add missing phrase */}
        <MissingPhraseWidget deckId={deckId} />

        {/* Spacer for fixed elements */}
        <div className="h-20" />
      </div>

      {/* Register modal */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => {
          setShowRegisterModal(false)
          setPendingAction(null)
        }}
        deckId={deckId}
        onSuccess={handleRegisterSuccess}
      />

      {/* Feedback banner — star-based */}
      <FeedbackBanner
        visible={feedback.visible}
        progress={feedback.progress}
        onDismiss={feedback.dismiss}
        onRate={(rating) => {
          api.submitFeedback({
            type: "post_download",
            rating,
            deck_id: deckId,
          }).catch(() => {})
          feedback.dismiss()
        }}
      />

      {/* Emoji feedback banner — per spec */}
      {showFeedback && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.12)] flex items-center gap-3 min-w-[340px] animate-in slide-in-from-bottom duration-300">
          {feedbackStep === "emoji" && (
            <>
              <span className="text-[13px] font-semibold text-gray-900">¿Cómo quedaron las tarjetas?</span>
              <div className="flex gap-1.5">
                {["🔥", "👍", "😐", "😕"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleFeedbackEmoji(emoji)}
                    className="text-lg hover:scale-125 transition-transform p-1 rounded-lg hover:bg-gray-100"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <button
                onClick={handleDismissFeedback}
                aria-label="Cerrar"
                className="ml-1 text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </>
          )}
          {feedbackStep === "details" && (
            <>
              <span className="text-[13px] font-semibold text-gray-900">¿Qué le faltó?</span>
              <div className="flex gap-1.5 flex-wrap">
                {["El nivel no era el mío", "El audio no funcionó", "Frases muy genéricas"].map((detail) => (
                  <button
                    key={detail}
                    onClick={() => handleFeedbackDetail(detail)}
                    className="text-[12px] bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1 hover:bg-gray-200 transition-colors"
                  >
                    {detail}
                  </button>
                ))}
              </div>
            </>
          )}
          {feedbackStep === "done" && (
            <span className="text-[13px] text-gray-500">
              ¡Gracias por tu feedback! 🎯
            </span>
          )}
        </div>
      )}

      {/* Floating feedback button */}
      {isAuthenticated && !showFeedback && (
        <button
          onClick={() => setShowFeedback(true)}
          className="fixed bottom-6 right-5 z-40 bg-white border border-gray-200 rounded-full px-3.5 py-2 text-[12px] text-gray-500 font-medium flex items-center gap-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.08)] hover:border-gray-300 hover:text-gray-700 transition-all"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          ¿Algo que mejorar?
        </button>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-2.5 rounded-full shadow-elevated flex items-center gap-2 animate-in">
          <CheckCircle2 className="w-4 h-4" />
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}
    </div>
  )
}
