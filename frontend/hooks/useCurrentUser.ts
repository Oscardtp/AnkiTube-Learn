"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { User } from "@/features/dashboard/types"

function mapUser(raw: Awaited<ReturnType<typeof api.getCurrentUser>>): User {
  return {
    ...raw,
    decks_generated_today: raw.generations_today,
    name: raw.custom_name || raw.email?.split("@")[0] || "Usuario",
  }
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const raw = await api.getCurrentUser()
      return mapUser(raw)
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })
}
