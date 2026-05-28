"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import MinimalNavbar from "@/components/MinimalNavbar"
import { DuplicateDeckModal } from "@/components/DuplicateDeckModal"
import MaterialIcon from "@/components/MaterialIcon"
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData"
import { useDeckFilters } from "@/features/dashboard/hooks/useDeckFilters"
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader"
import { StatsGrid } from "@/features/dashboard/components/StatsGrid"
import { GeneratorSection } from "@/features/dashboard/components/GeneratorSection"
import { DeckFilters } from "@/features/dashboard/components/DeckFilters"
import { DeckList } from "@/features/dashboard/components/DeckList"
import type { Deck } from "@/features/dashboard/types"

interface NavItem {
  href: string
  label: string
  icon: string
  active: boolean
  placeholder?: boolean
}

function SideNavBar({ onLogout, userName }: { onLogout: () => void; userName?: string }) {
  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Panel de Control", icon: "dashboard", active: true },
    { href: "/settings", label: "Configuración", icon: "settings", active: false },
  ]

  const bottomItems: NavItem[] = [
    { href: "/help", label: "Ayuda", icon: "help", active: false, placeholder: true },
  ]

  return (
    <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest flex-col py-6 px-4 z-50 border-r border-outline-variant/20">
      <div className="mb-10 px-2">
        <Link href="/">
          <h1 className="text-2xl font-black text-primary tracking-tighter hover:opacity-80 transition-opacity">AnkiTube Learn</h1>
        </Link>
        {userName && (
          <p className="text-xs font-medium text-on-surface-variant mt-1">
            Nivel {userName}
          </p>
        )}
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
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-on-surface-variant hover:text-primary hover:bg-surface-container"
        >
          <MaterialIcon name="home" className="text-xl" />
          <span>Ir a la pagina principal</span>
        </Link>
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

export default function DashboardPage() {
  const router = useRouter()
  const { user, decks, stats, isLoading } = useDashboardData()
  const { level, setLevel, timeFilter, setTimeFilter, sortBy, setSortBy, filteredDecks } = useDeckFilters(decks)
  const [duplicateDeck, setDuplicateDeck] = useState<Deck | null>(null)

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }, [router])

  const handleDuplicateDetected = useCallback((deck: Deck) => {
    setDuplicateDeck(deck)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-on-surface-variant font-medium text-sm">Cargando tu dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <MinimalNavbar />
      <SideNavBar onLogout={handleLogout} userName={user?.level} />

      <main className="md:ml-64 flex-1 p-6 md:p-8 lg:p-12 max-w-[1600px]">
        <DashboardHeader user={user} onLogout={handleLogout} />
        <StatsGrid stats={stats} generationsToday={user?.decks_generated_today || 0} />
        <GeneratorSection decks={decks} onDuplicateDetected={handleDuplicateDetected} />

        <section>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl md:text-2xl font-black text-on-surface tracking-tight">
              Tus mazos
            </h3>
          </div>

          <DeckFilters
            level={level}
            onLevelChange={setLevel}
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <DeckList decks={filteredDecks} />
        </section>
      </main>

      {duplicateDeck && (
        <DuplicateDeckModal
          deck={duplicateDeck}
          level={level}
          onClose={() => setDuplicateDeck(null)}
          onReplace={() => {
            setDuplicateDeck(null)
          }}
        />
      )}
    </div>
  )
}
