"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle, Users, Layers, MessageSquare, Key } from "lucide-react"

interface Metrics {
  total_users: number
  total_decks: number
  total_feedback: number
  users_by_role: Record<string, number>
  decks_by_model: Record<string, number>
  licenses: Record<string, number>
  feedback_by_moment: Record<string, number>
}

export default function AdminPage() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<Metrics | null>(null)
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

    fetchMetrics()
  }, [])

  async function fetchMetrics() {
    try {
      const token = localStorage.getItem("token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      }

      if (twoFactorCode) {
        headers["X-2FA-Code"] = twoFactorCode
      }

      const res = await fetch(`${apiUrl}/api/admin/metrics`, { headers })

      if (!res.ok) {
        if (res.status === 401) {
          setShowTwoFactor(true)
          setError("Se requiere código 2FA")
          return
        }
        throw new Error("Error al cargar métricas")
      }

      const data = await res.json()
      setMetrics(data)
      setShowTwoFactor(false)
      setError("")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar métricas"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  function handleTwoFactorSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    fetchMetrics()
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

  if (!metrics) {
    return null
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface mb-2">Panel de administración</h1>
        <p className="text-on-surface-variant">Métricas y gestión del sistema</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-container/30 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-on-surface-variant">Usuarios</p>
              <p className="text-2xl font-bold text-on-surface">{metrics.total_users}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-container/30 rounded-lg">
              <Layers className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-on-surface-variant">Mazos</p>
              <p className="text-2xl font-bold text-on-surface">{metrics.total_decks}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-container/30 rounded-lg">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-on-surface-variant">Feedback</p>
              <p className="text-2xl font-bold text-on-surface">{metrics.total_feedback}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-container/30 rounded-lg">
              <Key className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-on-surface-variant">Licencias activas</p>
              <p className="text-2xl font-bold text-on-surface">{metrics.licenses.active || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users by role */}
      <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20 mb-8">
        <h2 className="text-lg font-semibold text-on-surface mb-4">Usuarios por rol</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(metrics.users_by_role).map(([role, count]) => (
            <div key={role} className="text-center">
              <p className="text-2xl font-bold text-on-surface">{count}</p>
              <p className="text-sm text-on-surface-variant capitalize">{role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Decks by model */}
      <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20 mb-8">
        <h2 className="text-lg font-semibold text-on-surface mb-4">Mazos por modelo</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(metrics.decks_by_model).map(([model, count]) => (
            <div key={model} className="text-center">
              <p className="text-2xl font-bold text-on-surface">{count}</p>
              <p className="text-sm text-on-surface-variant">{model}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Licenses */}
      <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20">
        <h2 className="text-lg font-semibold text-on-surface mb-4">Licencias</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(metrics.licenses).map(([status, count]) => (
            <div key={status} className="text-center">
              <p className="text-2xl font-bold text-on-surface">{count}</p>
              <p className="text-sm text-on-surface-variant capitalize">{status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
