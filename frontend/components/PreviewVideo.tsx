"use client"

import { useState } from "react"
import { Play } from "lucide-react"

interface PreviewVideoProps {
  thumbnail: string
  title: string
  channel?: string
  views?: string
  videoId: string
}

export default function PreviewVideo({
  thumbnail,
  title,
  channel = "YouTube",
  views = "Ver video",
  videoId,
}: PreviewVideoProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden mb-8">
      <div className="p-3.5">
        {/* Video Container - 16:9 Aspect Ratio */}
        <div className="relative w-full bg-[#1a1a2e] rounded-2xl overflow-hidden mb-4" style={{ aspectRatio: "16/9" }}>
          {/* Thumbnail Background */}
          {!isLoaded && (
            <img
              src={thumbnail}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(0,0,0,0.7)]" />

          {/* Play Button */}
          <button
            onClick={() => setIsLoaded(true)}
            className="absolute inset-0 flex items-center justify-center hover:scale-110 transition-transform"
          >
            <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Play className="w-4 h-4 text-[#1A56DB] fill-[#1A56DB]" />
            </div>
          </button>

          {/* YouTube IFrame (hidden until clicked) */}
          {isLoaded && (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0"
            />
          )}

          {/* Video Info Overlay (bottom) */}
          {!isLoaded && (
            <div className="absolute bottom-0 left-0 right-0 p-2.5">
              <div className="text-xs font-medium text-white line-clamp-2">{title}</div>
              <div className="text-[10px] text-[rgba(255,255,255,0.6)]">{channel}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
