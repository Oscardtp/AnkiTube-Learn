"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, AlertCircle, ChevronLeft, CheckCircle2 } from "lucide-react"
import PreviewNavbar from "@/components/PreviewNavbar"
import DeckHeader from "@/components/DeckHeader"
// TODO(Fase2): Re-habilitar cuando se resuelva quota de YouTube API
// import VideoEmbed from "@/components/VideoEmbed"
import CardCarousel from "@/components/CardCarousel"
import ActionButtons from "@/components/ActionButtons"
import MissingPhraseWidget from "@/components/MissingPhraseWidget"
import FeedbackBanner from "@/components/FeedbackBanner"
import RegisterModal from "@/components/RegisterModal"
import { useDeck } from "@/hooks/useDeck"
import { useFeedbackTrigger } from "@/hooks/useFeedbackTrigger"
import { api } from "@/lib/api"

export default function PreviewPage() {
  const params = useParams()
  const router = useRouter()
  const deckId = params.deck_id as string

  const { data: deck, isLoading, error } = useDeck(deckId)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [customName, setCustomName] = useState<string | undefined>()
  const [downloading, setDownloading] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<"download" | "study" | null>(null)
  const [toast, setToast] = useState("")

  const feedback = useFeedbackTrigger({ triggerDelayMs: 3000, autoDismissMs: 8000 })

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsAuthenticated(!!token)
    if (token) {
      api.getCurrentUser().then((user) => {
        setCustomName(user.custom_name)
      }).catch(() => {})
    }
  }, [])

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

  const handleFeedbackRate = useCallback((rating: number) => {
    api.submitFeedback({
      type: "post_download",
      rating,
      deck_id: deckId,
    }).catch(() => {})
    feedback.dismiss()
  }, [deckId, feedback])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <PreviewNavbar isAuthenticated={false} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen bg-surface">
        <PreviewNavbar isAuthenticated={isAuthenticated} customName={customName} />
        <div className="p-6 max-w-3xl mx-auto">
          <div className="bg-error-container/30 rounded-xl p-6 border border-error/20">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-error" />
              <h2 className="text-lg font-semibold text-on-error-container">Error</h2>
            </div>
            <p className="text-on-error-container mb-4">
              {error?.message || "No se pudo cargar el mazo"}
            </p>
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

  return (
    <div className="min-h-screen bg-surface">
      <PreviewNavbar isAuthenticated={isAuthenticated} customName={customName} />

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-8">
        <DeckHeader deck={deck} isAuthenticated={isAuthenticated} customName={customName} />

        {/* TODO(Fase2): Re-habilitar YouTube embed cuando se resuelva quota API
        <VideoEmbed
          videoId={deck.video_id}
          thumbnail={deck.video_thumbnail}
          title={deck.video_title}
        />
        */}

        <CardCarousel cards={deck.cards} />

        <MissingPhraseWidget deckId={deckId} />

        <div className="mt-8">
          <ActionButtons
            downloading={downloading}
            onDownload={handleDownload}
            onStudy={handleStudy}
            selectedCount={0}
          />
        </div>
      </div>

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => {
          setShowRegisterModal(false)
          setPendingAction(null)
        }}
        deckId={deckId}
        onSuccess={handleRegisterSuccess}
      />

      <FeedbackBanner
        visible={feedback.visible}
        progress={feedback.progress}
        onDismiss={feedback.dismiss}
        onRate={handleFeedbackRate}
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-secondary text-white px-6 py-3 rounded-full shadow-elevated flex items-center gap-2 animate-in">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}
    </div>
  )
}
