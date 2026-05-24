"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface PreviewMissingProps {
  deckId: string
  isAuthenticated: boolean
  onSubmit?: (text: string) => Promise<void>
}

export default function PreviewMissing({
  deckId,
  isAuthenticated,
  onSubmit,
}: PreviewMissingProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSend() {
    if (!inputValue.trim()) return

    setIsSending(true)
    try {
      if (onSubmit) {
        await onSubmit(inputValue)
      }
      setSent(true)
      setTimeout(() => {
        setInputValue("")
        setSent(false)
        setIsOpen(false)
      }, 1500)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] overflow-hidden mb-8">
      <div className="px-4 py-3.5 md:px-6 md:py-4">
        {/* Header - Always Visible */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-[#6B7280]">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
              <path
                d="M6.5 6.5C6.5 5.672 7.172 5 8 5s1.5.672 1.5 1.5c0 .6-.4 1.1-1 1.35-.35.15-.5.4-.5.65"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <circle cx="8" cy="11" r=".7" fill="currentColor" />
            </svg>
            <span className="text-sm text-[#6B7280]">¿Faltó alguna frase?</span>
          </div>
          <span className={`text-xs text-[#1A56DB] font-medium transition-transform ${isOpen ? "rotate-180" : ""}`}>
            {isOpen ? "Cerrar ↑" : "Sugerí una →"}
          </span>
        </button>

        {/* Form - Collapsed by Default */}
        {isOpen && (
          <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder='Ej: "Could we BE any more...?" · minuto 8:23'
              className="w-full h-16 border border-[#E5E7EB] rounded-xl p-2.5 text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1A56DB] resize-none"
              disabled={isSending}
            />

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={isSending || !inputValue.trim()}
              className="mt-2 float-right h-8 px-3 bg-[#1A56DB] text-white text-xs font-medium rounded-lg hover:bg-[#1648c2] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {sent ? "✓ Enviado" : isSending ? "Enviando..." : "Enviar"}
            </button>

            <div className="clear-both" />
          </div>
        )}
      </div>
    </div>
  )
}
