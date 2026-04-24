"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle, Key, Plus, Trash2 } from "lucide-react"
import { api } from "@/lib/api"

interface License {
  code: string
  status: string
  duration_days: number
  expires_at: string | null
  email: string | null
  internal_note: string | null
}

export default function AdminLicensesPage() {
  const router = useRouter()
  const [licenses, setLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [revoking, setRevoking] = useState<string | null>(null)

  // Form state
  const [email, setEmail] = useState("")
  const [durationDays, setDurationDays] = useState(30)
  const [internalNote, setInternalNote] = useState("")

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

    fetchLicenses()
  }, [])

  async function fetchLicenses() {
    try {
      const data = await api.getAdminLicenses(twoFactorCode || undefined)
      setLicenses(data as any)
      setShowTwoFactor(false)
      setError("")
    } catch (err: any) {
      if (err.status === 401) {
        setShowTwoFactor(true)
        setError("Se requiere código 2FA")
        return
      }
      const errorMessage = err.message || "Error al cargar licencias"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)

    try {
      const newLicense = await api.createAdminLicense(
        {
          email: email || null,
          duration_days: durationDays,
          internal_note: internalNote || null,
        },
        twoFactorCode || undefined
      )
      setLicenses([newLicense as any, ...licenses])
      setShowCreateForm(false)
      setEmail("")
      setDurationDays(30)
      setInternalNote("")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear licencia"
      alert(errorMessage)
    } finally {
      setCreating(false)
    }
  }

  async function handleRevoke(code: string) {
    if (!confirm(`¿Estás seguro de que quieres revocar la licencia ${code}?`)) {
      return
    }

    setRevoking(code)
    try {
      await api.deleteAdminLicense(code, twoFactorCode || undefined)
      setLicenses(licenses.filter((l) => l.code !== code))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al revocar licencia"
      alert(errorMessage)
    } finally {
      setRevoking(null)
    }
  }

  function handleTwoFactorSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    fetchLicenses()
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

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-700",
    active: "bg-green-500/20 text-green-700",
    expired: "bg-gray-500/20 text-gray-700",
    revoked: "bg-red-500/20 text-red-700",
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-on-surface mb-2">Gestión de licencias</h1>
          <p className="text-on-surface-variant">{licenses.length} licencias</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Crear licencia
        </button>
      </div>

      {/* Create form modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-surface-container-low rounded-2xl p-6 w-full max-w-md border border-outline-variant/20 shadow-xl">
            <h2 className="text-lg font-semibold text-on-surface mb-4">Crear nueva licencia</h2>

            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-semibold text-on-surface mb-2">
                  Email (opcional)
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@email.com"
                  className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="duration" className="block text-sm font-semibold text-on-surface mb-2">
                  Duración
                </label>
                <select
                  id="duration"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                >
                  <option value={7}>7 días</option>
                  <option value={15}>15 días</option>
                  <option value={30}>30 días</option>
                </select>
              </div>

              <div className="mb-6">
                <label htmlFor="note" className="block text-sm font-semibold text-on-surface mb-2">
                  Nota interna (opcional)
                </label>
                <textarea
                  id="note"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Nota para uso interno"
                  rows={3}
                  className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-3 px-6 rounded-xl font-semibold text-base border border-outline-variant text-on-surface hover:bg-surface-container transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-base bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Licenses list */}
      <div className="space-y-4">
        {licenses.map((license) => (
          <div key={license.code} className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-container/30 rounded-full flex items-center justify-center">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-mono font-semibold text-on-surface">{license.code}</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColors[license.status] || statusColors.pending}`}>
                    {license.status}
                  </span>
                </div>
              </div>

              {license.status !== "revoked" && (
                <button
                  onClick={() => handleRevoke(license.code)}
                  disabled={revoking === license.code}
                  className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-error hover:bg-error-container/30 rounded-lg transition-colors disabled:opacity-50"
                >
                  {revoking === license.code ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Revocar
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-on-surface-variant">Duración</p>
                <p className="font-medium text-on-surface">{license.duration_days} días</p>
              </div>
              <div>
                <p className="text-on-surface-variant">Email</p>
                <p className="font-medium text-on-surface">{license.email || "—"}</p>
              </div>
              <div>
                <p className="text-on-surface-variant">Expira</p>
                <p className="font-medium text-on-surface">
                  {license.expires_at ? new Date(license.expires_at).toLocaleDateString() : "—"}
                </p>
              </div>
              <div>
                <p className="text-on-surface-variant">Nota</p>
                <p className="font-medium text-on-surface">{license.internal_note || "—"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
