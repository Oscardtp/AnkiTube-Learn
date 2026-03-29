"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import MinimalNavbar from "@/components/MinimalNavbar"
import { api } from "@/lib/api"

// Types
interface User {
  id: string
  email: string
  role: string
  created_at: string
  decks_generated_today: number
  total_decks: number
  total_cards: number
  level?: string
}

interface UserStats {
  cardsCreated: number
  studyStreak: number
  decksGenerated: number
}

interface Deck {
  deck_id: string
  video_title: string
  video_thumbnail: string
  video_id: string
  level: string
  context: string
  total_cards: number
  model_used: string
  created_at: string
}

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

// SideNavBar Component
function SideNavBar({ onLogout, user }: { onLogout: () => void; user: User | null }) {
  const navItems = [
    { href: "/dashboard", label: "Panel de Control", icon: "dashboard", active: true },
    { href: "/my-decks", label: "Mis Mazos", icon: "library_books", active: false },
    { href: "/stats", label: "Estadísticas", icon: "leaderboard", active: false, placeholder: true },
    { href: "/explore", label: "Explorar", icon: "explore", active: false, placeholder: true },
    { href: "/settings", label: "Configuración", icon: "settings", active: false },
  ]

  const bottomItems = [
    { href: "/help", label: "Ayuda", icon: "help", active: false, placeholder: true },
  ]

  return (
    <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest flex-col py-6 px-4 z-50 border-r border-outline-variant/20">
      {/* Logo */}
      <div className="mb-10 px-2">
        <h1 className="text-2xl font-black text-primary tracking-tighter">AnkiTube Learn</h1>
        <p className="text-xs font-medium text-on-surface-variant mt-1">
          {user?.level ? (
            `Nivel ${user.level}`
          ) : (
            <Link href="/profile" className="hover:text-primary transition-colors">
              Configura tu nivel
            </Link>
          )}
        </p>
      </div>

      {/* Main Navigation */}
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

      {/* Bottom Navigation */}
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
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-all duration-200 w-full"
        >
          <MaterialIcon name="logout" className="text-xl" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}

// Stats Card Component
function StatsCard({ icon, label, value, iconBg, iconColor }: { icon: string; label: string; value: string; iconBg: string; iconColor: string }) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-card border border-outline-variant/10 flex items-center gap-5 transition-transform hover:-translate-y-1 duration-300">
      <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center ${iconColor}`}>
        <MaterialIcon name={icon} className="text-2xl" />
      </div>
      <div>
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-on-surface">{value}</p>
      </div>
    </div>
  )
}

// Deck Card Component
function DeckCard({ deck }: { deck: Deck }) {
  return (
    <div className="group bg-surface-container-lowest rounded-3xl overflow-hidden shadow-card border border-outline-variant/10 transition-all hover:shadow-elevated hover:shadow-primary/5">
      {/* Thumbnail */}
      <div className="aspect-video relative overflow-hidden">
        <img
          src={deck.video_thumbnail}
          alt={`Miniatura de ${deck.video_title}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md">{deck.total_cards} tarjetas</span>
          <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-tighter">{deck.level}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h4 className="text-lg font-bold text-on-surface leading-snug mb-4 group-hover:text-primary transition-colors line-clamp-2">
          {deck.video_title}
        </h4>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs">
            <MaterialIcon name="event" className="text-sm" />
            <span>{new Date(deck.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant font-bold text-xs">
            <MaterialIcon name="auto_stories" className="text-sm" />
            <span>{deck.total_cards} tarjetas</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`/preview/${deck.deck_id}`}
            className="bg-primary text-white py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2"
          >
            <MaterialIcon name="play_arrow" filled className="text-sm" />
            Ver mazo
          </Link>
          <button className="bg-surface-container-high text-on-surface py-2.5 rounded-xl font-bold text-sm hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2">
            <MaterialIcon name="download" className="text-sm" />
            Exportar
          </button>
        </div>
      </div>
    </div>
  )
}

