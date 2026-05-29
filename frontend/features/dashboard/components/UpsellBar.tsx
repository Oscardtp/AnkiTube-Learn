"use client"

import { useState } from "react"
import Link from "next/link"
import { X } from "lucide-react"

export function UpsellBar() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-gradient-to-r from-primary to-[#1648c2] rounded-xl p-3.5 flex items-center justify-between gap-3">
      <div className="text-white text-xs leading-relaxed flex-1">
        <span className="font-bold text-[13px]">Desbloqueá todos los niveles</span>
        <br />
        Pasá a Fluente y generá mazos ilimitados
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/#pricing"
          className="h-[30px] px-3 bg-white text-primary rounded-[7px] text-xs font-bold hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          Ver planes
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="w-6 h-6 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
