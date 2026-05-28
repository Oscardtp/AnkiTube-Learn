"use client"

import MaterialIcon from "@/components/MaterialIcon"
import { CEFR_LEVELS } from "../types"
import type { DeckTimeFilter, DeckSort } from "../types"

interface DeckFiltersProps {
  level: string
  onLevelChange: (level: string) => void
  timeFilter: DeckTimeFilter
  onTimeFilterChange: (filter: DeckTimeFilter) => void
  sortBy: DeckSort
  onSortChange: (sort: DeckSort) => void
}

export function DeckFilters({
  level,
  onLevelChange,
  timeFilter,
  onTimeFilterChange,
  sortBy,
  onSortChange,
}: DeckFiltersProps) {
  const allLevels = [{ value: "all", label: "Todos" }, ...CEFR_LEVELS.map((l) => ({ value: l.value, label: l.value }))]

  const timeOptions: { value: DeckTimeFilter; label: string }[] = [
    { value: "all", label: "Todos" },
    { value: "today", label: "Hoy" },
    { value: "week", label: "Esta semana" },
  ]

  const sortOptions: { value: DeckSort; label: string }[] = [
    { value: "newest", label: "Más recientes" },
    { value: "oldest", label: "Más antiguos" },
    { value: "most_cards", label: "Más tarjetas" },
  ]

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-wrap gap-2">
        {allLevels.map((l) => (
          <button
            key={l.value}
            onClick={() => onLevelChange(l.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              level === l.value
                ? "bg-primary text-white"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {timeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onTimeFilterChange(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                timeFilter === opt.value
                  ? "bg-primary text-white"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as DeckSort)}
            className="appearance-none bg-surface-container-high text-on-surface-variant text-xs font-bold px-3 py-1.5 pr-8 rounded-full hover:bg-surface-container-highest transition-colors cursor-pointer border-none outline-none"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <MaterialIcon name="swap_vert" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none" />
        </div>
      </div>
    </div>
  )
}
