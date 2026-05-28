"use client"

import MaterialIcon from "@/components/MaterialIcon"

// Reuse the DeckCard component from dashboard page and add actions
type Deck = {
  deck_id: string
  video_title: string
  video_thumbnail: string
  video_id: string
  level: string
  context: string
  total_cards: number
  model_used: string
  created_at: string
  last_studied_at?: string | null
  studied_today?: boolean
}

interface DeckCardWithActionsProps {
  deck: Deck
  onDelete: (deckId: string) => void
  onEdit: (deck: Deck) => void
}

export default function DeckCardWithActions({ deck, onDelete, onEdit }: DeckCardWithActionsProps) {
  const studiedToday = deck.studied_today || false

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(deck.deck_id)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(deck)
  }

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200 transition-all hover:shadow-lg hover:shadow-primary/5">
      {/* Thumbnail */}
      <div className="aspect-video relative overflow-hidden">
        <img
          src={deck.video_thumbnail}
          alt={`Miniatura de ${deck.video_title}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Status dot - verde si estudió hoy, gris si pendiente */}
        <div className="absolute top-3 right-3">
          <div
            className={`w-3 h-3 rounded-full shadow-sm ring-2 ring-white ${
              studiedToday ? "bg-[#006c49]" : "bg-gray-400"
            }`}
            title={studiedToday ? "Estudiado hoy" : "Pendiente"}
          />
        </div>

        {/* Badges */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md">
            {deck.total_cards} tarjetas
          </span>
          <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-tighter">
            {deck.level}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h4 className="text-base font-bold text-gray-900 leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {deck.video_title}
        </h4>
        <p className="text-xs text-gray-500 mb-4">
          {new Date(deck.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>

        {/* Un solo CTA primario - "Ver mazo" */}
        <div className="mb-3">
          <a
            href={`/preview/${deck.deck_id}`}
            className="w-full bg-primary text-white py-2.5 rounded-xl font-bold text-base shadow-sm hover:bg-[#1648c2] transition-all flex items-center justify-center gap-2"
          >
            <MaterialIcon name="play_arrow" filled className="text-sm" />
            Ver mazo
          </a>
        </div>

        {/* Action buttons - Edit and Delete */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleEdit}
            className="w-full flex items-center justify-center py-2 px-3 rounded-border border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <MaterialIcon name="edit" className="mr-2 h-4 w-4" />
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="w-full flex items-center justify-center py-2 px-3 rounded-border border border-gray-300 text-red-500 hover:bg-red-50 transition-colors"
          >
            <MaterialIcon name="delete" className="mr-2 h-4 w-4" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}