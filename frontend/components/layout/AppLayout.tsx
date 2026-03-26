"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { 
  Home, 
  BookOpen, 
  Headphones, 
  BarChart3, 
  Settings,
  Menu,
  X,
  ChevronRight,
  Flame,
  Trophy
} from "lucide-react"

const navItems = [
  { href: "/app", label: "Inicio", icon: Home, description: "Tu centro de entrenamiento" },
  { href: "/app/learn", label: "Aprender", icon: BookOpen, description: "Frases y vocabulario" },
  { href: "/app/practice", label: "Practicar", icon: Headphones, description: "Simulaciones reales" },
  { href: "/app/progress", label: "Progreso", icon: BarChart3, description: "Tu avance" },
]

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Mock user data for streaks
  const streakDays = 5
  const totalPoints = 1250

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 h-screen fixed left-0 top-0 flex-col bg-surface-container-lowest border-r border-outline-variant/20">
        {/* Logo & Brand */}
        <div className="p-6 border-b border-outline-variant/10">
          <Link href="/app" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-on-surface">
                CallCenter Pro
              </h1>
              <p className="text-xs text-on-surface-variant font-medium">
                Entrena tu ingles
              </p>
            </div>
          </Link>
        </div>

        {/* Streak & Points Card */}
        <div className="mx-4 mt-6 p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-2xl border border-secondary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-on-surface">{streakDays}</p>
                <p className="text-xs text-on-surface-variant">dias seguidos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-on-surface">{totalPoints}</p>
                <p className="text-xs text-on-surface-variant">puntos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 mt-4">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 mb-3">
            Menu principal
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-on-surface-variant group-hover:text-primary"}`} />
                <div className="flex-1">
                  <span className={`font-semibold text-sm ${isActive ? "text-white" : ""}`}>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
              </Link>
            )
          })}
        </nav>

        {/* Settings & Help */}
        <div className="p-4 border-t border-outline-variant/10">
          <Link
            href="/app/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Configuracion</span>
          </Link>
        </div>

        {/* Daily Goal Card */}
        <div className="mx-4 mb-6 p-4 bg-surface-container rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-on-surface">Meta diaria</p>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">3/5 frases</span>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-2.5">
            <div className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full transition-all" style={{ width: "60%" }} />
          </div>
          <p className="text-xs text-on-surface-variant mt-2">2 frases mas para completar tu meta</p>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/20">
        <div className="flex items-center justify-between px-4 h-16">
          <Link href="/app" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white">
              <Headphones className="w-5 h-5" />
            </div>
            <span className="font-bold text-on-surface">CallCenter Pro</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Streak Badge */}
            <div className="flex items-center gap-1.5 bg-secondary/10 px-3 py-1.5 rounded-full">
              <Flame className="w-4 h-4 text-secondary" />
              <span className="text-sm font-bold text-secondary">{streakDays}</span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-on-surface-variant hover:text-on-surface rounded-xl hover:bg-surface-container transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="bg-surface-container-lowest border-t border-outline-variant/10 pb-4">
            <nav className="px-4 pt-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/20 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  isActive
                    ? "text-primary"
                    : "text-on-surface-variant"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-primary/10" : ""}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-semibold ${isActive ? "text-primary" : ""}`}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-h-screen pt-16 pb-20 lg:pt-0 lg:pb-0">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
