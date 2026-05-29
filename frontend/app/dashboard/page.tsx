"use client"

import { lazy, Suspense, useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { DuplicateDeckModal } from "@/components/DuplicateDeckModal"
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData"
import { useDeckFilters } from "@/features/dashboard/hooks/useDeckFilters"
import { DashboardNavbar } from "@/features/dashboard/components/DashboardNavbar"
import { MobileDrawer } from "@/features/dashboard/components/MobileDrawer"
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader"
import { UpsellBar } from "@/features/dashboard/components/UpsellBar"
import { TodayCard } from "@/features/dashboard/components/TodayCard"
import { GeneratorBar } from "@/features/dashboard/components/GeneratorBar"
import { DeckFilters } from "@/features/dashboard/components/DeckFilters"
import { DeckList } from "@/features/dashboard/components/DeckList"
import { StatsSkeleton } from "@/features/dashboard/components/SkeletonLoaders"
import type { Deck } from "@/features/dashboard/types"

const StatsSection = lazy(() =>
  import("@/features/dashboard/components/StatsSection").then((m) => ({ default: m.StatsSection }))
)

export default function DashboardPage() {
  const router = useRouter()
  const { user, decks, stats, isLoading, refetch } = useDashboardData()
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

  const handleScrollToGenerator = useCallback(() => {
    document.getElementById("generator-section")?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const urgentDeck = useMemo(() => {
    if (!decks.length) return null
    const withPending = decks.map((d) => {
      const raw = d as unknown as Record<string, unknown>
      const nc = (raw.new_cards as number) || 0
      const rc = (raw.review_cards as number) || 0
      return { deck: d, total: nc + rc, nc, rc }
    }).filter((d) => d.total > 0)
    if (!withPending.length) return null
    withPending.sort((a, b) => b.total - a.total)
    return withPending[0]
  }, [decks])

  const isExplorador = !user?.role || user.role === "user"

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-on-surface-variant font-medium text-sm">Cargando todo...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Saltar al contenido principal
      </a>

      <DashboardNavbar user={user} onLogout={handleLogout} onGenerate={handleScrollToGenerator} />
      <MobileDrawer onLogout={handleLogout} />

      <main id="main-content" className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full" tabIndex={-1}>
        <DashboardHeader user={user} pendingCards={urgentDeck?.total} />

        {isExplorador && <div className="mt-3"><UpsellBar /></div>}

        {urgentDeck && (
          <div className="mt-3">
            <TodayCard
              deck={urgentDeck.deck}
              pendingNew={urgentDeck.nc}
              pendingReview={urgentDeck.rc}
            />
          </div>
        )}

        <div id="generator-section" className="mt-4">
          <GeneratorBar decks={decks} onDuplicateDetected={handleDuplicateDetected} />
        </div>

        <Suspense fallback={<StatsSkeleton />}>
          <StatsSection stats={stats} />
        </Suspense>

        <section aria-label="Tus mazos">
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

          <DeckList decks={filteredDecks} onDeckDeleted={refetch} />
        </section>
      </main>

      {duplicateDeck && (
        <DuplicateDeckModal
          deck={duplicateDeck}
          level={level}
          onClose={() => setDuplicateDeck(null)}
          onReplace={() => setDuplicateDeck(null)}
        />
      )}
    </div>
  )
}
