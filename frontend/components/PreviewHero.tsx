"use client"

interface PreviewHeroProps {
  level: string
  cardCount: number
  title: string
  context: string
  userName?: string
  isAuthenticated: boolean
}

function getBadgeColors(level: string) {
  const levelUpper = level.toUpperCase()
  if (levelUpper.startsWith("A")) {
    return { bg: "#F3F4F6", text: "#374151" }
  } else if (levelUpper.startsWith("B")) {
    return { bg: "#E1F5EE", text: "#085041" }
  } else {
    return { bg: "#EEEDFE", text: "#3C3489" }
  }
}

export default function PreviewHero({
  level,
  cardCount,
  title,
  context,
  userName,
  isAuthenticated,
}: PreviewHeroProps) {
  const badgeColors = getBadgeColors(level)

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden mb-8">
      <div className="p-4.5 md:p-6">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold mb-2.5"
          style={{ backgroundColor: badgeColors.bg, color: badgeColors.text }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: badgeColors.text }} />
          {level.toUpperCase()}
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: badgeColors.text }} />
          {cardCount} tarjetas
        </div>

        {/* Title */}
        <h1 className="text-xl md:text-2xl font-bold text-[#111827] mb-1.5 leading-tight">
          {isAuthenticated && userName ? (
            <>
              <span className="text-[#1A56DB]">{userName}</span>, tu mazo está listo
            </>
          ) : (
            "Tu mazo está listo"
          )}
        </h1>

        {/* Subtitle */}
        <p className="text-sm text-[#6B7280]">
          {title} · {level} · {context}
        </p>
      </div>
    </div>
  )
}
