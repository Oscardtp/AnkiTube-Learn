"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"
import MinimalNavbar from "@/components/MinimalNavbar"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      setError("Complete todos los campos, parcero")
      return
    }

    setLoading(true)
    setError("")

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || "Error al iniciar sesión")
      }

      const data = await res.json()
      localStorage.setItem("token", data.access_token)
      localStorage.setItem("user", JSON.stringify(data.user))

      router.push("/dashboard")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al iniciar sesión"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <MinimalNavbar />

      {/* Hero Section with Glassmorphism */}
      <section className="pt-8 pb-8 px-6 md:px-12">
        <div className="max-w-2xl mx-auto text-center">
          <div 
            className="p-8 rounded-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4 leading-tight">
              ¡Qué gusto verte de nuevo!
            </h1>
            <p className="text-lg text-on-surface-variant max-w-xl mx-auto">
              Tu progreso te está esperando. ¡Hágale pues!
            </p>
          </div>
        </div>
      </section>

      {/* Login Card */}
      <section className="pb-16 px-6 md:px-12">
        <div className="max-w-md mx-auto">
          <div 
            className="bg-surface-container-lowest rounded-3xl p-8"
            style={{ boxShadow: '0 8px 24px rgba(25, 28, 30, 0.06)' }}
          >
            <form onSubmit={handleLogin}>
              {error && (
                <div className="mb-6 p-4 bg-error-container/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-error" />
                    <p className="text-sm text-on-error-container">{error}</p>
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-semibold text-on-surface mb-2">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-4 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  disabled={loading}
                />
              </div>

              {/* Password Input with Toggle */}
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-semibold text-on-surface mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-4 pr-12 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="mb-6 text-right">
                <a 
                  href="#" 
                  className="text-sm font-medium text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {/* CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full font-bold text-base bg-gradient-to-r from-primary to-primary-container text-white hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </button>

              {/* Footer */}
              <p className="text-center text-sm text-on-surface-variant mt-6">
                ¿No tienes cuenta?{" "}
                <Link href="/register" className="text-primary font-medium hover:underline">
                  Regístrate gratis
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
