"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Settings, Bell, Globe, Languages, User, ChevronLeft, Briefcase, GraduationCap, Lock } from "lucide-react"
import { api } from "@/lib/api"

function MaterialIcon({ name, filled = false, className = "" }: { name: string; filled?: boolean; className?: string }) {
  return (
    <span
      className={`material-symbols-outlined ${filled ? "material-symbols-filled" : ""} ${className}`}
      style={{ fontVariationSettings: filled ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : undefined }}
    >
      {name}
    </span>
  )
}

const CEFR_LEVELS = [
  { value: "A1", label: "A1 — Principiante", desc: "Saludos, números, colores" },
  { value: "A2", label: "A2 — Básico", desc: "Situaciones simples del día a día" },
  { value: "B1", label: "B1 — Intermedio", desc: "Entiendo series con subtítulos" },
  { value: "B2", label: "B2 — Intermedio-alto", desc: "Películas sin subtítulos" },
  { value: "C1", label: "C1 — Avanzado", desc: "Uso flexible y profesional" },
  { value: "C2", label: "C2 — Maestría", desc: "Dominio casi nativo" },
]

const CONTEXTS = [
  { value: "general", label: "General", icon: GraduationCap, desc: "Mezcla equilibrada" },
  { value: "work", label: "Trabajo", icon: Briefcase, desc: "Oficina y llamadas", locked: true },
  { value: "travel", label: "Viajes", icon: Briefcase, desc: "Aeropuertos y hoteles", locked: true },
  { value: "gaming", label: "Gaming", icon: Briefcase, desc: "Videojuegos en inglés", locked: true },
]

interface UserData {
  id: string
  email: string
  name?: string
  role: string
  created_at: string
  decks_generated_today: number
  total_decks: number
  total_cards: number
  level?: string
}

