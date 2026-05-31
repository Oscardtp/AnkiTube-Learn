"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"
import { api } from "@/lib/api"

function validateEmail(email: string): string | null {
  if (!email) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "El correo no se ve bien, revisalo"
  return null
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailTouched, setEmailTouched] = useState(false)
  const formTopRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to top when error appears
  useEffect(() => {
    if (error && formTopRef.current) {
      formTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [error])

  const emailError = emailTouched ? validateEmail(email) : null

  const handleEmailBlur = useCallback(() => {
    setEmailTouched(true)
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setEmailTouched(true)

    if (!email.trim() || !password.trim()) {
      setError("Complete todos los campos, parcero")
      return
    }

    if (validateEmail(email)) {
      setError("El correo no se ve bien, revisalo")
      return
    }

    setLoading(true)
    setError("")

    try {
      const data = await api.login(email, password)
      localStorage.setItem("token", data.access_token)
      localStorage.setItem("user", JSON.stringify(data.user))

      if (rememberMe) {
        localStorage.setItem("remember_email", email)
      } else {
        localStorage.removeItem("remember_email")
      }

      router.push("/dashboard")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Uy, algo falló. Intentá de nuevo"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand / illustration (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden bg-gradient-to-br from-[#0a1f44] via-[#0d2d6b] to-[#1a56db]">
        {/* Decorative circles */}
        <div className="absolute top-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full bg-white/5" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[250px] h-[250px] rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-white/[0.03]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white rounded-[9px] flex items-center justify-center shadow-lg">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1.5" fill="#1a56db" />
                <rect x="9" y="2" width="5" height="5" rx="1.5" fill="#1a56db" opacity=".7" />
                <rect x="2" y="9" width="5" height="5" rx="1.5" fill="#1a56db" opacity=".7" />
                <rect x="9" y="9" width="5" height="5" rx="1.5" fill="#1a56db" opacity=".4" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">AnkiTube</span>
          </div>

          {/* Center illustration / messaging */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <div className="mb-8">
              {/* Floating cards illustration */}
              <div className="relative w-48 h-48 mb-10">
                <div className="absolute top-0 left-0 w-36 h-24 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 rotate-[-6deg] flex flex-col justify-center px-5">
                  <div className="w-full h-2.5 bg-white/30 rounded-full mb-2" />
                  <div className="w-3/4 h-2.5 bg-white/20 rounded-full mb-3" />
                  <div className="flex gap-1.5">
                    <div className="h-5 w-10 bg-emerald-400/40 rounded-md" />
                    <div className="h-5 w-10 bg-white/20 rounded-md" />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-36 h-24 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 rotate-[4deg] flex flex-col justify-center px-5">
                  <div className="w-full h-2.5 bg-white/30 rounded-full mb-2" />
                  <div className="w-2/3 h-2.5 bg-white/20 rounded-full mb-3" />
                  <div className="flex gap-1.5">
                    <div className="h-5 w-10 bg-white/20 rounded-md" />
                    <div className="h-5 w-10 bg-blue-400/40 rounded-md" />
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/15 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                  <span className="text-white text-sm font-semibold">📝 + 🧠 = 🚀</span>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
              Seguí aprendiendo<br />
              <span className="text-blue-200">donde te quedaste.</span>
            </h2>
            <p className="text-blue-100/70 text-base leading-relaxed">
              Tu progreso, tus mazos, tu ritmo. Todo está guardado y te está esperando, parce.
            </p>
          </div>

          {/* Bottom quote */}
          <p className="text-blue-200/40 text-xs">
            &ldquo;Aprender inglés no debería ser una tortura.&rdquo;
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col min-h-screen bg-white">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-5 h-[56px] border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-[7px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1.5" fill="white" />
                <rect x="9" y="2" width="5" height="5" rx="1.5" fill="white" opacity=".7" />
                <rect x="2" y="9" width="5" height="5" rx="1.5" fill="white" opacity=".7" />
                <rect x="9" y="9" width="5" height="5" rx="1.5" fill="white" opacity=".4" />
              </svg>
            </div>
            <span className="text-[15px] font-semibold text-gray-900">AnkiTube</span>
          </Link>
          <Link
            href="/register"
            className="text-[13px] font-medium text-primary hover:underline"
          >
            Crear cuenta
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-start justify-start px-6 pt-6 pb-10 lg:items-center lg:justify-center lg:py-0 overflow-y-auto">
          <div className="w-full max-w-[380px]">
            {/* Desktop back link */}
            <div className="hidden lg:block mb-8">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors text-sm"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Volver al inicio
              </Link>
            </div>

            {/* Heading */}
            <div ref={formTopRef} id="form-top" className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                ¡Qué gusto verte de nuevo!
              </h1>
              <p className="text-gray-500 text-[15px]">
                Tu progreso te está esperando. ¡Hágale pues!
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-[13px] text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* SSO Buttons */}
            <div className="space-y-2.5 mb-6">
              <button
                type="button"
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl text-[14px] font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuar con Google
              </button>

              <button
                type="button"
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl text-[14px] font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 23 23" fill="none">
                  <path d="M0 0h11v11H0z" fill="#F25022"/>
                  <path d="M12 0h11v11H12z" fill="#7FBA00"/>
                  <path d="M0 12h11v11H0z" fill="#00A4EF"/>
                  <path d="M12 12h11v11H12z" fill="#FFB900"/>
                </svg>
                Continuar con Microsoft
              </button>

              <button
                type="button"
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl text-[14px] font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continuar con Apple
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[12px] text-gray-400 font-medium">o continuá con tu correo</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Form */}
            <form onSubmit={handleLogin}>
              {/* Email */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  placeholder="tu@email.com"
                  className={`w-full h-11 bg-gray-50 border rounded-xl px-3.5 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition-all ${
                    emailError
                      ? "border-red-300 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:ring-2 focus:ring-primary/10 focus:border-primary"
                  }`}
                  disabled={loading}
                />
                {emailError && (
                  <p className="text-[12px] text-red-500 mt-1">{emailError}</p>
                )}
              </div>

              {/* Password */}
              <div className="mb-4">
                <label htmlFor="password" className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-3.5 pr-11 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
              </div>

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                  />
                  <span className="text-[13px] text-gray-600">Recordar mis datos</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[13px] font-medium text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-xl text-[15px] font-bold bg-primary text-white hover:bg-[#1648c2] disabled:opacity-50 transition-all"
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
            </form>

            {/* Register link */}
            <p className="text-center text-[13px] text-gray-500 mt-6">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
