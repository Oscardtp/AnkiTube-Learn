"use client"

import { Download, Loader2, Plus, BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"

interface ActionButtonsProps {
  downloading: boolean
  onDownload: () => void
  onStudy: () => void
  selectedCount: number
  isAuthenticated: boolean
}

export default function ActionButtons({
  downloading,
  onDownload,
  onStudy,
  selectedCount,
  isAuthenticated,
}: ActionButtonsProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
      <button
        onClick={onDownload}
        disabled={downloading}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-container text-white px-8 py-4 rounded-full font-bold text-base hover:opacity-90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {downloading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Descargando...
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            {selectedCount > 0
              ? `Descargar seleccionadas (${selectedCount})`
              : "Descargar mazo"}
          </>
        )}
      </button>

      <button
        onClick={onStudy}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-surface-container-high text-on-surface px-8 py-4 rounded-full font-bold text-base hover:bg-surface-container-highest transition-all active:scale-[0.98]"
      >
        <BookOpen className="w-5 h-5" />
        Estudiar aquí
      </button>

      {isAuthenticated && (
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full sm:w-auto flex items-center justify-center gap-2 text-on-surface-variant font-medium px-6 py-4 rounded-full hover:text-primary transition-colors"
        >
          <Plus className="w-4 h-4" />
          Generar otro
        </button>
      )}
    </div>
  )
}
