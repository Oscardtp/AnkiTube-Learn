"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

interface UserData {
  id: string
  email: string
  custom_name?: string
  role: string
  level?: string
  plan?: string
}

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]
const CONTEXTS = ["General", "BPO / Call center", "Tecnología", "Negocios"]
const HOURS = ["6:00 am", "7:00 am", "8:00 am", "9:00 am", "12:00 pm", "6:00 pm", "9:00 pm"]

const PLAN_CONFIG = {
  Explorador: {
    badgeClass: "bg-sky-50 text-sky-800 border border-sky-200",
    icon: "ti ti-bolt",
    label: "Explorador",
  },
  Fluente: {
    badgeClass: "bg-blue-50 text-blue-800 border border-blue-200",
    icon: "ti ti-flame",
    label: "Fluente",
  },
  Nativo: {
    badgeClass: "bg-violet-50 text-violet-800 border border-violet-200",
    icon: "ti ti-star",
    label: "Nativo",
  },
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  // Name edit
  const [name, setName] = useState("")
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState("")
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Settings
  const [selectedLevel, setSelectedLevel] = useState("B1")
  const [selectedContext, setSelectedContext] = useState("General")

  // Notifications
  const [notifStudy, setNotifStudy] = useState(false)
  const [studyHour, setStudyHour] = useState("8:00 am")
  const [notifWhatsApp, setNotifWhatsApp] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [notifMonthly, setNotifMonthly] = useState(true)

  // Security expandables
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [pwCurrent, setPwCurrent] = useState("")
  const [pwNew, setPwNew] = useState("")
  const [pwConfirm, setPwConfirm] = useState("")
  const [emailNew, setEmailNew] = useState("")
  const [emailPassword, setEmailPassword] = useState("")

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteEmailInput, setDeleteEmailInput] = useState("")

  // Cancel subscription
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // Toast
  const [toast, setToast] = useState("")

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }
      try {
        const userData = await api.getCurrentUser()
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
        if (userData.custom_name) setName(userData.custom_name)
        if (userData.level) setSelectedLevel(userData.level)
      } catch (err: unknown) {
        const error = err as { status?: number }
        if (error.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          router.push("/login")
          return
        }
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [router])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(""), 2500)
  }

  function startEditName() {
    setNameInput(name)
    setEditingName(true)
    setTimeout(() => nameInputRef.current?.focus(), 50)
  }

  async function saveName() {
    const val = nameInput.trim()
    if (!val) return
    try {
      await api.updateProfile({ custom_name: val })
      setName(val)
      setEditingName(false)
      if (user) {
        const updated = { ...user, custom_name: val }
        setUser(updated)
        localStorage.setItem("user", JSON.stringify(updated))
      }
      showToast("Nombre actualizado")
    } catch {
      showToast("No se pudo guardar el nombre")
    }
  }

  function cancelEditName() {
    setEditingName(false)
  }

  function toggleExpand(section: string) {
    setExpandedSection(expandedSection === section ? null : section)
  }

  function fmtCode(val: string) {
    let v = val.toUpperCase().replace(/[^A-Z0-9]/g, "")
    if (v.length > 4) v = v.slice(0, 4) + "-" + v.slice(4)
    if (v.length > 9) v = v.slice(0, 9) + "-" + v.slice(9)
    return "ANKI-" + v.replace("ANKI-", "").slice(0, 9)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const plan = (user.plan as keyof typeof PLAN_CONFIG) || "Explorador"
  const planCfg = PLAN_CONFIG[plan] || PLAN_CONFIG.Explorador
  const initial = (name || user.email || "U").charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 h-[52px] bg-white border-b border-gray-200 flex items-center px-4 gap-2.5">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors text-[13px] font-medium h-8 px-2 rounded-lg hover:bg-gray-50"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Dashboard
        </button>
        <span className="text-sm font-medium text-primary flex-1 text-center">AnkiTube</span>
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-[11px] font-medium border-[1.5px] border-gray-200">
          {initial}
        </div>
      </nav>

      <div className="pb-10">
        {/* Profile Header */}
        <div className="bg-white py-6 px-4 flex flex-col items-center gap-3 border-b border-gray-200">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-medium border-2 border-gray-200">
            {initial}
          </div>

          {/* Name display / edit */}
          {!editingName ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-gray-900">{name || "Sin nombre"}</span>
              <button
                onClick={startEditName}
                className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                title="Editar nombre"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full max-w-[240px]">
              <input
                ref={nameInputRef}
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") cancelEditName() }}
                maxLength={20}
                className="flex-1 h-9 border border-primary rounded-lg px-2.5 text-[15px] text-center bg-white text-gray-900 outline-none"
              />
              <button onClick={saveName} className="h-8 px-3 bg-primary text-white rounded-[7px] text-xs font-medium hover:bg-[#1648c2] transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </button>
              <button onClick={cancelEditName} className="h-8 px-2.5 border border-gray-200 rounded-[7px] text-xs text-gray-500 hover:bg-gray-50 transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>
          )}

          <span className="text-[13px] text-gray-500">{user.email}</span>
          <span className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium ${planCfg.badgeClass}`}>
            <span className={`${planCfg.icon} text-xs`} />
            {planCfg.label}
          </span>
        </div>

        {/* Tu aprendizaje */}
        <div className="mt-2 bg-white border-y border-gray-200">
          <div className="px-4 pt-3.5 pb-1.5 text-[11px] font-medium tracking-widest uppercase text-gray-400 flex items-center gap-1.5">
            <span className="ti ti-book text-sm" />
            Tu aprendizaje
          </div>

          <div className="flex items-center px-4 py-3 border-b border-gray-100 gap-3 min-h-[52px]">
            <div className="flex-1">
              <div className="text-sm text-gray-900">Nivel CEFR por defecto</div>
              <div className="text-xs text-gray-400 mt-0.5">Se precarga al generar</div>
            </div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="h-8 px-2 border border-gray-200 rounded-lg text-[13px] bg-gray-50 text-gray-900 outline-none cursor-pointer max-w-[120px]"
            >
              {CEFR_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="flex items-center px-4 py-3 gap-3 min-h-[52px]">
            <div className="flex-1">
              <div className="text-sm text-gray-900">Contexto preferido</div>
              <div className={`text-xs mt-0.5 ${plan === "Explorador" ? "text-gray-400" : "text-gray-400"}`}>
                {plan === "Explorador" ? "Solo disponible en Fluente" : "Se precarga al generar"}
              </div>
            </div>
            <select
              value={selectedContext}
              onChange={(e) => setSelectedContext(e.target.value)}
              disabled={plan === "Explorador"}
              className="h-8 px-2 border border-gray-200 rounded-lg text-[13px] bg-gray-50 text-gray-900 outline-none cursor-pointer max-w-[120px] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {CONTEXTS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="mt-2 bg-white border-y border-gray-200">
          <div className="px-4 pt-3.5 pb-1.5 text-[11px] font-medium tracking-widest uppercase text-gray-400 flex items-center gap-1.5">
            <span className="ti ti-bell text-sm" />
            Notificaciones
          </div>

          {/* Study reminder */}
          <div className="flex items-center px-4 py-3 border-b border-gray-100 gap-3 min-h-[52px]">
            <div className="flex-1">
              <div className="text-sm text-gray-900">Recordatorio de estudio</div>
              <div className="text-xs text-gray-400 mt-0.5">Te avisamos cuando tengás tarjetas pendientes</div>
            </div>
            <label className="relative w-[38px] h-[22px] shrink-0 cursor-pointer">
              <input
                type="checkbox"
                checked={notifStudy}
                onChange={(e) => setNotifStudy(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-[38px] h-[22px] rounded-[11px] bg-gray-200 peer-checked:bg-primary transition-colors flex items-center p-0.5">
                <div className="w-[18px] h-[18px] rounded-full bg-white transition-transform peer-checked:translate-x-[16px]" />
              </div>
            </label>
          </div>

          {/* Hour row */}
          {notifStudy && (
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100">
              <span className="text-xs text-gray-500 flex-1 flex items-center gap-1">
                <span className="ti ti-clock text-[13px] -mt-0.5" />
                ¿A qué hora?
              </span>
              <select
                value={studyHour}
                onChange={(e) => setStudyHour(e.target.value)}
                className="h-7 px-1.5 border border-gray-200 rounded-md text-xs bg-gray-50 text-gray-900 outline-none"
              >
                {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          )}

          {/* WhatsApp */}
          <div className="flex items-center px-4 py-3 border-b border-gray-100 gap-3 min-h-[52px]">
            <div className="flex-1">
              <div className="text-sm text-gray-900">Frase del día · WhatsApp</div>
              <div className="text-xs text-gray-400 mt-0.5">1 frase cada mañana, sin spam</div>
            </div>
            <label className="relative w-[38px] h-[22px] shrink-0 cursor-pointer">
              <input
                type="checkbox"
                checked={notifWhatsApp}
                onChange={(e) => setNotifWhatsApp(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-[38px] h-[22px] rounded-[11px] bg-gray-200 peer-checked:bg-primary transition-colors flex items-center p-0.5">
                <div className="w-[18px] h-[18px] rounded-full bg-white transition-transform peer-checked:translate-x-[16px]" />
              </div>
            </label>
          </div>

          {/* WhatsApp number sub-section */}
          {notifWhatsApp && (
            <div className="px-4 py-2.5 border-b border-gray-100">
              <div className="text-xs text-gray-500 mb-1.5">Número de WhatsApp (Colombia)</div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-gray-500">+57</span>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="300 123 4567"
                  maxLength={13}
                  className="flex-1 h-[30px] border border-gray-200 rounded-lg px-2.5 text-xs bg-white text-gray-900 outline-none focus:border-primary"
                />
                <button
                  onClick={() => showToast("Número guardado")}
                  className="h-8 px-3 bg-primary text-white rounded-[7px] text-xs font-medium hover:bg-[#1648c2] transition-colors whitespace-nowrap"
                >
                  Guardar
                </button>
              </div>
            </div>
          )}

          {/* Monthly summary */}
          <div className="flex items-center px-4 py-3 gap-3 min-h-[52px]">
            <div className="flex-1">
              <div className="text-sm text-gray-900">Resumen mensual</div>
              <div className="text-xs text-gray-400 mt-0.5">Tu progreso del mes en un vistazo</div>
            </div>
            <label className="relative w-[38px] h-[22px] shrink-0 cursor-pointer">
              <input
                type="checkbox"
                checked={notifMonthly}
                onChange={(e) => setNotifMonthly(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-[38px] h-[22px] rounded-[11px] bg-gray-200 peer-checked:bg-primary transition-colors flex items-center p-0.5">
                <div className="w-[18px] h-[18px] rounded-full bg-white transition-transform peer-checked:translate-x-[16px]" />
              </div>
            </label>
          </div>
        </div>

        {/* Seguridad */}
        <div className="mt-2 bg-white border-y border-gray-200">
          <div className="px-4 pt-3.5 pb-1.5 text-[11px] font-medium tracking-widest uppercase text-gray-400 flex items-center gap-1.5">
            <span className="ti ti-lock text-sm" />
            Seguridad
          </div>

          {/* Change password */}
          <div
            onClick={() => toggleExpand("password")}
            className="flex items-center px-4 py-3 border-b border-gray-100 gap-3 min-h-[52px] cursor-pointer"
          >
            <span className="text-sm text-gray-900 flex-1">Cambiar contraseña</span>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={`text-gray-400 transition-transform ${expandedSection === "password" ? "rotate-90" : ""}`}
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>
          {expandedSection === "password" && (
            <div className="px-4 pb-3.5 border-b border-gray-100">
              <div className="text-xs text-gray-500 mb-1.5 mt-2.5">Contraseña actual</div>
              <input type="password" value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} placeholder="••••••••" className="w-full h-9 border border-gray-200 rounded-lg px-2.5 text-[13px] bg-white text-gray-900 outline-none focus:border-primary" />
              <div className="text-xs text-gray-500 mb-1.5 mt-2.5">Nueva contraseña</div>
              <input type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} placeholder="Mínimo 8 caracteres" className="w-full h-9 border border-gray-200 rounded-lg px-2.5 text-[13px] bg-white text-gray-900 outline-none focus:border-primary" />
              <div className="text-xs text-gray-500 mb-1.5 mt-2.5">Confirmar nueva contraseña</div>
              <input type="password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} placeholder="Repetí la contraseña" className="w-full h-9 border border-gray-200 rounded-lg px-2.5 text-[13px] bg-white text-gray-900 outline-none focus:border-primary" />
              <div className="flex gap-2 mt-3">
                <button onClick={() => { showToast("Contraseña actualizada"); setExpandedSection(null) }} className="flex-1 h-9 bg-primary text-white rounded-lg text-[13px] font-medium hover:bg-[#1648c2] transition-colors">Actualizar</button>
                <button onClick={() => setExpandedSection(null)} className="h-9 px-3.5 border border-gray-200 rounded-lg text-[13px] text-gray-500 hover:bg-gray-50 transition-colors">Cancelar</button>
              </div>
            </div>
          )}

          {/* Change email */}
          <div
            onClick={() => toggleExpand("email")}
            className="flex items-center px-4 py-3 gap-3 min-h-[52px] cursor-pointer"
          >
            <div className="flex-1">
              <div className="text-sm text-gray-900">Cambiar email</div>
              <div className="text-xs text-gray-400 mt-0.5">{user.email}</div>
            </div>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={`text-gray-400 transition-transform ${expandedSection === "email" ? "rotate-90" : ""}`}
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>
          {expandedSection === "email" && (
            <div className="px-4 pb-3.5 border-b border-gray-100">
              <div className="text-xs text-gray-500 mb-1.5 mt-2.5">Nuevo email</div>
              <input type="email" value={emailNew} onChange={(e) => setEmailNew(e.target.value)} placeholder="tucorreo@gmail.com" className="w-full h-9 border border-gray-200 rounded-lg px-2.5 text-[13px] bg-white text-gray-900 outline-none focus:border-primary" />
              <div className="text-xs text-gray-500 mb-1.5 mt-2.5">Confirmá tu contraseña</div>
              <input type="password" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} placeholder="••••••••" className="w-full h-9 border border-gray-200 rounded-lg px-2.5 text-[13px] bg-white text-gray-900 outline-none focus:border-primary" />
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">Te enviamos un link de confirmación al nuevo correo antes de hacer el cambio.</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => { showToast("Confirmación enviada"); setExpandedSection(null) }} className="flex-1 h-9 bg-primary text-white rounded-lg text-[13px] font-medium hover:bg-[#1648c2] transition-colors">Enviar confirmación</button>
                <button onClick={() => setExpandedSection(null)} className="h-9 px-3.5 border border-gray-200 rounded-lg text-[13px] text-gray-500 hover:bg-gray-50 transition-colors">Cancelar</button>
              </div>
            </div>
          )}
        </div>

        {/* Tu plan */}
        <div className="mt-2 bg-white border-y border-gray-200">
          <div className="px-4 pt-3.5 pb-1.5 text-[11px] font-medium tracking-widest uppercase text-gray-400 flex items-center gap-1.5">
            <span className="ti ti-credit-card text-sm" />
            Tu plan
          </div>

          <div className="px-4 py-3">
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Plan card header */}
              <div className="px-4 py-3.5 bg-gray-50 border-b border-gray-200">
                <div className="text-base font-medium text-gray-900">
                  {plan} <span className="text-xs font-normal text-gray-400">
                    {plan === "Explorador" ? "· gratuito" : "· activo"}
                  </span>
                </div>
                {plan === "Explorador" && (
                  <div className="text-[13px] text-gray-500 mt-0.5">1 mazo por día · máx 15 tarjetas</div>
                )}
                {plan === "Fluente" && (
                  <>
                    <div className="text-[13px] text-blue-700 font-medium mt-0.5">$15.000 COP / mes</div>
                    <div className="text-xs text-gray-400 mt-1">Próxima renovación: 29 jun 2026 · <span className="text-primary cursor-pointer">ver factura</span></div>
                  </>
                )}
                {plan === "Nativo" && (
                  <>
                    <div className="text-[13px] text-violet-700 font-medium mt-0.5">$120.000 COP / año</div>
                    <div className="text-xs text-violet-400 mt-1">Próximo cobro: 15 may 2027 · <span className="text-violet-600 cursor-pointer">ver factura</span></div>
                  </>
                )}
              </div>

              {/* Plan features */}
              <div className="px-4 py-3">
                {plan === "Explorador" && (
                  <>
                    <FeatureItem text="1 mazo al día" locked={false} />
                    <FeatureItem text="Contexto General" locked={false} />
                    <FeatureItem text="Modo estudio básico" locked={false} />
                    <FeatureItem text="Contextos BPO, Tecnología..." locked={true} />
                    <FeatureItem text="Mazos ilimitados" locked={true} />
                  </>
                )}
                {plan === "Fluente" && (
                  <>
                    <FeatureItem text="Mazos ilimitados" locked={false} />
                    <FeatureItem text="Todos los contextos" locked={false} />
                    <FeatureItem text="SRS completo + estadísticas" locked={false} />
                    <FeatureItem text="Frase del día WhatsApp" locked={false} />
                  </>
                )}
                {plan === "Nativo" && (
                  <>
                    <FeatureItem text="Todo lo de Fluente" locked={false} />
                    <FeatureItem text="Soporte directo WhatsApp" locked={false} />
                    <FeatureItem text="Modelo Claude Sonnet" locked={false} />
                    <FeatureItem text="Export historial completo" locked={false} />
                  </>
                )}
              </div>

              {/* Plan actions */}
              <div className="px-4 pb-3.5">
                {plan === "Explorador" ? (
                  <button className="w-full h-10 bg-primary text-white rounded-[9px] text-sm font-medium hover:bg-[#1648c2] transition-colors">
                    Pasarme a Fluente · $15.000/mes →
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full h-9 border border-gray-200 rounded-lg text-[13px] text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar suscripción
                  </button>
                )}
              </div>
            </div>

            {/* Activate code */}
            {plan === "Explorador" && (
              <>
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    placeholder="ANKI-XXXX-XXXX"
                    maxLength={14}
                    onChange={(e) => { e.target.value = fmtCode(e.target.value) }}
                    className="flex-1 h-[34px] border border-gray-200 rounded-lg px-2.5 text-xs font-mono bg-white text-gray-900 outline-none tracking-wider focus:border-primary"
                  />
                  <button className="h-[34px] px-3 border border-primary rounded-lg text-xs font-medium text-primary hover:bg-primary/5 transition-colors whitespace-nowrap">
                    Activar código
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">¿Tenés un código de acceso? Activalo aquí.</p>
              </>
            )}
          </div>
        </div>

        {/* Danger zone */}
        <div className="mt-2 bg-white border-y border-gray-200 px-4 py-4">
          <div className="text-[11px] font-medium tracking-widest uppercase text-red-500 mb-2.5 flex items-center gap-1.5">
            <span className="ti ti-alert-triangle text-sm" />
            Zona de peligro
          </div>
          <p className="text-xs text-gray-400 mb-3 leading-relaxed">
            Al eliminar tu cuenta se borran permanentemente todos tus mazos, estadísticas y progreso. Esta acción no se puede deshacer.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full h-9 border border-red-400 rounded-lg text-[13px] text-red-500 hover:bg-red-50 transition-colors"
          >
            Eliminar mi cuenta
          </button>
        </div>
      </div>

      {/* Delete confirmation sheet */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center" style={{ background: "rgba(0,0,0,.45)" }}>
          <div className="bg-white rounded-t-[14px] w-full max-w-[390px] p-5 pb-6 animate-slide-up">
            <div className="text-[15px] font-medium text-gray-900 mb-2">¿Eliminás tu cuenta?</div>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-4">
              Se borran todos tus mazos y progreso. Para confirmar escribí tu email abajo.
            </p>
            <div className="text-xs text-gray-500 mb-1.5">Tu email</div>
            <input
              type="email"
              value={deleteEmailInput}
              onChange={(e) => setDeleteEmailInput(e.target.value)}
              placeholder={user.email}
              className="w-full h-9 border border-gray-200 rounded-lg px-2.5 text-[13px] bg-white text-gray-900 outline-none focus:border-red-400 mb-4"
            />
            <button
              disabled={deleteEmailInput !== user.email}
              onClick={() => { showToast("Cuenta eliminada"); setShowDeleteConfirm(false) }}
              className={`w-full h-10 bg-red-500 text-white rounded-[9px] text-sm font-medium transition-opacity ${deleteEmailInput === user.email ? "opacity-100" : "opacity-40 cursor-not-allowed"}`}
            >
              Eliminar mi cuenta para siempre
            </button>
            <button
              onClick={() => { setShowDeleteConfirm(false); setDeleteEmailInput("") }}
              className="w-full h-9 mt-2 border border-gray-200 rounded-lg text-[13px] text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Cancel subscription confirmation */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center" style={{ background: "rgba(0,0,0,.45)" }}>
          <div className="bg-white rounded-t-[14px] w-full max-w-[390px] p-5 pb-6 animate-slide-up">
            <div className="text-[15px] font-medium text-gray-900 mb-2">¿Cancelás tu suscripción?</div>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-4">
              Tu plan {plan} sigue activo hasta el próximo periodo. Después volvés al plan Explorador sin perder tus mazos ni tu progreso.
            </p>
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="w-full h-10 bg-primary text-white rounded-[9px] text-sm font-medium hover:bg-[#1648c2] transition-colors mb-2"
            >
              Mantener mi plan {plan}
            </button>
            <button
              onClick={() => { setShowCancelConfirm(false); showToast("Suscripción cancelada") }}
              className="w-full h-9 border border-gray-200 rounded-lg text-[13px] text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Sí, cancelar de todas formas
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3.5 py-2 rounded-lg whitespace-nowrap z-[110] animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  )
}

function FeatureItem({ text, locked }: { text: string; locked: boolean }) {
  return (
    <div className="flex items-center gap-[7px] py-1 text-xs">
      {locked ? (
        <span className="ti ti-lock text-gray-400 text-sm" />
      ) : (
        <span className="ti ti-check text-emerald-500 text-sm" />
      )}
      <span className={locked ? "text-gray-400" : "text-gray-600"}>{text}</span>
    </div>
  )
}
