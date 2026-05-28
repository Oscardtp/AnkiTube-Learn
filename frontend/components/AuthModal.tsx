"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { X, Loader2, Mail, Lock, Eye, EyeOff, UserPlus, LogIn } from "lucide-react"
import { api } from "@/lib/api"
import { useInterruptionManager } from "@/hooks/useInterruptionManager"
import SessionTransfer from "./SessionTransfer"

type AuthMode = "login" | "register"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  deckId?: string
  onSuccess?: () => void
}

export default function AuthModal({ isOpen, onClose, deckId, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("register")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showTransfer, setShowTransfer] = useState(false)

  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const { canShow, show, activeInterruption } = useInterruptionManager()

  const isTransferring = activeInterruption === "auth-transfer"

  const closeWithEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isTransferring) {
        onClose()
      }
    },
    [isOpen, onClose, isTransferring],
  )

  useEffect(() => {
    if (isOpen && !isTransferring) {
      previousActiveElement.current = document.activeElement as HTMLElement
      document.addEventListener("keydown", closeWithEsc)
      modalRef.current?.focus()

      return () => {
        document.removeEventListener("keydown", closeWithEsc)
        previousActiveElement.current?.focus()
      }
    }
  }, [isOpen, closeWithEsc, isTransferring])

  useEffect(() => {
    if (isOpen) {
      const canShowModal = canShow("auth-modal")
      if (canShowModal) {
        show("auth-modal")
      }
    }
  }, [isOpen, canShow, show])

  if (!isOpen && !showTransfer) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Poné tu email para continuar")
      return
    }
    if (!password.trim() || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setLoading(true)

    try {
      let data: { access_token: string }
      if (mode === "register") {
        data = await api.register(email, password)
      } else {
        data = await api.login(email, password)
      }

      localStorage.setItem("token", data.access_token)

      if (deckId) {
        const anonSessionId = localStorage.getItem("anon_session_id")
        try {
          await api.claimDeck(deckId, anonSessionId || undefined)
        } catch {
          console.warn("No se pudo transferir el mazo automáticamente")
        }
      }

      setShowTransfer(true)
      show("auth-transfer")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Algo salió mal. Intentá de nuevo."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  function handleTransferComplete() {
    setShowTransfer(false)
    onClose()
    onSuccess?.()
  }

  function switchMode() {
    setMode(mode === "login" ? "register" : "login")
    setError("")
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget && !isTransferring) {
      onClose()
    }
  }

  if (showTransfer) {
    return <SessionTransfer isVisible={true} onComplete={handleTransferComplete} />
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative bg-surface-container-lowest rounded-3xl w-full max-w-[420px] p-8 shadow-elevated animate-in zoom-in-95 duration-200 focus:outline-none"
      >
        <button
          onClick={onClose}
          disabled={isTransferring}
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 id="auth-modal-title" className="text-2xl font-extrabold text-on-surface mb-2">
            {mode === "register" ? "Creá tu cuenta 🎯" : "¡Welcome back! 👋"}
          </h2>
          <p className="text-sm text-on-surface-variant">
            {mode === "register"
              ? "Guardá tu progreso para siempre. Es gratis."
              : "Iniciá sesión para acceder a tus decks."}
          </p>
        </div>

        <div className="flex gap-2 mb-6 bg-surface rounded-xl p-1" role="tablist" aria-label="Modo de autenticación">
          <button
            role="tab"
            aria-selected={mode === "register"}
            onClick={() => setMode("register")}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
              mode === "register"
                ? "bg-primary text-white shadow-sm"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Registrarse
          </button>
          <button
            role="tab"
            aria-selected={mode === "login"}
            onClick={() => setMode("login")}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
              mode === "login"
                ? "bg-primary text-white shadow-sm"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            }`}
          >
            <LogIn className="w-4 h-4" />
            Iniciar sesión
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="auth-email" className="block text-sm font-semibold text-on-surface mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" aria-hidden="true" />
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError("")
                }}
                placeholder="tu@email.com"
                className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 pl-12 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50"
                disabled={loading}
                autoComplete="email"
                aria-describedby={error ? "auth-error" : undefined}
              />
            </div>
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-sm font-semibold text-on-surface mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" aria-hidden="true" />
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 pl-12 pr-12 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50"
                disabled={loading}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                aria-describedby={error ? "auth-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                disabled={loading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <p id="auth-error" className="text-sm text-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full font-bold text-base transition-all duration-200 ${
              loading
                ? "bg-surface-variant text-on-surface-variant cursor-not-allowed"
                : "bg-gradient-to-r from-primary to-primary-container text-white shadow-lg shadow-primary/30 hover:opacity-90 hover:shadow-xl active:scale-[0.98]"
            }`}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                {mode === "register" ? "Creando tu cuenta..." : "Iniciando sesión..."}
              </>
            ) : mode === "register" ? (
              "Crear cuenta gratis"
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        {mode === "login" && (
          <p className="text-center text-xs text-on-surface-variant mt-4">
            ¿Olvidaste tu contraseña?{" "}
            <button
              onClick={() => setError("Recuperación de contraseñaComing soon")}
              className="text-primary font-medium hover:underline"
            >
              Recuperála acá
            </button>
          </p>
        )}

        {mode === "register" && (
          <p className="text-center text-xs text-on-surface-variant mt-4">
            ¿Ya tenés cuenta?{" "}
            <button onClick={switchMode} className="text-primary font-medium hover:underline">
              Iniciá sesión
            </button>
          </p>
        )}
      </div>
    </div>
  )
}