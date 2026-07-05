"use client"

import { useState, useEffect, useCallback } from "react"
import { BookOpen, PenLine, Headphones, Check, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

export type SkillType = "srs" | "writing" | "listening"

export interface SkillOption {
  id: SkillType
  label: string
  description: string
  icon: typeof BookOpen
  color: string
  bg: string
}

const SKILLS: SkillOption[] = [
  {
    id: "srs",
    label: "SRS",
    description: "Repasar tarjetas con repetición espaciada",
    icon: BookOpen,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    id: "writing",
    label: "Writing",
    description: "Completar frases escribiendo",
    icon: PenLine,
    color: "text-[#7C3AED]",
    bg: "bg-[#7C3AED]/10",
  },
  {
    id: "listening",
    label: "Listening",
    description: "Completar palabras del audio",
    icon: Headphones,
    color: "text-[#EA580C]",
    bg: "bg-[#EA580C]/10",
  },
]

interface SkillSelectorProps {
  onStart: (skills: SkillType[]) => void
}

export default function SkillSelector({ onStart }: SkillSelectorProps) {
  const [selected, setSelected] = useState<SkillType[]>(["srs"])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load saved skills from DB
  useEffect(() => {
    let cancelled = false
    api.getStudySkills()
      .then((res) => {
        if (!cancelled && res.skills?.length > 0) {
          setSelected(res.skills as SkillType[])
        }
      })
      .catch(() => { /* use default */ })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

  const toggle = (skill: SkillType) => {
    setSelected((prev) => {
      if (prev.includes(skill)) {
        return prev.length === 1 ? prev : prev.filter((s) => s !== skill)
      }
      return [...prev, skill]
    })
  }

  const selectAll = () => {
    setSelected(SKILLS.map((s) => s.id))
  }

  const handleStart = useCallback(async () => {
    setIsSaving(true)
    try {
      await api.saveStudySkills(selected)
    } catch {
      // proceed even if save fails
    }
    setIsSaving(false)
    onStart(selected)
  }, [selected, onStart])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
            ¿Qué quieres practicar hoy?
          </h1>
          <p className="text-sm text-gray-500">
            Selecciona una o más habilidades
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6" role="group" aria-label="Habilidades disponibles">
          {SKILLS.map((skill) => {
            const isSelected = selected.includes(skill.id)
            const Icon = skill.icon
            return (
              <button
                key={skill.id}
                onClick={() => toggle(skill.id)}
                aria-pressed={isSelected}
                className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl transition-all text-center focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                  isSelected
                    ? "bg-white shadow-elevated ring-2 ring-primary"
                    : "bg-white/60 hover:bg-white hover:shadow-card"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className={`w-12 h-12 rounded-full ${skill.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${skill.color}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{skill.label}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{skill.description}</p>
                </div>
              </button>
            )
          })}
        </div>

        <div className="text-center mb-6">
          <button
            onClick={selectAll}
            className="text-xs font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            Seleccionar todo
          </button>
        </div>

        <button
          onClick={handleStart}
          disabled={isSaving}
          className="w-full bg-primary text-white font-bold py-4 rounded-full transition-all active:scale-[0.98] hover:brightness-95 shadow-lg shadow-primary/20 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Empezar sesión →"
          )}
        </button>
      </div>
    </div>
  )
}
