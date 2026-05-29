"use client"

import { useState } from "react"
import { Volume2 } from "lucide-react"

export default function CardFlip() {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className="relative cursor-pointer group"
      style={{ perspective: "1000px" }}
      onClick={() => setFlipped(!flipped)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          setFlipped(!flipped)
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={flipped ? "Voltear para ver inglés" : "Voltear para ver contexto colombiano"}
    >
      <div
        className="relative w-full transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)]"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Frente */}
        <div
          className="bg-surface-container-lowest rounded-3xl p-8 shadow-2xl relative"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="absolute -top-4 -right-4 bg-secondary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg z-10 rotate-6">
            ¡Correcto! +10xp
          </div>

          <div className="mb-8">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-4">
              Front (Inglés)
            </span>
            <div className="flex justify-between items-center">
              <h4 className="text-2xl font-bold text-primary">
                &quot;I&apos;ve been meaning to tell you&quot;
              </h4>
              <button
                className="w-10 h-10 bg-primary-container/30 rounded-full flex items-center justify-center text-primary hover:bg-primary-container/50 transition-colors"
                aria-label="Reproducir audio"
                onClick={(e) => e.stopPropagation()}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-on-surface-variant mt-6 italic">
            Tocá para voltear
          </p>
        </div>

        {/* Reverso */}
        <div
          className="absolute inset-0 bg-surface-container-lowest rounded-3xl p-8 shadow-2xl"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="pt-6">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-4">
              Back (Contexto Colombiano)
            </span>
            <p className="text-lg text-on-surface font-medium italic mb-2">
              Lo que significa: Te lo quería decir hace rato.
            </p>
            <p className="text-lg text-secondary font-bold">
              En Colombia dirías: &quot;Te tenía que contar algo&quot;.
            </p>
          </div>

          <p className="text-center text-xs text-on-surface-variant mt-8 italic">
            Tocá para voltear
          </p>
        </div>
      </div>
    </div>
  )
}
