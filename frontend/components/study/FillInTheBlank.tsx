"use client"

import { useState, useEffect } from "react"

interface FillInTheBlankProps {
  answer: string
  onReveal: () => void
}

export default function FillInTheBlank({ answer, onReveal }: FillInTheBlankProps) {
  const [input, setInput] = useState("")
  const [revealed, setRevealed] = useState(false)

  // Reset state when card changes
  useEffect(() => {
    setInput("")
    setRevealed(false)
  }, [answer])

  const handleReveal = () => {
    setRevealed(true)
    onReveal()
  }

  if (revealed) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-4 px-2">
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-4 text-center">
          <p className="text-[11px] font-bold text-[#166534] uppercase tracking-[0.12em] mb-1">
            Respuesta
          </p>
          <p className="text-lg font-bold text-[#166534]">{answer}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 px-2">
      <label htmlFor="blank-answer" className="sr-only">Tu respuesta</label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id="blank-answer"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) handleReveal()
          }}
          placeholder="Escribe tu respuesta..."
          aria-describedby="blank-hint"
          className="flex-1 min-w-0 bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
        <button
          onClick={handleReveal}
          disabled={!input.trim()}
          className="sm:w-auto w-full bg-primary text-white font-semibold px-5 py-3 rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-95 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          Ver
        </button>
      </div>
      <span id="blank-hint" className="sr-only">Escribe tu respuesta y presiona Enter o el botón Ver</span>
    </div>
  )
}
