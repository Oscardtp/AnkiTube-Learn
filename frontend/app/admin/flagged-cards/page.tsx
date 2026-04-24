"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle, Flag, Eye, EyeOff } from "lucide-react"
import { api } from "@/lib/api"

interface FlaggedCard {
  deck_id: string
  video_title: string
  level: string
  card_front: string
  card_back: string
  keyword: string
}

export default function AdminFlaggedCardsPage() {
  const router = useRouter()
  const [flaggedCards, setFlaggedCards] = useState<FlaggedCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [showTwoFactor, setShowTwoFactor] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const user = localStorage.getItem("user")
    if (user) {
      const userData = JSON.parse(user)
      if (userData.role !== "superadmin") {
        router.push("/")
        return
      }
    }

    fetchFlaggedCards()
  }, [])

  async function fetchFlaggedCards() {
    try {
      const data = await api.getFlaggedCards(twoFactorCode || undefined)
      setFlaggedCards((data as any).flagged_cards)
      setShowTwoFactor(false)
      setError("")
    } catch (err: any) {
      if (err.status === 401) {
        setShowTwoFactor(true)
        setError("Se requiere código 2FA")
        return
      }
      const errorMessage = err.message || "Error al cargar tarjetas marcadas"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  function handleTwoFactorSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    fetchFlaggedCards()
  }

  if (loading && !showTwoFactor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (showTwoFactor) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-on-surface mb-2">Verificación 2FA</h1>
            <p className="text-on-surface-variant">Ingresa el código de autenticación</p>
          </div>

          <form onSubmit={handleTwoFactorSubmit} className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/20 shadow-sm">
            {error && (
              <div className="mb-4 p-4 bg-error-container/30 rounded-xl border border-error/20">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-error" />
                  <p className="text-sm text-on-error-container">{error}</p>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="twoFactor" className="block text-sm font-semibold text-on-surface mb-2">
                Código 2FA
              </label>
              <input
                id="twoFactor"
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-base bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar"
              )}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface mb-2">Tarjetas marcadas para revisión</h1>
        <p className="text-on-surface-variant">{flaggedCards.length} tarjetas reportadas por usuarios</p>
      </div>

      {flaggedCards.length === 0 ? (
        <div className="text-center py-12">
          <Flag className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
          <p className="text-on-surface-variant">No hay tarjetas marcadas para revisión</p>
        </div>
      ) : (
        <div className="space-y-4">
          {flaggedCards.map((card, index) => (
            <div key={index} className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-warning-container/30 rounded-full flex items-center justify-center">
                    <Flag className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">{card.video_title}</p>
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-primary-container/30 text-on-primary-container">
                      {card.level}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-on-surface-variant">ID: {card.deck_id}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-semibold text-on-surface mb-1">Frente:</p>
                  <p className="text-on-surface-variant">{card.card_front}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface mb-1">Atrás:</p>
                  <p className="text-on-surface-variant">{card.card_back}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-on-surface">Keyword:</span>
                <span className="text-sm text-on-surface-variant">{card.keyword}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
