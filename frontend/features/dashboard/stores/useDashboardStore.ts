"use client"

import { create } from "zustand"

interface DashboardState {
  expandedDeckId: string | null
  showUserMenu: boolean
  toggleDeck: (deckId: string) => void
  toggleUserMenu: () => void
  closeUserMenu: () => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  expandedDeckId: null,
  showUserMenu: false,

  toggleDeck: (deckId) =>
    set((state) => ({
      expandedDeckId: state.expandedDeckId === deckId ? null : deckId,
    })),

  toggleUserMenu: () =>
    set((state) => ({ showUserMenu: !state.showUserMenu })),

  closeUserMenu: () => set({ showUserMenu: false }),
}))
