"use client"

import { useState, useMemo } from "react"
import type { Deck, DeckTimeFilter, DeckSort } from "../types"

export function useDeckFilters(decks: Deck[]) {
  const [level, setLevel] = useState<string>("all")
  const [timeFilter, setTimeFilter] = useState<DeckTimeFilter>("all")
  const [sortBy, setSortBy] = useState<DeckSort>("newest")
  const [searchQuery] = useState("")

  const filteredDecks = useMemo(() => {
    let result = [...decks]

    if (level !== "all") {
      result = result.filter((d) => d.level === level)
    }

    if (timeFilter === "today") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      result = result.filter((d) => new Date(d.created_at) >= today)
    } else if (timeFilter === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      result = result.filter((d) => new Date(d.created_at) >= weekAgo)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((d) =>
        d.video_title.toLowerCase().includes(q) ||
        d.level.toLowerCase().includes(q)
      )
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "most_cards":
          return b.total_cards - a.total_cards
        case "newest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    return result
  }, [decks, level, timeFilter, sortBy, searchQuery])

  return {
    level,
    setLevel,
    timeFilter,
    setTimeFilter,
    sortBy,
    setSortBy,
    filteredDecks,
  }
}
