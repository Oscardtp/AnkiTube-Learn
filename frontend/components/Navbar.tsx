"use client"

import Link from "next/link"
import { BookOpen, Play } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center group-hover:bg-brand-blue-dark transition-colors">
            <Play className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="font-bold text-text-primary text-lg">
            AnkiTube <span className="text-brand-blue">Learn</span>
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
          >
            <BookOpen className="w-4 h-4" />
            Mis mazos
          </Link>
          <Link href="/generate" className="btn-primary text-sm px-4 py-2">
            Generar mazo
          </Link>
        </div>

      </div>
    </nav>
  )
}