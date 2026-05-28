"use client"

import { create } from "zustand"

interface DashboardState {
  expandedDeckId: string | null
  showMobileDrawer: boolean
  toggleDeck: (deckId: string) => void
  openMobileDrawer: () => void
  closeMobileDrawer: () => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  expandedDeckId: null,
  showMobileDrawer: false,

  toggleDeck: (deckId) =>
    set((state) => ({
      expandedDeckId: state.expandedDeckId === deckId ? null : deckId,
    })),

  openMobileDrawer: () => set({ showMobileDrawer: true }),
  closeMobileDrawer: () => set({ showMobileDrawer: false }),
}))
