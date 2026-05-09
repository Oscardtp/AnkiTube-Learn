"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Play,
  ChevronDown,
  Briefcase,
  Plane,
  Gamepad2,
  GraduationCap,
  Loader2,
  Plus,
  Youtube,
  LogOut,
  Settings,
  Home,
  LayoutDashboard,
  Sparkles,
  Download,
  Calendar,
  Layers,
  Zap,
  Flame,
  Menu,
  X,
} from "lucide-react"
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
  name?: string
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

// CEFR Levels
const CEFR_LEVELS = [
  { value: "A1", label: "A1 — Principiante" },
  { value: "A2", label: "A2 — Basico" },
  { value: "B1", label: "B1 — Intermedio" },
  { value: "B2", label: "B2 — Intermedio-alto" },
  { value: "C1", label: "C1 — Avanzado" },
  { value: "C2", label: "C2 — Maestria" },
]

// Context options
const CONTEXTS = [
  { value: "general", label: "General", icon: GraduationCap },
  { value: "work", label: "Trabajo", icon: Briefcase },
  { value: "travel", label: "Viajes", icon: Plane },
  { value: "gaming", label: "Gaming", icon: Gamepad2 },
]

// Sidebar Component
function Sidebar({ user, onLogout, isOpen, onClose }: { user: User | null; onLogout: () => void; isOpen: boolean; onClose: () => void }) {
  const navItems = [
    { href: "/dashboard", label: "Panel", icon: LayoutDashboard, active: true },
    { href: "#", label: "Configuracion", icon: Settings, disabled: true },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen w-64 bg-card border-r border-outline/10 flex flex-col z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-outline/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <span className="font-bold text-foreground">AnkiTube</span>
              {user?.level && (
                <p className="text-xs text-muted-foreground">Nivel {user.level}</p>
              )}
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.disabled ? "#" : item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${item.active 
                  ? "bg-primary/10 text-primary font-medium" 
                  : item.disabled
                    ? "text-muted-foreground/50 cursor-not-allowed"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }
              `}
              onClick={(e) => {
                if (item.disabled) e.preventDefault()
                onClose()
              }}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.disabled && (
                <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">
                  Pronto
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-outline/10 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            onClick={onClose}
          >
            <Home className="w-5 h-5" />
            <span>Ir al inicio</span>
          </Link>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesion</span>
          </button>
        </div>
      </aside>
    </>
  )
}

// Stats Card Component
function StatsCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="bg-card border border-outline/10 rounded-xl p-5">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  )
}

// Deck Card Component
function DeckCard({ deck }: { deck: Deck }) {
  return (
    <div className="group bg-card border border-outline/10 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-black/5 transition-all">
      {/* Thumbnail */}
      <div className="aspect-video relative overflow-hidden">
        <img
          src={deck.video_thumbnail}
          alt={deck.video_title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="bg-white/20 backdrop-blur-md text-white text-xs font-medium px-2 py-1 rounded-md">
            {deck.total_cards} tarjetas
          </span>
          <span className="bg-primary text-white text-xs font-medium px-2 py-1 rounded-md uppercase">
            {deck.level}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {deck.video_title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{new Date(deck.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            <span>{deck.total_cards} tarjetas</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/preview/${deck.deck_id}`}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all"
          >
            <Play className="w-4 h-4" />
            Ver mazo
          </Link>
          <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted text-foreground font-medium text-sm hover:bg-muted/80 transition-all">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>
    </div>
  )
}

