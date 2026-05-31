"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Loader2, AlertCircle } from "lucide-react"
import { api } from "@/lib/api"

function validateEmail(email: string): string | null {
  if (!email) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "El correo no se ve bien, revisalo"
  return null
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)

  const emailError = emailTouched ? validateEmail(email) : null

  const handleEmailBlur = useCallback(() => {
    setEmailTouched(true)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEmailTouched(true)

    if (!email.trim()) {
      setError("Necesitamos tu correo para ayudarte, parce")
      return
    }

    if (validateEmail(email)) {
      setError("El correo no se ve bien, revisalo")
      return
    }

    setLoading(true)
    setError("")

    try {
      await api.forgotPassword(email)
      setSubmitted(true)
    } catch {
      setError("Uy, algo falló. Intentá de nuevo")
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
              {/* Lock illustration */}
              <div className="relative w-48 h-48 mb-10">
                {/* Lock body */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-28 h-24 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex flex-col items-center justify-center gap-3">
                  {/* Keyhole */}
                  <div className="w-5 h-5 rounded-full bg-white/30" />
                  <div className="w-2.5 h-4 bg-white/30 rounded-b-full" />
                </div>
                {/* Lock shackle */}
                <div className="absolute bottom-[108px] left-1/2 -translate-x-1/2 w-16 h-12 border-[3px] border-white/30 rounded-t-2xl border-b-0" />
                {/* Floating key */}
                <div className="absolute top-4 right-4 rotate-[25deg]">
                  <div className="w-8 h-8 rounded-full border-2 border-emerald-400/50 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-400/50" />
                  </div>
                  <div className="w-6 h-1.5 bg-emerald-400/40 rounded-full ml-1 mt-0.5" />
                </div>
                {/* Floating badge */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/15 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                  <span className="text-white text-sm font-semibold">🔐 + 📧 = ✅</span>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
              No te preocupes,<br />
              <span className="text-blue-200">esto tiene solución.</span>
            </h2>
            <p className="text-blue-100/70 text-base leading-relaxed">
              Un correo y listo. Te mandamos el enlace para que vuelvas a la jugada sin perder ni un minuto.
            </p>
          </div>

          {/* Bottom quote */}
          <p className="text-blue-200/40 text-xs">
            &ldquo;Todo se resuelve, parce. Solo hay que saber dónde golpear.&rdquo;
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
        <div className="flex-1 flex items-center justify-center px-6 py-10 lg:py-0">
          <div className="w-full max-w-[380px]">
            {/* Desktop back link */}
            <div className="hidden lg:block mb-8">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors text-sm"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Volver al inicio de sesión
              </Link>
            </div>

            {/* Content — form or success */}
            {submitted ? (
              /* Success state */
              <div className="animate-fade-in">
                {/* Checkmark */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    className="animate-check-draw"
                  >
                    <path
                      d="M8 16.5L13 21.5L24 10.5"
                      stroke="#10B981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-check-stroke"
                    />
                  </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  ¡Listo, parce!
                </h1>
                <p className="text-gray-500 text-[15px] text-center leading-relaxed mb-8">
                  Si el correo coincide con una cuenta activa, recibirás un mensaje en breve.
                  Revisá tu bandeja de entrada{" "}
                  <span className="text-gray-400">(y el spam, parce)</span>.
                </p>

                <Link
                  href="/login"
                  className="block w-full h-12 flex items-center justify-center rounded-xl text-[15px] font-bold bg-primary text-white hover:bg-[#1648c2] transition-all text-center"
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            ) : (
              /* Form state */
              <div className="animate-fade-in">
                {/* Heading */}
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Restablecer contraseña
                  </h1>
                  <p className="text-gray-500 text-[15px] leading-relaxed">
                    Tranqui, esto tiene solución. Introduce tu correo y te mandamos un enlace para que vuelvas a la jugada.
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

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  {/* Email */}
                  <div className="mb-6">
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
                      autoComplete="email"
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

                  {/* CTA */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-xl text-[15px] font-bold bg-primary text-white hover:bg-[#1648c2] disabled:opacity-50 transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar enlace de recuperación"
                    )}
                  </button>
                </form>

                {/* Back to login */}
                <p className="text-center text-[13px] text-gray-500 mt-6">
                  ¿Recordás tu contraseña?{" "}
                  <Link href="/login" className="text-primary font-semibold hover:underline">
                    Iniciá sesión
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
