"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle } from "lucide-react"
import MinimalNavbar from "@/components/MinimalNavbar"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Por favor completa todos los campos")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    setLoading(true)
    setError("")

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || "Error al registrarse")
      }

      const data = await res.json()
      localStorage.setItem("token", data.access_token)
      localStorage.setItem("user", JSON.stringify(data.user))

      router.push("/my-decks")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al registrarse"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <MinimalNavbar />
      <div className="flex items-center justify-center p-6 pt-8">
        <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-on-surface mb-2">Crear cuenta</h1>
          <p className="text-on-surface-variant">Regístrate para guardar tus mazos</p>
        </div>

        <form onSubmit={handleRegister} className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/20 shadow-sm">
          {error && (
            <div className="mb-4 p-4 bg-error-container/30 rounded-xl border border-error/20">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-error" />
                <p className="text-sm text-on-error-container">{error}</p>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-semibold text-on-surface mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-semibold text-on-surface mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              disabled={loading}
            />
            <p className="text-xs text-on-surface-variant mt-1">
              Mínimo 8 caracteres, una mayúscula, una minúscula y un número
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-on-surface mb-2">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
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
                Creando cuenta...
              </>
            ) : (
              "Crear cuenta"
            )}
          </button>

          <p className="text-center text-sm text-on-surface-variant mt-4">
            ¿Ya tienes cuenta?{" "}
            <a href="/login" className="text-primary font-medium hover:underline">
              Inicia sesión
            </a>
          </p>
        </form>
        </div>
      </div>
    </div>
  )
}