// SideNavBar for Settings
function SideNavBar({ onLogout }: { onLogout: () => void }) {
  const navItems = [
    { href: "/dashboard", label: "Panel de Control", icon: "dashboard", active: false },
    { href: "/settings", label: "Configuración", icon: "settings", active: true },
  ]

  const bottomItems = [
    { href: "/help", label: "Ayuda", icon: "help", active: false, placeholder: true },
  ]

  return (
    <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest flex-col py-6 px-4 z-50 border-r border-outline-variant/20">
      <div className="mb-10 px-2">
        <Link href="/dashboard">
          <h1 className="text-2xl font-black text-primary tracking-tighter hover:opacity-80 transition-opacity">AnkiTube Learn</h1>
        </Link>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.placeholder ? "#" : item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 active:scale-95 ${
              item.active
                ? "text-primary font-bold border-r-4 border-primary bg-primary/5"
                : item.placeholder
                ? "text-on-surface-variant/50 cursor-not-allowed"
                : "text-on-surface-variant hover:text-primary hover:bg-surface-container"
            }`}
            onClick={(e) => item.placeholder && e.preventDefault()}
          >
            <MaterialIcon name={item.icon} className="text-xl" />
            <span>{item.label}</span>
            {item.placeholder && (
              <span className="ml-auto text-[10px] uppercase tracking-wider text-on-surface-variant/40 font-medium">Pronto</span>
            )}
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-1 pt-6 border-t border-outline-variant/20">
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.placeholder ? "#" : item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              item.placeholder
                ? "text-on-surface-variant/50 cursor-not-allowed"
                : "text-on-surface-variant hover:text-primary hover:bg-surface-container"
            }`}
            onClick={(e) => item.placeholder && e.preventDefault()}
          >
            <MaterialIcon name={item.icon} className="text-xl" />
            <span>{item.label}</span>
            {item.placeholder && (
              <span className="ml-auto text-[10px] uppercase tracking-wider text-on-surface-variant/40 font-medium">Pronto</span>
            )}
          </Link>
        ))}
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left text-on-surface-variant hover:text-error hover:bg-surface-container"
        >
          <MaterialIcon name="logout" className="text-xl" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState("")

  const [name, setName] = useState("")
  const [notifications, setNotifications] = useState(true)
  const [language, setLanguage] = useState("es")
  const [selectedLevel, setSelectedLevel] = useState("B1")

  useEffect(() => {
    async function loadUserData() {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      try {
        const userData = await api.getCurrentUser()
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
        if (userData.level) setSelectedLevel(userData.level)
        if (userData.name) setName(userData.name)
      } catch (error: unknown) {
        const err = error as { status?: number }
        if (err.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          router.push("/login")
          return
        }
        console.error("Error loading user data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  function handleLogout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  function handleSave() {
    if (user) {
      const updatedUser = { ...user, name, level: selectedLevel }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)
    }
    setSuccess("¡Perfecto! Tu configuración se guardó.")
    setTimeout(() => setSuccess(""), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-surface">
      <SideNavBar onLogout={handleLogout} />

      <main className="md:ml-64 flex-1 p-6 md:p-8 lg:p-12 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-surface-container transition-colors">
            <ChevronLeft className="w-5 h-5 text-on-surface-variant" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">Configuración</h1>
            <p className="text-on-surface-variant font-medium mt-1 text-sm">Personaliza tu experiencia</p>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-primary-container/30 rounded-xl border border-primary/20">
            <p className="text-sm text-on-primary-container">{success}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Tu perfil */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-on-surface">Tu perfil</h2>
            </div>
            <p className="text-sm text-on-surface-variant mb-4">Así es como te saludaremos en tu dashboard.</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre o apodo"
              className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Nivel CEFR */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Languages className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-on-surface">Nivel de Inglés (CEFR)</h2>
            </div>
            <p className="text-sm text-on-surface-variant mb-4">Ajusta la complejidad de las tarjetas generadas.</p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {CEFR_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setSelectedLevel(level.value)}
                  className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl transition-all ${
                    selectedLevel === level.value
                      ? "border-primary bg-primary/5"
                      : "border-outline-variant/30 hover:border-primary/50"
                  }`}
                >
                  <span className={`font-bold ${selectedLevel === level.value ? "text-primary" : "text-on-surface"}`}>
                    {level.value}
                  </span>
                  <span className="text-[10px] text-on-surface-variant">
                    {level.label.split("—")[1]?.trim() || ""}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Contexto (placeholder visual) */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-on-surface">Contexto de aprendizaje</h2>
            </div>
            <p className="text-sm text-on-surface-variant mb-4">Elige el contexto que más se ajuste a tus necesidades.</p>
            <div className="grid grid-cols-2 gap-3">
              {CONTEXTS.map((ctx) => {
                const Icon = ctx.icon
                return (
                  <button
                    key={ctx.value}
                    disabled={ctx.locked}
                    className={`flex items-center gap-3 p-4 border-2 rounded-xl transition-all ${
                      ctx.locked 
                        ? "border-outline-variant/20 bg-surface-container-low opacity-50 cursor-not-allowed" 
                        : "border-outline-variant/30 hover:border-primary/50"
                    }`}
                  >
                    <Icon className="w-5 h-5 text-on-surface-variant" />
                    <div className="text-left">
                      <span className="block font-medium text-on-surface">{ctx.label}</span>
                      <span className="text-xs text-on-surface-variant">{ctx.desc}</span>
                    </div>
                    {ctx.locked && <Lock className="w-4 h-4 ml-auto text-outline" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notificaciones */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-on-surface">Notificaciones</p>
                  <p className="text-sm text-on-surface-variant">Te avisamos cuando tus mazos estén prêts</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications ? "bg-primary" : "bg-outline-variant"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Idioma */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-on-surface">Idioma de la app</h2>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Info de cuenta */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-on-surface">Información de cuenta</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-outline-variant/10">
                <span className="text-on-surface-variant">Email</span>
                <span className="text-on-surface font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-outline-variant/10">
                <span className="text-on-surface-variant">Rol</span>
                <span className="text-on-surface font-medium capitalize">{user.role}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-outline-variant/10">
                <span className="text-on-surface-variant">Mazos generados</span>
                <span className="text-on-surface font-medium">{user.total_decks}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-on-surface-variant">Total tarjetas</span>
                <span className="text-on-surface font-medium">{user.total_cards}</span>
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <MaterialIcon name="check" filled />
            Guardar configuración
          </button>
        </div>
      </main>
    </div>
  )
}