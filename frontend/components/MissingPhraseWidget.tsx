"use client"

import { useState } from "react"
import { PlusCircle, Loader2, CheckCircle2 } from "lucide-react"
import { api } from "@/lib/api"

interface MissingPhraseWidgetProps {
  deckId: string
}

export default function MissingPhraseWidget({ deckId }: MissingPhraseWidgetProps) {
  const [phrase, setPhrase] = useState("")
  const [timestamp, setTimestamp] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    if (!phrase.trim()) return

    setLoading(true)
    try {
      const ts = timestamp.trim() ? parseTimestamp(timestamp.trim()) : undefined
      await api.addCard(deckId, phrase.trim(), ts)
      setSubmitted(true)
      setPhrase("")
      setTimestamp("")
      setTimeout(() => setSubmitted(false), 2500)
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }

  function parseTimestamp(ts: string): number | undefined {
    const parts = ts.split(":").map(Number)
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] * 60 + parts[1]
    }
    if (parts.length === 1 && !isNaN(parts[0])) {
      return parts[0]
    }
    return undefined
  }

  return (
    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <PlusCircle className="w-4 h-4 text-[#1A56DB]" />
        <span className="text-[13px] text-gray-500 font-medium">
          ¿Faltó alguna frase del video?
        </span>
      </div>

      {submitted ? (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl text-emerald-700 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          ¡Gracias! La frase fue agregada.
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Ej: I've been meaning to tell you"
            className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1A56DB] transition-colors"
            disabled={loading}
          />
          <input
            type="text"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            placeholder="Ej: 2:34"
            className="w-20 bg-white border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1A56DB] transition-colors"
            disabled={loading}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !phrase.trim()}
            className="bg-[#1A56DB] text-white text-[13px] font-semibold px-3.5 py-2 rounded-xl hover:bg-[#1648C2] transition-all disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Añadir"
            )}
          </button>
        </div>
      )}
    </div>
  )
}
