"use client"

import { DeckCard } from "./DeckCard"
import { EmptyState } from "./EmptyState"
import type { Deck } from "../types"

interface DeckListProps {
  decks: Deck[]
  onDeckDeleted?: () => void
}

export function DeckList({ decks, onDeckDeleted }: DeckListProps) {
  if (decks.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-2">
      {decks.map((deck) => (
        <DeckCard key={deck.deck_id} deck={deck} onDeckDeleted={onDeckDeleted} />
      ))}
    </div>
  )
}
