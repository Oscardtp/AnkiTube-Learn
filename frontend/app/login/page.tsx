"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, AlertCircle, Eye, EyeOff, Play, ArrowLeft, Sparkles } from "lucide-react"
import { api } from "@/lib/api"

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
      setError("Ey parcero, llena todos los campos")
      return
    }

    setLoading(true)
    setError("")

    try {
      const data = await api.login(email, password)
      localStorage.setItem("token", data.access_token)
      localStorage.setItem("user", JSON.stringify(data.user))

      router.push("/dashboard")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Algo fallo al iniciar sesion"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-20">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-bold text-xl text-white">AnkiTube</span>
          </Link>

          {/* Main Content */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Que bueno verte de nuevo, parcero
            </h2>
            <p className="text-xl text-white/80">
              Tu progreso te esta esperando. ¡Hagale pues!
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-2xl font-bold text-white">2,847</p>
            <p className="text-sm text-white/70">Mazos creados</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-2xl font-bold text-white">50K+</p>
            <p className="text-sm text-white/70">Tarjetas</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-2xl font-bold text-white">1,200+</p>
            <p className="text-sm text-white/70">Parceros</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Back Link - Mobile */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 lg:hidden"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Inicia sesion
            </h1>
            <p className="text-muted-foreground">
              Entra a tu cuenta y sigue aprendiendo
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Correo electronico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-background border border-outline/20 rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Contrasena
                </label>
                <a href="#" className="text-sm text-primary hover:underline">
                  ¿Se te olvido?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contrasena"
                  className="w-full bg-background border border-outline/20 rounded-xl px-4 py-3.5 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold text-base bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/25"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Iniciar sesion"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-outline/20" />
            <span className="text-sm text-muted-foreground">o</span>
            <div className="flex-1 h-px bg-outline/20" />
          </div>

          {/* Guest Access */}
          <Link 
            href="/"
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-medium text-base border border-outline/20 text-foreground hover:bg-muted/50 transition-all"
          >
            <Sparkles className="w-5 h-5" />
            Probar sin cuenta
          </Link>

          {/* Register Link */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Registrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
