"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import MinimalNavbar from "@/components/MinimalNavbar"

interface UserData {
  id: string
  email: string
  role: string
  created_at: string
  decks_generated_today: number
  total_decks: number
  total_cards: number
}

const cefrLevels = [
  { code: "A1", label: "Inicial", selected: false },
  { code: "A2", label: "Básico", selected: false },
  { code: "B1", label: "Intermedio", selected: true },
  { code: "B2", label: "Intermedio-Alto", selected: false },
  { code: "C1", label: "Avanzado", selected: false },
  { code: "C2", label: "Maestría", selected: false },
]

const professionalContexts = [
  { id: "software", label: "Software & Tech", description: "Agile, Code, APIs", selected: true },
  { id: "medicine", label: "Medicina", description: "Clinical, Anatomy", selected: false },
  { id: "business", label: "Negocios", description: "Marketing, Sales", selected: false },
  { id: "law", label: "Derecho", description: "Legal, Contracts", selected: false },
  { id: "engineering", label: "Ingeniería", description: "Design, Structural", selected: false },
  { id: "other", label: "Otro...", description: "Contexto general", selected: false },
]

// Material Symbols Icon Component
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

// CEFR Level Selector Component
function CefrLevelSelector({ levels, selectedLevel, onSelect }: { levels: typeof cefrLevels; selectedLevel: string; onSelect: (code: string) => void }) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {levels.map((level) => (
        <button
          key={level.code}
          onClick={() => onSelect(level.code)}
          className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all duration-200 ${
            selectedLevel === level.code
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container"
          }`}
        >
          <span className={`font-bold text-lg ${selectedLevel === level.code ? "text-primary" : "text-on-surface"}`}>
            {level.code}
          </span>
          <span className={`text-[10px] uppercase ${selectedLevel === level.code ? "text-primary" : "text-on-surface-variant"}`}>
            {level.label}
          </span>
        </button>
      ))}
    </div>
  )
}

// Professional Context Selector Component
function ContextSelector({ contexts, selectedContext, onSelect }: { contexts: typeof professionalContexts; selectedContext: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {contexts.map((context) => (
        <label
          key={context.id}
          className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
            selectedContext === context.id
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-outline-variant/30 hover:bg-surface-container"
          }`}
        >
          <input
            type="radio"
            name="context"
            checked={selectedContext === context.id}
            onChange={() => onSelect(context.id)}
            className="text-primary focus:ring-primary h-4 w-4"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-on-surface">{context.label}</span>
            <span className="text-xs text-on-surface-variant">{context.description}</span>
          </div>
        </label>
      ))}
    </div>
  )
}

