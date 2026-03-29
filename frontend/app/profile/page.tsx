"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle, User, Mail, Shield, Calendar } from "lucide-react"

interface UserData {
  id: string
  email: string
  role: string
  setup_wizard_completed: boolean
  generations_today: number
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }

    setLoading(false)
  }, [])

  function handleLogout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
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

  const roleColors: Record<string, string> = {
    user: "bg-surface-container-variant text-on-surface-variant",
    tester: "bg-primary-container/30 text-on-primary-container",
    premium: "bg-yellow-500/20 text-yellow-700",
    superadmin: "bg-error-container/30 text-on-error-container",
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface mb-2">Mi perfil</h1>
        <p className="text-on-surface-variant">Gestiona tu cuenta y preferencias</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container/30 rounded-xl border border-error/20">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-error" />
            <p className="text-sm text-on-error-container">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* User info card */}
        <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary-container/30 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-on-surface">{user.email}</h2>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || roleColors.user}`}>
                {user.role}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-on-surface-variant" />
              <div>
                <p className="text-sm text-on-surface-variant">Email</p>
                <p className="text-on-surface">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-on-surface-variant" />
              <div>
                <p className="text-sm text-on-surface-variant">Rol</p>
                <p className="text-on-surface capitalize">{user.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-on-surface-variant" />
              <div>
                <p className="text-sm text-on-surface-variant">Generaciones hoy</p>
                <p className="text-on-surface">{user.generations_today}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20">
          <h3 className="text-lg font-semibold text-on-surface mb-4">Acciones rápidas</h3>

          <div className="space-y-3">
            <button
              onClick={() => router.push("/my-decks")}
              className="w-full flex items-center justify-between p-4 bg-surface-container rounded-xl hover:bg-surface-container-variant transition-colors"
            >
              <span className="text-on-surface">Ver mis mazos</span>
              <span className="text-on-surface-variant">→</span>
            </button>

            <button
              onClick={() => router.push("/generate")}
              className="w-full flex items-center justify-between p-4 bg-surface-container rounded-xl hover:bg-surface-container-variant transition-colors"
            >
              <span className="text-on-surface">Generar nuevo mazo</span>
              <span className="text-on-surface-variant">→</span>
            </button>

            <button
              onClick={() => router.push("/settings")}
              className="w-full flex items-center justify-between p-4 bg-surface-container rounded-xl hover:bg-surface-container-variant transition-colors"
            >
              <span className="text-on-surface">Configuración</span>
              <span className="text-on-surface-variant">→</span>
            </button>

            {user.role === "superadmin" && (
              <button
                onClick={() => router.push("/admin")}
                className="w-full flex items-center justify-between p-4 bg-surface-container rounded-xl hover:bg-surface-container-variant transition-colors"
              >
                <span className="text-on-surface">Panel de administración</span>
                <span className="text-on-surface-variant">→</span>
              </button>
            )}
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full bg-error-container/30 text-on-error-container py-3 px-6 rounded-xl font-semibold hover:bg-error-container/50 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
