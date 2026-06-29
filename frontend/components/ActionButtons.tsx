"use client"

import { Download, Loader2, BookOpen, Bookmark, BookmarkCheck } from "lucide-react"

interface ActionButtonsProps {
  downloading: boolean
  onDownload: () => void
  onStudy: () => void
  onBookmark?: () => void
  isBookmarked?: boolean
  isAuthenticated: boolean
}

export default function ActionButtons({
  downloading,
  onDownload,
  onStudy,
  onBookmark,
  isBookmarked = false,
  isAuthenticated,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      {/* Primary: Estudiar ahora */}
      <button
        onClick={onStudy}
        className="flex-[2] flex items-center justify-center gap-2 bg-[#1A56DB] text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-[#1648C2] transition-all active:scale-[0.98]"
      >
        <BookOpen className="w-4 h-4" />
        Estudiar ahora
      </button>

      {/* Secondary: Descargar */}
      <button
        onClick={onDownload}
        disabled={downloading}
        className="flex-[1.5] flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-5 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {downloading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Descargando...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Descargar .apkg
          </>
        )}
      </button>

      {/* Icon: Bookmark (authenticated only) */}
      {isAuthenticated && onBookmark && (
        <button
          onClick={onBookmark}
          title={isBookmarked ? "Guardado en Mis mazos" : "Guardar en Mis mazos"}
          className="flex items-center justify-center w-12 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shrink-0"
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-4 h-4 text-[#1A56DB]" />
          ) : (
            <Bookmark className="w-4 h-4 text-gray-400" />
          )}
        </button>
      )}
    </div>
  )
}
