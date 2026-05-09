"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, AlertCircle, Eye, EyeOff, Play, Check, ArrowLeft } from "lucide-react"
import { api } from "@/lib/api"

const BENEFITS = [
  "Mazos ilimitados guardados en la nube",
  "Historial de todos tus videos procesados",
  "Sincronizacion entre dispositivos",
  "Acceso a contextos premium (Trabajo, Viajes, Gaming)",
]

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Ey parcero, llena todos los campos")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden, revisa bien")
      return
    }

    if (password.length < 8) {
      setError("La contrasena debe tener minimo 8 caracteres")
      return
    }

    setLoading(true)
    setError("")

    try {
      const data = await api.register(email, password)
      localStorage.setItem("token", data.access_token)
      localStorage.setItem("user", JSON.stringify(data.user))

      router.push("/dashboard")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Algo fallo al crear la cuenta"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between">
        <div>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-16">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-bold text-xl text-white">AnkiTube</span>
          </Link>

          {/* Benefits */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Unete a la comunidad de parceros que ya estan aprendiendo
              </h2>
              <p className="text-primary-foreground/80 text-lg">
                Con una cuenta gratis tienes acceso a todo esto:
              </p>
            </div>

            <ul className="space-y-4">
              {BENEFITS.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Testimonial */}
        <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <p className="text-white/90 mb-4 italic">
            &ldquo;Desde que uso AnkiTube mi ingles mejoro un monton. Ya no me da miedo hablar con los gringos en las calls.&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-sm font-semibold text-white">CM</span>
            </div>
            <div>
              <p className="font-medium text-white text-sm">Carlos Martinez</p>
              <p className="text-xs text-white/70">Desarrollador • Bogota</p>
            </div>
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
              Crea tu cuenta gratis
            </h1>
            <p className="text-muted-foreground">
              Empieza a aprender ingles de verdad, parcero
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">
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
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Contrasena
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimo 8 caracteres"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                Confirmar contrasena
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Escribe la contrasena otra vez"
                className="w-full bg-background border border-outline/20 rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                disabled={loading}
              />
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
                  Creando tu cuenta...
                </>
              ) : (
                "Crear cuenta gratis"
              )}
            </button>

            {/* Terms */}
            <p className="text-xs text-center text-muted-foreground">
              Al crear tu cuenta aceptas nuestros{" "}
              <a href="#" className="text-primary hover:underline">terminos de servicio</a>
              {" "}y{" "}
              <a href="#" className="text-primary hover:underline">politica de privacidad</a>
            </p>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Inicia sesion
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
