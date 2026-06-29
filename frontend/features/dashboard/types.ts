export interface User {
  id: string
  email: string
  role: string
  created_at?: string
  decks_generated_today?: number
  total_decks?: number
  total_cards?: number
  level?: string
  name?: string
  setup_wizard_completed?: boolean
}

export interface UserStats {
  cardsCreated: number
  studyStreak: number
  decksGenerated: number
  accuracy: number
  totalStudyMinutes: number
}

export interface Deck {
  deck_id: string
  video_title: string
  video_thumbnail: string
  video_id: string
  level: string
  context: string
  total_cards: number
  model_used: string
  created_at: string
}

export type DeckTimeFilter = "all" | "today" | "week"
export type DeckSort = "newest" | "oldest" | "most_cards"

export interface CefrLevel {
  value: string
  label: string
  desc: string
}

export interface ContextType {
  value: string
  label: string
  icon: string
  desc: string
  locked?: boolean
}

export const CEFR_LEVELS: CefrLevel[] = [
  { value: "A1", label: "A1 — Principiante", desc: "Saludos, números, colores" },
  { value: "A2", label: "A2 — Básico", desc: "Situaciones simples del día a día" },
  { value: "B1", label: "B1 — Intermedio", desc: "Entiendo series con subtítulos" },
  { value: "B2", label: "B2 — Intermedio-alto", desc: "Películas sin subtítulos" },
  { value: "C1", label: "C1 — Avanzado", desc: "Uso flexible y profesional" },
  { value: "C2", label: "C2 — Maestría", desc: "Dominio casi nativo" },
]

export const CONTEXTS: ContextType[] = [
  { value: "general", label: "General", icon: "school", desc: "Mezcla equilibrada" },
  { value: "work", label: "Trabajo", icon: "work", desc: "Oficina y llamadas", locked: true },
  { value: "travel", label: "Viajes", icon: "flight", desc: "Aeropuertos y hoteles", locked: true },
  { value: "gaming", label: "Gaming", icon: "sports_esports", desc: "Videojuegos en inglés", locked: true },
]
