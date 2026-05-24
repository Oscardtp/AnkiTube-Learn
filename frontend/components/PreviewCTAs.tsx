"use client"

import { Download, BookOpen, Plus, CheckCircle2, Loader2 } from "lucide-react"

interface PreviewCTAsProps {
  isAuthenticated: boolean
  isDownloading: boolean
  deckSaved: boolean
  onDownload: () => Promise<void> | void
  onStudy: () => void
  onGenerateAnother: () => void
}

export default function PreviewCTAs({
  isAuthenticated,
  isDownloading,
  deckSaved,
  onDownload,
  onStudy,
  onGenerateAnother,
}: PreviewCTAsProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden mb-8">
      <div className="px-4 py-4.5 md:px-6 md:py-5">
        {/* Saved Badge */}
        {isAuthenticated && deckSaved && (
          <div className="inline-flex items-center gap-1.5 bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] px-2.5 py-1 rounded-full text-xs font-semibold mb-3">
            <CheckCircle2 className="w-3 h-3" />
            Guardado en tu cuenta
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Download Button */}
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="flex-1 h-12 bg-gradient-to-r from-[#1A56DB] to-[#2E5FE6] hover:opacity-90 active:scale-[0.98] text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Descargando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Descargar para Anki
              </>
            )}
          </button>

          {/* Study Button */}
          <button
            onClick={onStudy}
            className="flex-1 h-12 bg-white border-2 border-[#1A56DB] text-[#1A56DB] hover:bg-[#EBF2FF] active:scale-[0.98] font-bold rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            Estudiar aquí
          </button>

          {/* Generate Another */}
          <button
            onClick={onGenerateAnother}
            className="flex-1 h-12 bg-white text-[#6B7280] hover:text-[#1A56DB] font-medium rounded-2xl flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Generar otro
          </button>
        </div>

        {/* Anon Note */}
        {!isAuthenticated && (
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-[#6B7280]">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M8 5v3M8 10v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Necesitás una cuenta
            <span className="inline-block bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
              Es gratis
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
