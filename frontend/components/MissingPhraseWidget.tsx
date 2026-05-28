"use client"

import { useState } from "react"
import { MessageSquarePlus, Send, Loader2, CheckCircle2, ChevronDown } from "lucide-react"
import { api } from "@/lib/api"

interface MissingPhraseWidgetProps {
  deckId: string
}

export default function MissingPhraseWidget({ deckId }: MissingPhraseWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [phrase, setPhrase] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    if (!phrase.trim()) return

    setLoading(true)
    try {
      await api.addCard(deckId, phrase.trim())
      setSubmitted(true)
      setPhrase("")
      setTimeout(() => {
        setSubmitted(false)
        setIsOpen(false)
      }, 2500)
    } catch {
      // Silently fail - widget is non-critical
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors font-medium mx-auto"
      >
        <MessageSquarePlus className="w-4 h-4" />
        Faltó alguna frase
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="mt-4 max-w-md mx-auto animate-in slide-in-from-top-2 duration-200">
          {submitted ? (
            <div className="flex items-center gap-2 justify-center p-4 bg-emerald-50 rounded-xl text-emerald-700 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5" />
              ¡Gracias! La frase fue agregada.
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Escribí la frase que faltó..."
                className="flex-1 bg-surface border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                disabled={loading}
              />
              <button
                onClick={handleSubmit}
                disabled={loading || !phrase.trim()}
                className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-50 shrink-0"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
