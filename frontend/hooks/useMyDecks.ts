"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Deck } from "@/features/dashboard/types"

interface UseMyDecksResult {
  decks: Deck[]
  total: number
}

export function useMyDecks() {
  return useQuery({
    queryKey: ["myDecks"],
    queryFn: async (): Promise<UseMyDecksResult> => {
      const data = await api.getMyDecks()
      return { decks: data.decks, total: data.total }
    },
    retry: 1,
    staleTime: 2 * 60 * 1000,
  })
}