// Monthly Usage Indicator Component
function MonthlyUsageIndicator({ totalCards }: { totalCards: number }) {
  const maxCards = 1000
  const percentage = Math.min((totalCards / maxCards) * 100, 100)
  
  return (
    <div className="fixed bottom-8 right-8 z-50 hidden lg:block">
      <div className="glass-panel p-6 rounded-3xl shadow-2xl border border-white/50 w-72">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-black text-on-surface uppercase tracking-widest">Uso del mes</span>
          <span className="text-xs font-bold text-primary">{percentage.toFixed(0)}%</span>
        </div>
        <div className="h-2 w-full bg-surface-container-highest rounded-full mb-3 overflow-hidden">
          <div
            className="h-full bg-secondary rounded-full shadow-[0_0_12px_rgba(0,108,73,0.3)]"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <p className="text-[10px] font-bold text-on-surface-variant">
            <span className="text-on-surface">{totalCards}</span> / {maxCards} tarjetas
          </p>
          <button className="text-[10px] font-black text-primary hover:text-primary-container transition-colors uppercase tracking-widest">
            Upgrade
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [urlInput, setUrlInput] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<UserStats>({
    cardsCreated: 0,
    studyStreak: 0,
    decksGenerated: 0
  })
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUserData() {
      try {
        // Primero cargar desde localStorage
        const storedUser = localStorage.getItem("user")
        const token = localStorage.getItem("token")
        
        if (!token) {
          router.push("/login")
          return
        }

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          setStats({
            cardsCreated: parsedUser.total_cards || 0,
            studyStreak: 0, // TODO: Implementar racha de estudio
            decksGenerated: parsedUser.total_decks || 0
          })
        }

        // Luego actualizar desde el backend
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
          setStats({
            cardsCreated: userData.total_cards || 0,
            studyStreak: 0, // TODO: Implementar racha de estudio
            decksGenerated: userData.total_decks || 0
          })
        }

        // Cargar decks del usuario (solo si hay token)
        if (token) {
          try {
            const decksData = await api.getMyDecks()
            setDecks(decksData.decks)
          } catch (deckError) {
            console.error("Error loading decks:", deckError)
            // No redirigir, solo mostrar error en consola
          }
        }
      } catch (error) {
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

  function handleGenerate() {
    if (urlInput.trim()) {
      router.push(`/generate?url=${encodeURIComponent(urlInput)}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant font-medium">Cargando tu dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <MinimalNavbar />
      <SideNavBar onLogout={handleLogout} user={user} />

      {/* Main Content */}
      <main className="md:ml-64 flex-1 p-6 md:p-8 lg:p-12 max-w-[1600px]">
        {/* TopAppBar */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
              ¡Hola de nuevo, {user?.email?.split("@")[0] || "Usuario"}!
            </h2>
            <p className="text-on-surface-variant font-medium mt-1 text-sm md:text-base">
              ¿Listo para otro video? Tu progreso hoy va volando.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors" title="Notificaciones">
                <MaterialIcon name="notifications" className="text-on-surface-variant text-2xl" />
              </button>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-surface" />
            </div>
            {/* User Info */}
            <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-on-surface">{user?.email || "Usuario"}</p>
                <p className="text-xs text-on-surface-variant">{user?.role || "Estudiante"}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                <span className="text-lg font-bold text-primary">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          <StatsCard
            icon="style"
            label="Tarjetas creadas"
            value={stats.cardsCreated.toLocaleString()}
            iconBg="bg-primary/10"
            iconColor="text-primary"
          />
          <StatsCard
            icon="local_fire_department"
            label="Racha de estudio"
            value={`${stats.studyStreak} días`}
            iconBg="bg-secondary/10"
            iconColor="text-secondary"
          />
          <StatsCard
            icon="auto_stories"
            label="Mazos generados"
            value={stats.decksGenerated.toString()}
            iconBg="bg-tertiary-fixed"
            iconColor="text-tertiary"
          />
          <StatsCard
            icon="bolt"
            label="Generaciones hoy"
            value={(user?.decks_generated_today || 0).toString()}
            iconBg="bg-warning/10"
            iconColor="text-warning"
          />
        </div>

        {/* Generator Section */}
        <section className="mb-8 md:mb-16">
          <div className="bg-primary rounded-[2rem] p-6 md:p-8 lg:p-12 relative overflow-hidden shadow-2xl shadow-primary/20">
            {/* Abstract Background Patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-container/30 rounded-full -ml-10 -mb-10 blur-2xl" />

            <div className="relative z-10 max-w-2xl">
              <h3 className="text-white text-2xl md:text-3xl font-extrabold mb-4 leading-tight">
                Generar nuevo mazo
              </h3>
              <p className="text-primary-container brightness-150 font-medium mb-6 md:mb-8 text-base md:text-lg">
                Pega el link y yo me encargo del resto. ¡Hágale pues!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <MaterialIcon name="link" className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 text-xl" />
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full pl-12 pr-4 py-4 rounded-full bg-white border-none focus:ring-4 focus:ring-primary-container/50 text-on-surface font-medium placeholder:text-slate-400 shadow-lg"
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  />
                </div>
                <button
                  onClick={handleGenerate}
                  className="bg-secondary text-white px-8 md:px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Generar</span>
                  <MaterialIcon name="bolt" filled className="text-xl" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Decks Grid */}
        <section>
          <div className="flex justify-between items-end mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-black text-on-surface tracking-tight">
              Tus mazos recientes
            </h3>
            <Link
              href="/my-decks"
              className="text-primary font-bold text-sm flex items-center gap-1 hover:underline"
            >
              Ver toda la biblioteca
              <MaterialIcon name="arrow_forward" className="text-sm" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {/* Deck Cards */}
            {decks.length > 0 ? (
              decks.map((deck) => (
                <DeckCard key={deck.deck_id} deck={deck} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4 mx-auto text-on-surface-variant">
                  <MaterialIcon name="library_books" className="text-3xl" />
                </div>
                <h4 className="font-bold text-on-surface mb-2">No tienes mazos aún</h4>
                <p className="text-sm text-on-surface-variant max-w-[300px] mx-auto mb-6">
                  Genera tu primer mazo pegando un link de YouTube arriba
                </p>
              </div>
            )}

            {/* Placeholder Card */}
            <div className="group bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center p-8 text-center transition-all hover:bg-white hover:border-primary/40">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4 text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <MaterialIcon name="add_circle" className="text-3xl" />
              </div>
              <h4 className="font-bold text-on-surface mb-2">¿Más lecciones?</h4>
              <p className="text-sm text-on-surface-variant max-w-[200px] mb-6">
                Tu curiosidad no tiene límites. Pega otro video y sigue creciendo.
              </p>
              <Link
                href="/generate"
                className="text-primary font-extrabold text-sm uppercase tracking-widest hover:underline"
              >
                Crear Ahora
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Monthly Usage Indicator */}
      <MonthlyUsageIndicator totalCards={stats.cardsCreated} />
    </div>
  )
}
