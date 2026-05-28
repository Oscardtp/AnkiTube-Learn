"use client"

import { useMemo } from "react"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useMyDecks } from "@/hooks/useMyDecks"
import type { UserStats } from "../types"

export function useDashboardData() {
  const userQuery = useCurrentUser()
  const decksQuery = useMyDecks()

  const stats: UserStats = useMemo(() => ({
    cardsCreated: userQuery.data?.total_cards || 0,
    studyStreak: 0,
    decksGenerated: userQuery.data?.total_decks || 0,
    accuracy: 0,
    totalStudyMinutes: 0,
  }), [userQuery.data])

  return {
    user: userQuery.data ?? null,
    decks: decksQuery.data?.decks ?? [],
    stats,
    isLoading: userQuery.isLoading || decksQuery.isLoading,
    isError: userQuery.isError || decksQuery.isError,
    error: userQuery.error || decksQuery.error,
    refetch: () => {
      userQuery.refetch()
      decksQuery.refetch()
    },
  }
}
