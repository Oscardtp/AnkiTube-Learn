"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"

export default function ActivateLicensePage() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [expiresAt, setExpiresAt] = useState("")

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault()

    if (!code.trim()) {
      setError("Por favor ingresa el código de licencia")
      return
    }

    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
      const res = await fetch(`${apiUrl}/api/licenses/activate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || "Error al activar la licencia")
      }

      const data = await res.json()
      setSuccess(true)
      setExpiresAt(data.expires_at)

      // Update user in localStorage
      const user = localStorage.getItem("user")
      if (user) {
        const userData = JSON.parse(user)
        userData.role = data.role
        localStorage.setItem("user", JSON.stringify(userData))
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al activar la licencia"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-on-surface mb-2">Activar licencia</h1>
          <p className="text-on-surface-variant">Ingresa tu código de licencia para obtener acceso premium</p>
        </div>

        <form onSubmit={handleActivate} className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/20 shadow-sm">
          {error && (
            <div className="mb-4 p-4 bg-error-container/30 rounded-xl border border-error/20">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-error" />
                <p className="text-sm text-on-error-container">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-primary-container/30 rounded-xl border border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <p className="text-sm font-semibold text-on-primary-container">¡Licencia activada!</p>
              </div>
              <p className="text-sm text-on-primary-container">
                Tu acceso premium expira el {new Date(expiresAt).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="code" className="block text-sm font-semibold text-on-surface mb-2">
              Código de licencia
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ANKI-XXXX-XXXX"
              className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-mono"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-base bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Activando...
              </>
            ) : success ? (
              "Licencia activada"
            ) : (
              "Activar licencia"
            )}
          </button>

          {success && (
            <button
              type="button"
              onClick={() => router.push("/my-decks")}
              className="w-full mt-4 py-3 px-6 rounded-xl font-semibold text-base border border-outline-variant text-on-surface hover:bg-surface-container transition-all"
            >
              Ir a mis mazos
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