// Fixed Bottom Nav for Mobile
function MobileBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-outline-variant/20 flex justify-around py-3 px-2 z-50 shadow-lg">
      <Link href="/dashboard" className="flex flex-col items-center gap-1 text-on-surface-variant">
        <MaterialIcon name="home" className="text-2xl" />
        <span className="text-[10px]">Inicio</span>
      </Link>
      <Link href="/my-decks" className="flex flex-col items-center gap-1 text-on-surface-variant">
        <MaterialIcon name="history_edu" className="text-2xl" />
        <span className="text-[10px]">Estudiar</span>
      </Link>
      <Link href="/profile" className="flex flex-col items-center gap-1 text-primary">
        <MaterialIcon name="settings" className="text-2xl" />
        <span className="text-[10px]">Ajustes</span>
      </Link>
    </nav>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("B1")
  const [selectedContext, setSelectedContext] = useState("software")
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setEmail(parsedUser.email)
      setName(parsedUser.email.split("@")[0])
    }

    setLoading(false)
  }, [router])

  function handleSave() {
    setIsSaving(true)
    // Simulate save
    setTimeout(() => {
      setIsSaving(false)
      alert("¡Cambios guardados!")
    }, 1000)
  }

  function handleCancel() {
    router.back()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant font-medium">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-surface">
      <MinimalNavbar />

      {/* Header */}
      <header className="flex items-center justify-between border-b border-outline-variant/20 px-6 py-4 lg:px-40 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <MaterialIcon name="account_circle" className="text-3xl text-primary" />
          <h2 className="text-on-surface text-lg font-bold leading-tight tracking-tight">Perfil y Configuración</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors" title="Notificaciones">
            <MaterialIcon name="notifications" className="text-xl" />
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center rounded-lg h-10 w-10 bg-primary text-white hover:bg-primary-container transition-colors disabled:opacity-50"
            title="Guardar"
          >
            <MaterialIcon name="save" className="text-xl" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 lg:px-40 py-8">
        <div className="max-w-[800px] mx-auto flex flex-col gap-8 md:gap-10">
          {/* Profile Header */}
          <section className="flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <div className="bg-primary rounded-full h-24 w-24 md:h-32 md:w-32 border-4 border-primary shadow-lg flex items-center justify-center">
                <span className="text-4xl md:text-5xl font-bold text-white">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-md border-2 border-white hover:bg-primary-container transition-colors" title="Editar avatar">
                <MaterialIcon name="edit" className="text-sm" />
              </button>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-on-surface">{name}</h1>
              <p className="text-on-surface-variant text-sm md:text-base">Personaliza tu experiencia de aprendizaje asistida por IA</p>
            </div>
          </section>

          {/* Personal Information */}
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-card border border-outline-variant/10">
            <div className="flex items-center gap-2 mb-6">
              <MaterialIcon name="person" className="text-primary text-xl" />
              <h2 className="text-xl font-bold text-on-surface">Información Personal</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-on-surface-variant">Nombre Completo</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input rounded-lg border-outline-variant/30 focus:border-primary focus:ring-primary h-12 w-full bg-surface"
                  placeholder="Ej. Carlos Méndez"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-on-surface-variant">Correo Electrónico</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input rounded-lg border-outline-variant/30 focus:border-primary focus:ring-primary h-12 w-full bg-surface"
                  placeholder="carlos@ejemplo.com"
                />
              </label>
            </div>
          </section>

          {/* English Proficiency Level */}
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-card border border-outline-variant/10">
            <div className="flex items-center gap-2 mb-2">
              <MaterialIcon name="translate" className="text-primary text-xl" />
              <h2 className="text-xl font-bold text-on-surface">Nivel de Inglés</h2>
            </div>
            <p className="text-sm text-on-surface-variant mb-6">
              Selecciona tu nivel actual según el MCER para ajustar la complejidad de las tarjetas.
            </p>
            <CefrLevelSelector
              levels={cefrLevels}
              selectedLevel={selectedLevel}
              onSelect={setSelectedLevel}
            />
          </section>

          {/* Professional Context */}
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-card border border-outline-variant/10">
            <div className="flex items-center gap-2 mb-2">
              <MaterialIcon name="work" className="text-primary text-xl" />
              <h2 className="text-xl font-bold text-on-surface">Contexto Profesional</h2>
            </div>
            <p className="text-sm text-on-surface-variant mb-6">
              La IA generará vocabulario y ejemplos específicos para tu industria.
            </p>
            <ContextSelector
              contexts={professionalContexts}
              selectedContext={selectedContext}
              onSelect={setSelectedContext}
            />
          </section>

          {/* Anki Integration */}
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-card border border-outline-variant/10 mb-8 md:mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary p-3 rounded-lg text-white">
                  <MaterialIcon name="sync" className="text-3xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-on-surface">Integración con Anki</h2>
                  <p className="text-sm text-on-surface-variant">
                    Sincroniza automáticamente tus tarjetas generadas con tu cuenta de AnkiWeb.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 md:flex-none px-6 py-2 bg-surface-container font-semibold rounded-lg text-sm border border-outline-variant/30 text-on-surface hover:bg-surface-container-high transition-colors">
                  Configurar Deck
                </button>
                <button className="flex-1 md:flex-none px-6 py-2 bg-primary text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-primary-container transition-colors">
                  <MaterialIcon name="link" className="text-sm" />
                  Vincular Cuenta
                </button>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-outline-variant/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">Estado de Sincronización:</span>
                <span className="text-error font-medium flex items-center gap-1">
                  <MaterialIcon name="error" className="text-xs" />
                  No vinculado
                </span>
              </div>
            </div>
          </section>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mb-20 md:mb-8">
            <button
              onClick={handleCancel}
              className="w-full sm:w-auto px-8 py-3 text-on-surface-variant font-medium hover:bg-surface-container rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto px-10 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <MaterialIcon name="check_circle" className="text-lg" />
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Nav for Mobile */}
      <MobileBottomNav />
    </div>
  )
}
