"use client"

interface SM2ButtonsProps {
  onAnswer: (quality: number) => void
  disabled?: boolean
}

const buttons = [
  { quality: 0, label: "Otra vez", shortcut: "1", bg: "bg-[#FEF2F2]", border: "border-[#FECACA]", text: "text-[#991B1B]" },
  { quality: 2, label: "Difícil", shortcut: "2", bg: "bg-[#FFF7ED]", border: "border-[#FED7AA]", text: "text-[#92400e]" },
  { quality: 4, label: "Bien", shortcut: "3", bg: "bg-[#EBF2FF]", border: "border-[#BFDBFE]", text: "text-[#1e40af]" },
  { quality: 5, label: "Fácil", shortcut: "4", bg: "bg-[#F0FDF4]", border: "border-[#BBF7D0]", text: "text-[#166534]" },
]

export default function SM2Buttons({ onAnswer, disabled }: SM2ButtonsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto grid grid-cols-4 gap-3 mt-6 px-2" role="group" aria-label="Calidad de respuesta">
      {buttons.map((btn) => (
        <button
          key={btn.quality}
          onClick={() => onAnswer(btn.quality)}
          disabled={disabled}
          title={`Presiona ${btn.shortcut}`}
          className={`${btn.bg} ${btn.border} ${btn.text} border font-semibold text-sm rounded-[10px] h-[52px] transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-95 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2`}
        >
          {btn.label}
        </button>
      ))}
    </div>
  )
}