// Empty State Component
function EmptyState() {
  return (
    <div className="bg-card border border-outline/10 border-dashed rounded-2xl p-12 text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Layers className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Todavia no tienes mazos
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        Genera tu primer mazo pegando un link de YouTube arriba. Es gratis y toma menos de un minuto.
      </p>
      <a 
        href="#generator"
        className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
      >
        <Plus className="w-4 h-4" />
        Crear mi primer mazo
      </a>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [urlInput, setUrlInput] = useState("")
  const [level, setLevel] = useState("B1")
  const [context, setContext] = useState("general")
  const [user, setUser] = useState<User | null>(null)
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function loadUserData() {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        try {
          const userData = await api.getCurrentUser()
          setUser({
            ...userData,
            name: userData.name || userData.email?.split("@")[0] || "Usuario"
          })
          localStorage.setItem("user", JSON.stringify(userData))
        } catch (err: unknown) {
          const error = err as { status?: number }
          if (error.status === 401) {
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            router.push("/login")
            return
          }
        }

        try {
          const decksData = await api.getMyDecks()
          setDecks(decksData.decks)
        } catch (deckError) {
          console.error("Error loading decks:", deckError)
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

  async function handleGenerate() {
    if (!urlInput.trim()) {
      setError("Pega el link del video primero, parcero")
      return
    }

    const isValidUrl = urlInput.includes("youtube.com/watch") || urlInput.includes("youtu.be/")
    if (!isValidUrl) {
      setError("Hmm, eso no parece ser un link de YouTube")
      return
    }

    setError("")
    setGenerating(true)

    try {
      const data = await api.generateDeck({
        youtube_url: urlInput,
        level: level as "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
        context,
      })

      router.push(`/preview/${data.deck_id}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Algo fallo, intentalo de nuevo"
      setError(message)
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando tu panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        user={user} 
        onLogout={handleLogout} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="lg:ml-64">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-outline/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                ¡Que mas, {user?.name || "parcero"}!
              </h1>
              <p className="text-muted-foreground mt-1">
                ¿Listo pa&apos; seguir aprendiendo?
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Plan gratuito</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-base font-semibold text-primary">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              icon={Layers}
              label="Tarjetas creadas"
              value={(user?.total_cards || 0).toLocaleString()}
              color="bg-primary/10 text-primary"
            />
            <StatsCard
              icon={Flame}
              label="Racha"
              value="0 dias"
              color="bg-orange-500/10 text-orange-500"
            />
            <StatsCard
              icon={Sparkles}
              label="Mazos totales"
              value={(user?.total_decks || 0).toString()}
              color="bg-secondary/10 text-secondary"
            />
            <StatsCard
              icon={Zap}
              label="Hoy"
              value={(user?.decks_generated_today || 0).toString()}
              color="bg-amber-500/10 text-amber-500"
            />
          </div>

          {/* Generator Section */}
          <section id="generator" className="mb-10">
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              
              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Generar nuevo mazo
                </h2>
                <p className="text-white/80 mb-6">
                  Pega el link y yo me encargo del resto. ¡Hagale pues!
                </p>

                {/* Form */}
                <div className="space-y-4">
                  {/* URL Input */}
                  <div className="relative">
                    <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => {
                        setUrlInput(e.target.value)
                        setError("")
                      }}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 pl-12 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                      disabled={generating}
                    />
                  </div>

                  {/* Level & Context Row */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 pr-10 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                        disabled={generating}
                      >
                        {CEFR_LEVELS.map((l) => (
                          <option key={l.value} value={l.value} className="text-foreground">
                            {l.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
                    </div>

                    <div className="flex gap-2">
                      {CONTEXTS.map((ctx) => {
                        const Icon = ctx.icon
                        const isSelected = context === ctx.value
                        return (
                          <button
                            key={ctx.value}
                            onClick={() => setContext(ctx.value)}
                            disabled={generating}
                            className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border transition-all ${
                              isSelected
                                ? "bg-white/20 border-white/40 text-white"
                                : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                            } disabled:opacity-50`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs font-medium">{ctx.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {error && (
                    <p className="text-white bg-white/10 px-4 py-2 rounded-lg text-sm">
                      {error}
                    </p>
                  )}

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold text-base bg-white text-primary hover:bg-white/90 disabled:opacity-50 transition-all"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generando tu mazo...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generar mazo
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Decks Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Tus mazos</h2>
              {decks.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {decks.length} mazo{decks.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {decks.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {decks.map((deck) => (
                  <DeckCard key={deck.deck_id} deck={deck} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
