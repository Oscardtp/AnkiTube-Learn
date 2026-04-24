"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react"
import { api } from "@/lib/api"

interface Feedback {
  id: string
  user_id: string | null
  deck_id: string | null
  moment: string
  section: string | null
  intent: string | null
  quick_answer: string
  follow_up: string | null
  text: string | null
  created_at: string
}

interface FeedbackResponse {
  feedback: Feedback[]
  total: number
  page: number
  limit: number
}

export default function AdminFeedbackPage() {
  const router = useRouter()
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(50)
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [filterMoment, setFilterMoment] = useState("")
  const [filterIntent, setFilterIntent] = useState("")

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

    fetchFeedback()
  }, [page, filterMoment, filterIntent])

  async function fetchFeedback() {
    try {
      const data = await api.getAdminFeedback(page, limit, filterMoment || undefined, filterIntent || undefined, twoFactorCode || undefined)
      setFeedback((data as any).feedback)
      setTotal((data as any).total)
      setShowTwoFactor(false)
      setError("")
    } catch (err: any) {
      if (err.status === 401) {
        setShowTwoFactor(true)
        setError("Se requiere código 2FA")
        return
      }
      const errorMessage = err.message || "Error al cargar feedback"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  function handleTwoFactorSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    fetchFeedback()
  }

  const totalPages = Math.ceil(total / limit)

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

  const momentColors: Record<string, string> = {
    post_generation: "bg-blue-500/20 text-blue-700",
    post_download: "bg-green-500/20 text-green-700",
    card_report: "bg-red-500/20 text-red-700",
    nps: "bg-purple-500/20 text-purple-700",
    general: "bg-gray-500/20 text-gray-700",
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface mb-2">Gestión de feedback</h1>
        <p className="text-on-surface-variant">{total} feedbacks recibidos</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label htmlFor="filterMoment" className="block text-sm font-semibold text-on-surface mb-2">
            Momento
          </label>
          <select
            id="filterMoment"
            value={filterMoment}
            onChange={(e) => { setFilterMoment(e.target.value); setPage(1); }}
            className="bg-surface border border-outline-variant rounded-xl px-4 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="">Todos</option>
            <option value="post_generation">Post generación</option>
            <option value="post_download">Post descarga</option>
            <option value="card_report">Reporte de tarjeta</option>
            <option value="nps">NPS</option>
            <option value="general">General</option>
          </select>
        </div>

        <div>
          <label htmlFor="filterIntent" className="block text-sm font-semibold text-on-surface mb-2">
            Intención
          </label>
          <select
            id="filterIntent"
            value={filterIntent}
            onChange={(e) => { setFilterIntent(e.target.value); setPage(1); }}
            className="bg-surface border border-outline-variant rounded-xl px-4 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="">Todas</option>
            <option value="praise">Elogio</option>
            <option value="suggestion">Sugerencia</option>
            <option value="report">Reporte</option>
            <option value="question">Pregunta</option>
          </select>
        </div>
      </div>

      {/* Feedback list */}
      <div className="space-y-4">
        {feedback.map((fb) => (
          <div key={fb.id} className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-container/30 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${momentColors[fb.moment] || momentColors.general}`}>
                    {fb.moment}
                  </span>
                  {fb.intent && (
                    <span className="ml-2 text-xs text-on-surface-variant">• {fb.intent}</span>
                  )}
                </div>
              </div>
              <span className="text-xs text-on-surface-variant">
                {new Date(fb.created_at).toLocaleString()}
              </span>
            </div>

            <div className="mb-3">
              <p className="text-sm font-semibold text-on-surface mb-1">Respuesta rápida:</p>
              <p className="text-on-surface">{fb.quick_answer}</p>
            </div>

            {fb.follow_up && (
              <div className="mb-3">
                <p className="text-sm font-semibold text-on-surface mb-1">Seguimiento:</p>
                <p className="text-on-surface">{fb.follow_up}</p>
              </div>
            )}

            {fb.text && (
              <div className="mb-3">
                <p className="text-sm font-semibold text-on-surface mb-1">Comentario:</p>
                <p className="text-on-surface">{fb.text}</p>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-on-surface-variant pt-3 border-t border-outline-variant/20">
              {fb.user_id && <span>Usuario: {fb.user_id}</span>}
              {fb.deck_id && <span>Mazo: {fb.deck_id}</span>}
              {fb.section && <span>Sección: {fb.section}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-on-surface-variant">
            Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de {total} feedbacks
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-sm font-medium text-on-surface">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed"
              title="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
