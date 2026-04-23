"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle, Settings, Bell, Palette, Globe, Languages, User } from "lucide-react"
import MinimalNavbar from "@/components/MinimalNavbar"

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

const cefrLevels = [
  { code: "A1", label: "Inicial" },
  { code: "A2", label: "Básico" },
  { code: "B1", label: "Intermedio" },
  { code: "B2", label: "Intermedio-Alto" },
  { code: "C1", label: "Avanzado" },
  { code: "C2", label: "Maestría" },
]

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Settings state
  const [name, setName] = useState("")
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState("es")
  const [selectedLevel, setSelectedLevel] = useState("B1")

  useEffect(() => {
    async function loadUserData() {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const userData = localStorage.getItem("user")
      if (userData) {
        const parsed = JSON.parse(userData)
        setUser(parsed)
        if (parsed.level) setSelectedLevel(parsed.level)
        if (parsed.name) setName(parsed.name)
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
        const res = await fetch(`${apiUrl}/api/auth/me`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })

        if (res.ok) {
          const userData = await res.json()
          setUser(userData)
          localStorage.setItem("user", JSON.stringify(userData))
          if (userData.level) setSelectedLevel(userData.level)
          if (userData.name) setName(userData.name)
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  function handleSave() {
    if (user) {
      const updatedUser = { ...user, name, level: selectedLevel }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)
    }
    setSuccess("¡Perfecto! Tu perfil se guardó. ¡Hágale pues!")
    setTimeout(() => setSuccess(""), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-surface">
      <MinimalNavbar />
      <div className="p-6 max-w-2xl mx-auto pt-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-on-surface mb-2">Configuración</h1>
          <p className="text-on-surface-variant">Personaliza tu experiencia en AnkiTube</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error-container/30 rounded-xl border border-error/20">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-error" />
              <p className="text-sm text-on-error-container">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-primary-container/30 rounded-xl border border-primary/20">
            <p className="text-sm text-on-primary-container">{success}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Nombre */}
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-on-surface">¿Cómo quieres que te llamemos?</h2>
            </div>
            <p className="text-sm text-on-surface-variant mb-4">
              Así es como te saludaremos en tu dashboard.
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre o apodo"
              className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Nivel de Inglés */}
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20">
            <div className="flex items-center gap-3 mb-4">
              <Languages className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-on-surface">Nivel de Inglés (CEFR)</h2>
            </div>
            <p className="text-sm text-on-surface-variant mb-4">
              Ajusta la complejidad de las tarjetas generadas.
            </p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {cefrLevels.map((level) => (
                <button
                  key={level.code}
                  onClick={() => setSelectedLevel(level.code)}
                  className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg transition-all ${
                    selectedLevel === level.code
                      ? "border-primary bg-primary/5"
                      : "border-outline-variant/30 hover:border-primary/50"
                  }`}
                >
                  <span className={`font-bold ${selectedLevel === level.code ? "text-primary" : "text-on-surface"}`}>
                    {level.code}
                  </span>
                  <span className={`text-[10px] ${selectedLevel === level.code ? "text-primary" : "text-on-surface-variant"}`}>
                    {level.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-on-surface">Notificaciones</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-on-surface">Recibir notificaciones</p>
              <p className="text-sm text-on-surface-variant">Te avisamos cuando tus mazos estén listos</p>
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

          {/* Appearance */}
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-on-surface">Apariencia</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-on-surface">Modo oscuro</p>
              <p className="text-sm text-on-surface-variant">Cambia el tema de la aplicación</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                darkMode ? "bg-primary" : "bg-outline-variant"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  darkMode ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          </div>

          {/* Language */}
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-on-surface">Idioma</h2>
          </div>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="pt">Português</option>
          </select>
          </div>

          {/* Account info */}
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-on-surface">Información de cuenta</h2>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Email</span>
              <span className="text-on-surface">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Rol</span>
              <span className="text-on-surface capitalize">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Generaciones hoy</span>
              <span className="text-on-surface">{user.decks_generated_today}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Total mazos</span>
              <span className="text-on-surface">{user.total_decks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Total tarjetas</span>
              <span className="text-on-surface">{user.total_cards}</span>
            </div>
          </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Guardar configuración
          </button>
        </div>
      </div>
    </div>
  )
}
