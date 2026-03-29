"use client"

import { useState } from "react"
import { X, Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react"

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  deckId: string
  onSuccess: () => void
}

export default function RegisterModal({ isOpen, onClose, deckId, onSuccess }: RegisterModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!isOpen) return null

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()

    if (!email.trim()) {
      setError("Poné tu email para guardar tu mazo")
      return
    }
    if (!password.trim() || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setError("")
    setLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

      // Register user
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || "No pudimos crear tu cuenta. Intenta de nuevo.")
      }

      const data = await res.json()

      // Store token
      localStorage.setItem("token", data.access_token)

      // Transfer anonymous deck to new user
      if (deckId) {
        try {
          await fetch(`${apiUrl}/api/decks/${deckId}/transfer`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.access_token}`,
            },
          })
        } catch {
          // Transfer is best-effort, don't block on failure
          console.warn("No se pudo transferir el mazo automáticamente")
        }
      }

      // Close modal
      onClose()

      // Trigger success callback (download + toast)
      onSuccess()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Algo salió mal. Intenta de nuevo."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface-container-lowest rounded-3xl w-full max-w-[420px] p-8 shadow-elevated animate-in">
        {/* Close button */}
        <button
          onClick={onClose}
          title="Cerrar"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-on-surface mb-2">
            Tu mazo te espera 🎯
          </h2>
          <p className="text-sm text-on-surface-variant">
            Guardá tu progreso para siempre. Es gratis.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="register-email" className="block text-sm font-semibold text-on-surface mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError("")
                }}
                placeholder="tu@email.com"
                className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 pl-12 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="register-password" className="block text-sm font-semibold text-on-surface mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 pl-12 pr-12 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-error">{error}</p>
          )}

          {/* CTA */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full font-bold text-base transition-all duration-200 ${
              loading
                ? "bg-surface-variant text-on-surface-variant cursor-not-allowed"
                : "bg-gradient-to-r from-primary to-primary-container text-white shadow-lg shadow-primary/30 hover:opacity-90 hover:shadow-xl active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creando tu cuenta...
              </>
            ) : (
              "Crear cuenta gratis"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-on-surface-variant mt-4">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-primary font-medium hover:underline">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  )
}
