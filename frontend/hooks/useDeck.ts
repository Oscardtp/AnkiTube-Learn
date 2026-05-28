"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

export function useDeck(deckId: string | undefined) {
  return useQuery({
    queryKey: ["deck", deckId],
    queryFn: () => api.getDeck(deckId!),
    enabled: !!deckId,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })
}
