"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import MaterialIcon from "@/components/MaterialIcon"
import { CEFR_LEVELS, CONTEXTS } from "../types"
import type { Deck } from "../types"
import { useGenerator, GENERATION_MESSAGES } from "../hooks/useGenerator"
import { Briefcase, Plane, Gamepad2, GraduationCap, Lock } from "lucide-react"

const CONTEXT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  general: GraduationCap,
  work: Briefcase,
  travel: Plane,
  gaming: Gamepad2,
}

interface GeneratorBarProps {
  decks: Deck[]
  onDuplicateDetected?: (deck: Deck) => void
}

export function GeneratorBar({ decks, onDuplicateDetected }: GeneratorBarProps) {
  const router = useRouter()
  const {
    urlInput, setUrlInput,
    level, setLevel,
    context, setContext,
    generating, generationStatus, generationError, setGenerationError,
    generatedDeckId,
    handleGenerate,
    cancelGenerator,
    resetGenerator,
  } = useGenerator(decks, onDuplicateDetected)

  const isCompleted = generationStatus === "completed" && generatedDeckId
  const isError = generationStatus === "error"
  const isProcessing = generating && !isCompleted && !isError

  return (
    <section aria-label="Generador de mazos" className="mb-8 md:mb-12">
      <div className="bg-white dark:bg-slate-800/30 rounded-2xl border border-outline-variant/20 p-4 sm:p-6 shadow-sm">

        {/* Estado: Completado */}
        {isCompleted ? (
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <MaterialIcon name="check_circle" className="text-emerald-600 text-3xl" />
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-1">Quedó brutal</h3>
            <p className="text-sm text-on-surface-variant mb-5">Tu mazo está listo para estudiar.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/preview/${generatedDeckId}`}
                className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-primary text-white font-bold text-sm rounded-xl shadow-sm shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
              >
                <MaterialIcon name="school" className="text-base" />
                Ver mazo
              </Link>
              <button
                onClick={resetGenerator}
                className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-surface-container-high text-on-surface font-bold text-sm rounded-xl hover:bg-surface-container-highest transition-all active:scale-[0.98]"
              >
                <MaterialIcon name="add" className="text-base" />
                Generar otro
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Estado: Idle o Procesando */}
            <h3 className="text-lg font-bold text-on-surface mb-1">Generar mazo</h3>
            <p className="text-sm text-on-surface-variant mb-4">Pegá un link de YouTube y yo me encargo del resto.</p>

            {/* Barra de progreso dinámica */}
            {isProcessing && (
              <div className="mb-4 p-3 bg-primary/5 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-semibold text-primary flex-1">
                    {GENERATION_MESSAGES[generationStatus]}
                  </span>
                  <button
                    onClick={cancelGenerator}
                    className="text-xs text-on-surface-variant/60 hover:text-error transition-colors px-2 py-1 rounded-lg hover:bg-error/5"
                    aria-label="Cancelar generación"
                  >
                    Cancelar
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  {(["extracting", "analyzing", "generating"] as const).map((step, i) => {
                    const statusOrder: readonly string[] = ["extracting", "analyzing", "generating"]
                    const currentIdx = statusOrder.indexOf(generationStatus)
                    const isDone = i < currentIdx
                    const isCurrent = i === currentIdx
                    return (
                      <div key={step} className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          isDone ? "bg-primary" : isCurrent ? "bg-primary scale-125 animate-pulse" : "bg-primary/20"
                        }`} />
                        {i < 2 && (
                          <div className={`w-5 h-0.5 rounded transition-all duration-300 ${
                            isDone ? "bg-primary" : "bg-primary/15"
                          }`} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Input + Botón */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <MaterialIcon name="link" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-lg" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => { setUrlInput(e.target.value); setGenerationError("") }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface border-2 border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 text-on-surface font-medium placeholder:text-on-surface-variant/40 transition-all outline-none text-sm"
                  onKeyDown={(e) => e.key === "Enter" && !generating && handleGenerate()}
                  disabled={generating}
                  aria-label="Enlace de YouTube"
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating || !urlInput.trim()}
                className="h-12 sm:h-auto px-6 bg-primary text-white font-bold text-sm rounded-xl shadow-sm shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {generating ? (
                  <>
                    <span>Generando</span>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </>
                ) : (
                  <>
                    <MaterialIcon name="bolt" filled className="text-lg" />
                    <span>Generar mazo</span>
                  </>
                )}
              </button>
            </div>

            {/* Selectores */}
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-2 block">Nivel</label>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Seleccionar nivel CEFR">
                  {CEFR_LEVELS.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setLevel(l.value)}
                      disabled={generating}
                      role="radio"
                      aria-checked={level === l.value}
                      className={`h-8 px-3.5 rounded-full text-xs font-bold transition-all ${
                        level === l.value
                          ? "bg-primary text-white shadow-sm shadow-primary/20"
                          : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                      } disabled:opacity-50`}
                    >
                      {l.value}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-on-surface-variant/70 mt-1.5">
                  {CEFR_LEVELS.find((l) => l.value === level)?.desc}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-2 block">Contexto</label>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Seleccionar contexto">
                  {CONTEXTS.map((ctx) => {
                    const Icon = CONTEXT_ICONS[ctx.value] || GraduationCap
                    return (
                      <button
                        key={ctx.value}
                        onClick={() => !ctx.locked && setContext(ctx.value)}
                        disabled={generating || !!ctx.locked}
                        role="radio"
                        aria-checked={context === ctx.value}
                        aria-disabled={ctx.locked}
                        className={`h-8 px-3.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                          ctx.locked
                            ? "bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed"
                            : context === ctx.value
                            ? "bg-primary text-white shadow-sm shadow-primary/20"
                            : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                        } disabled:opacity-50`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{ctx.label}</span>
                        {ctx.locked && <Lock className="w-3 h-3 opacity-50" />}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-on-surface-variant/70 mt-1.5">
                  {CONTEXTS.find((c) => c.value === context)?.desc}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Error */}
        {isError && generationError && (
          <div className="mt-4 p-3 bg-error/5 border border-error/20 rounded-xl">
            <div className="flex items-start gap-2">
              <MaterialIcon name="error" className="text-error text-lg mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-error">Uy, algo falló</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{generationError}</p>
              </div>
              <button
                onClick={() => { setGenerationError(""); resetGenerator() }}
                className="text-on-surface-variant/50 hover:text-on-surface-variant transition-colors"
                aria-label="Cerrar error"
              >
                <MaterialIcon name="close" className="text-sm" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
