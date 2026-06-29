"use client"

import { useState } from "react"
import { Play } from "lucide-react"

interface VideoEmbedProps {
  videoId: string
  thumbnail: string
  title: string
}

export default function VideoEmbed({ videoId, thumbnail, title }: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false)

  if (playing) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-gray-900 group cursor-pointer" onClick={() => setPlaying(true)}>
      {/* Thumbnail */}
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-opacity"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700" />
        )}

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 text-[#1A56DB] ml-0.5" fill="#1A56DB" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2.5 right-2.5 bg-black/70 text-white text-[11px] font-medium px-1.5 py-0.5 rounded">
          Video
        </div>

        {/* YouTube badge */}
        <div className="absolute bottom-2.5 left-2.5 bg-black/70 text-white text-[11px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1">
          <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
            <rect width="10" height="7" rx="1.5" fill="#FF0000"/>
            <path d="M4 2l3 1.5L4 5z" fill="white"/>
          </svg>
          YouTube
        </div>
      </div>

      {/* Video info bar */}
      <div className="flex items-center gap-3 p-3 bg-white">
        <div className="w-5 h-3.5 bg-[#FF0000] rounded-[3px] flex items-center justify-center shrink-0">
          <svg width="6" height="4" viewBox="0 0 10 7" fill="white">
            <path d="M4 2l3 1.5L4 5z"/>
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-gray-900 truncate">{title}</p>
        </div>
      </div>
    </div>
  )
}
