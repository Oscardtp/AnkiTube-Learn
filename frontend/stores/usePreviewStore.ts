import { create } from "zustand"

interface PreviewState {
  currentCardIndex: number
  selectedCards: Set<number>
  downloading: boolean
  showRegisterModal: boolean
  pendingAction: "download" | "study" | null
  toast: string
  sessionStarted: boolean
  primaryActionCompleted: boolean
  secondsSincePrimaryAction: number
  feedbackShown: boolean

  setCurrentCard: (index: number) => void
  nextCard: (total: number) => void
  prevCard: () => void
  toggleCardSelection: (index: number) => void
  selectAll: (count: number) => void
  deselectAll: () => void
  setDownloading: (v: boolean) => void
  openRegisterModal: (action: "download" | "study") => void
  closeRegisterModal: () => void
  setToast: (msg: string) => void
  markPrimaryComplete: () => void
  setFeedbackShown: (v: boolean) => void
  reset: () => void
}

export const usePreviewStore = create<PreviewState>((set, get) => ({
  currentCardIndex: 0,
  selectedCards: new Set<number>(),
  downloading: false,
  showRegisterModal: false,
  pendingAction: null,
  toast: "",
  sessionStarted: false,
  primaryActionCompleted: false,
  secondsSincePrimaryAction: 0,
  feedbackShown: false,

  setCurrentCard: (index) => set({ currentCardIndex: index }),

  nextCard: (total) => {
    const { currentCardIndex } = get()
    if (currentCardIndex < total - 1) {
      set({ currentCardIndex: currentCardIndex + 1 })
    }
  },

  prevCard: () => {
    const { currentCardIndex } = get()
    if (currentCardIndex > 0) {
      set({ currentCardIndex: currentCardIndex - 1 })
    }
  },

  toggleCardSelection: (index) => {
    const { selectedCards } = get()
    const newSet = new Set(selectedCards)
    if (newSet.has(index)) {
      newSet.delete(index)
    } else {
      newSet.add(index)
    }
    set({ selectedCards: newSet })
  },

  selectAll: (count) => {
    set({ selectedCards: new Set(Array.from({ length: count }, (_, i) => i)) })
  },

  deselectAll: () => set({ selectedCards: new Set() }),

  setDownloading: (v) => set({ downloading: v }),

  openRegisterModal: (action) =>
    set({ showRegisterModal: true, pendingAction: action }),

  closeRegisterModal: () =>
    set({ showRegisterModal: false, pendingAction: null }),

  setToast: (msg) => set({ toast: msg }),

  markPrimaryComplete: () =>
    set({ primaryActionCompleted: true, secondsSincePrimaryAction: 0 }),

  setFeedbackShown: (v) => set({ feedbackShown: v }),

  reset: () =>
    set({
      currentCardIndex: 0,
      selectedCards: new Set(),
      downloading: false,
      showRegisterModal: false,
      pendingAction: null,
      toast: "",
      sessionStarted: false,
      primaryActionCompleted: false,
      secondsSincePrimaryAction: 0,
      feedbackShown: false,
    }),
}))
