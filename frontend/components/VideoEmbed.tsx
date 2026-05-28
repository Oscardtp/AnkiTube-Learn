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
      <div className="mb-8 w-full aspect-video rounded-2xl overflow-hidden shadow-elevated">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className="mb-8">
      <button
        onClick={() => setPlaying(true)}
        className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-elevated group cursor-pointer"
        aria-label={`Reproducir video: ${title}`}
      >
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 text-on-surface ml-1" fill="currentColor" />
          </div>
        </div>
      </button>
    </div>
  )
}
