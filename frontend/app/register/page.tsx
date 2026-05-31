"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, AlertCircle, Eye, EyeOff, Check } from "lucide-react"
import { api } from "@/lib/api"

const LANGUAGES = [
  { id: "english", label: "Inglés", flag: "🇺🇸" },
  { id: "french", label: "Francés", flag: "🇫🇷" },
  { id: "japanese", label: "Japonés", flag: "🇯🇵" },
  { id: "portuguese", label: "Portugués", flag: "🇧🇷" },
  { id: "german", label: "Alemán", flag: "🇩🇪" },
  { id: "italian", label: "Italiano", flag: "🇮🇹" },
]

function validateEmail(email: string): string | null {
  if (!email) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "El correo no se ve bien, revisalo"
  return null
}

function validateName(name: string): string | null {
  if (!name) return null
  if (name.trim().length < 2) return "El nombre es muy corto, parce"
  return null
}

function getPasswordStrength(password: string): { level: number; label: string; color: string } {
  if (!password) return { level: 0, label: "", color: "" }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { level: 1, label: "Débil", color: "bg-red-400" }
  if (score <= 3) return { level: 2, label: "Media", color: "bg-amber-400" }
  return { level: 3, label: "Fuerte", color: "bg-emerald-400" }
}

function validatePassword(password: string): string | null {
  if (!password) return null
  if (password.length < 8) return "Mínimo 8 caracteres"
  if (!/[A-Z]/.test(password)) return "Necesita al menos una mayúscula"
  if (!/[a-z]/.test(password)) return "Necesita al menos una minúscula"
  if (!/\d/.test(password)) return "Necesita al menos un número"
  return null
}

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [preferredLanguage, setPreferredLanguage] = useState("english")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [touched, setTouched] = useState({ name: false, email: false, password: false })
  const formTopRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to top when error appears
  useEffect(() => {
    if (error && formTopRef.current) {
      formTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [error])

  const nameError = touched.name ? validateName(name) : null
  const emailError = touched.email ? validateEmail(email) : null
  const passwordError = touched.password ? validatePassword(password) : null
  const passwordStrength = getPasswordStrength(password)

  const handleBlur = useCallback((field: "name" | "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }, [])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ name: true, email: true, password: true })

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Necesitamos todos los campos, parce")
      return
    }

    if (validateName(name) || validateEmail(email) || validatePassword(password)) {
      setError("Revisá los campos, algo no está bien")
      return
    }

    setLoading(true)
    setError("")

    try {
      // TODO: Backend UserCreate model solo acepta email + password.
      // Cuando el backend soporte name y preferred_language, enviarlos:
      // await api.register(email, password, name, preferredLanguage)
      await api.register(email, password)

      // Guardar nombre y idioma preferido en localStorage para el wizard
      localStorage.setItem("user_name", name)
      localStorage.setItem("preferred_language", preferredLanguage)

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
              {/* Globe + flags illustration */}
              <div className="relative w-52 h-52 mb-10">
                {/* Globe */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full border-2 border-white/20 flex items-center justify-center">
                  <div className="w-24 h-32 border border-white/10 rounded-full" />
                  <div className="absolute w-32 h-px bg-white/10" />
                  <div className="absolute w-px h-32 bg-white/10" />
                </div>
                {/* Floating flag pills */}
                <div className="absolute top-2 left-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20 rotate-[-8deg]">
                  <span className="text-white text-xs font-semibold">🇺🇸 English</span>
                </div>
                <div className="absolute top-6 right-0 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20 rotate-[5deg]">
                  <span className="text-white text-xs font-semibold">🇯🇵 日本語</span>
                </div>
                <div className="absolute bottom-20 left-0 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20 rotate-[3deg]">
                  <span className="text-white text-xs font-semibold">🇫🇷 Français</span>
                </div>
                <div className="absolute bottom-16 right-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20 rotate-[-4deg]">
                  <span className="text-white text-xs font-semibold">🇧🇷 Português</span>
                </div>
                {/* Floating badge */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/15 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                  <span className="text-white text-sm font-semibold">🌍 + 📚 = 🚀</span>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
              Empezá tu viaje<br />
              <span className="text-blue-200">lingüístico hoy.</span>
            </h2>
            <p className="text-blue-100/70 text-base leading-relaxed">
              Un mundo de idiomas te está esperando. Creá tu cuenta y empezá a aprender en segundos, sin enredarte.
            </p>
          </div>

          {/* Bottom quote */}
          <p className="text-blue-200/40 text-xs">
            &ldquo;Cada idioma es una puerta a una nueva forma de ver el mundo.&rdquo;
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
            href="/login"
            className="text-[13px] font-medium text-primary hover:underline"
          >
            Iniciar sesión
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
            <div ref={formTopRef} id="form-top" className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Creá tu cuenta gratis
              </h1>
              <p className="text-gray-500 text-[15px]">
                Empezá tu viaje lingüístico hoy. Son 30 segundos y listo, parce.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 rounded-xl border border-red-100 animate-shake">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-[13px] text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* SSO Buttons */}
            <div className="space-y-2 mb-4">
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continuar con Apple
              </button>

              <button
                type="button"
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl text-[14px] font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.875V12h3.328l-.532 3.47h-2.796v8.385C19.612 22.954 24 17.99 24 12z"/>
                </svg>
                Continuar con Facebook
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[12px] text-gray-400 font-medium">o creá tu cuenta con el correo</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Form */}
            <form onSubmit={handleRegister}>
              {/* Name */}
              <div className="mb-3">
                <label htmlFor="name" className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  ¿Cómo te llamás?
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => handleBlur("name")}
                    placeholder="Tu nombre"
                    autoComplete="name"
                    className={`w-full h-11 bg-gray-50 border rounded-xl px-3.5 pr-10 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition-all ${
                      nameError
                        ? "border-red-300 focus:ring-2 focus:ring-red-100"
                        : name && !nameError
                          ? "border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                          : "border-gray-200 focus:ring-2 focus:ring-primary/10 focus:border-primary"
                    }`}
                    disabled={loading}
                  />
                  {name && !nameError && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  )}
                </div>
                {nameError && (
                  <p className="text-[12px] text-red-500 mt-1">{nameError}</p>
                )}
              </div>

              {/* Email */}
              <div className="mb-3">
                <label htmlFor="email" className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur("email")}
                    placeholder="tu@email.com"
                    autoComplete="email"
                    className={`w-full h-11 bg-gray-50 border rounded-xl px-3.5 pr-10 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition-all ${
                      emailError
                        ? "border-red-300 focus:ring-2 focus:ring-red-100"
                        : email && !emailError
                          ? "border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                          : "border-gray-200 focus:ring-2 focus:ring-primary/10 focus:border-primary"
                    }`}
                    disabled={loading}
                  />
                  {email && !emailError && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  )}
                </div>
                {emailError && (
                  <p className="text-[12px] text-red-500 mt-1">{emailError}</p>
                )}
              </div>

              {/* Password */}
              <div className="mb-3">
                <label htmlFor="password" className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur("password")}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={`w-full h-11 bg-gray-50 border rounded-xl px-3.5 pr-11 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition-all ${
                      passwordError
                        ? "border-red-300 focus:ring-2 focus:ring-red-100"
                        : "border-gray-200 focus:ring-2 focus:ring-primary/10 focus:border-primary"
                    }`}
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
                {/* Password strength bar */}
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      <div className={`h-1 flex-1 rounded-full ${passwordStrength.level >= 1 ? passwordStrength.color : "bg-gray-200"}`} />
                      <div className={`h-1 flex-1 rounded-full ${passwordStrength.level >= 2 ? passwordStrength.color : "bg-gray-200"}`} />
                      <div className={`h-1 flex-1 rounded-full ${passwordStrength.level >= 3 ? passwordStrength.color : "bg-gray-200"}`} />
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {passwordError || (passwordStrength.label && `Fuerza: ${passwordStrength.label}`)}
                    </p>
                  </div>
                )}
                {!password && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    Mínimo 8 caracteres, una mayúscula, una minúscula y un número
                  </p>
                )}
              </div>

              {/* Language selector */}
              <div className="mb-4">
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                  ¿Qué idioma querés aprender?
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setPreferredLanguage(lang.id)}
                      className={`flex items-center gap-1.5 h-9 px-3 rounded-full text-[13px] font-medium border whitespace-nowrap transition-all flex-shrink-0 ${
                        preferredLanguage === lang.id
                          ? "bg-primary/5 border-primary/30 text-primary"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      {lang.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">Podés cambiarlo después, no hay peo.</p>
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
                    Creando tu cuenta...
                  </>
                ) : (
                  "Crear cuenta"
                )}
              </button>
            </form>

            {/* Legal */}
            <p className="text-[11px] text-gray-400 text-center mt-4 leading-relaxed">
              Al crear tu cuenta aceptás nuestros{" "}
              <a href="#" className="underline hover:text-gray-500">Términos de Servicio</a>{" "}
              y{" "}
              <a href="#" className="underline hover:text-gray-500">Política de Privacidad</a>.
            </p>

            {/* Login redirect */}
            <p className="text-center text-[13px] text-gray-500 mt-4">
              ¿Ya tenés cuenta?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Iniciá sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
