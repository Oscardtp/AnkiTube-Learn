"use client"

import { useMemo } from "react"
import { CheckCircle2, RotateCcw } from "lucide-react"
import type { StudyResult } from "@/hooks/useSM2"

interface SessionCompleteProps {
  results: StudyResult[]
  totalCards: number
  sessionDurationSeconds: number
  streakDays: number
  onRestart: () => void
  onExit: () => void
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
}

export default function SessionComplete({
  results,
  totalCards,
  sessionDurationSeconds,
  streakDays,
  onRestart,
  onExit,
}: SessionCompleteProps) {
  const stats = useMemo(() => ({
    again: results.filter((r) => r.quality === 0).length,
    hard: results.filter((r) => r.quality === 2).length,
    good: results.filter((r) => r.quality === 4).length,
    easy: results.filter((r) => r.quality === 5).length,
    avg: results.length > 0
      ? results.reduce((sum, r) => sum + r.quality, 0) / results.length
      : 0,
  }), [results])

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
      {/* Screen reader announcement */}
      <div role="status" aria-live="polite" className="sr-only">
        Sesión completa. Revisaste {totalCards} tarjetas en {formatDuration(sessionDurationSeconds)}.
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Celebration icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-[#F0FDF4] rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-[#166534]" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 text-center mb-2">
          ¡Sesión completa!
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Revisaste {totalCards} tarjetas en {formatDuration(sessionDurationSeconds)}
        </p>

        {/* Stats grid */}
        <div className="bg-white rounded-2xl p-6 shadow-card mb-6">
          <dl className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <dt className="text-xs text-gray-500 mt-1">Revisadas</dt>
              <dd className="text-2xl font-extrabold text-gray-900">{results.length}</dd>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <dt className="text-xs text-gray-500 mt-1">Racha (días)</dt>
              <dd className="text-2xl font-extrabold text-primary">{streakDays}</dd>
            </div>
          </dl>

          {/* Breakdown */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Desglose</h2>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Otra vez</span>
              <span className="font-semibold text-[#991B1B]">{stats.again}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-500">Difícil</span>
              <span className="font-semibold text-[#92400e]">{stats.hard}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-500">Bien</span>
              <span className="font-semibold text-[#1e40af]">{stats.good}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-500">Fácil</span>
              <span className="font-semibold text-[#166534]">{stats.easy}</span>
            </div>
          </div>

          {stats.avg > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">Promedio de calidad</p>
              <p className="text-lg font-bold text-gray-900">{stats.avg.toFixed(1)} / 5</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onRestart}
            className="w-full bg-primary text-white font-bold py-3 rounded-full transition-all active:scale-[0.98] hover:brightness-95 flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            <RotateCcw className="w-4 h-4" />
            Estudiar de nuevo
          </button>
          <button
            onClick={onExit}
            className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-full transition-all active:scale-[0.98] hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            Volver al mazo
          </button>
        </div>
      </div>
    </div>
  )
}
