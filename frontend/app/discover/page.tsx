"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import MaterialIcon from "@/components/MaterialIcon"

interface CuratedVideo {
  id: string
  video_id: string
  title: string
  thumbnail: string
  channel: string
  duration_seconds: number
  tags: string[]
  level: string
  description: string | null
}

interface Tag {
  name: string
  count: number
}

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-green-100 text-green-800",
  A2: "bg-teal-100 text-teal-800",
  B1: "bg-blue-100 text-blue-800",
  B2: "bg-purple-100 text-purple-800",
  C1: "bg-orange-100 text-orange-800",
  C2: "bg-red-100 text-red-800",
}

const TAG_LABELS: Record<string, string> = {
  bpo: "BPO / Call Center",
  tech: "Tech / Desarrollo",
  gaming: "Gaming",
  travel: "Viajes",
  general: "General",
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

export default function DiscoverPage() {
  const router = useRouter()
  const [videos, setVideos] = useState<CuratedVideo[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  const fetchVideos = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (selectedTag) params.append("tag", selectedTag)
      if (selectedLevel) params.append("level", selectedLevel)
      const data = await api.getDiscoverVideos(selectedTag, selectedLevel, page)
      setVideos(data.videos)
      setTotal(data.total)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [page, selectedTag, selectedLevel])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  useEffect(() => {
    api.getDiscoverTags().then((data) => setTags(data.tags)).catch(() => {})
  }, [])

  const handleTagClick = (tagName: string) => {
    setSelectedTag((prev) => (prev === tagName ? null : tagName))
    setPage(1)
  }

  const handleLevelClick = (level: string) => {
    setSelectedLevel((prev) => (prev === level ? null : level))
    setPage(1)
  }

  const handleGenerateDeck = (videoId: string) => {
    router.push(`/generate?video_id=${videoId}`)
  }

  return (
    <div className="min-h-screen bg-surface">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <h1 className="text-2xl md:text-3xl font-black text-on-surface tracking-tight">
          Descubre contenido
        </h1>
        <p className="text-on-surface-variant text-sm mt-1 mb-6">
          Videos curados por nicho para aprender inglés
        </p>

        {/* Tag chips */}
        <section className="mb-5">
          <h2 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
            Categorías
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tags.map((tag) => (
              <button
                key={tag.name}
                onClick={() => handleTagClick(tag.name)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  selectedTag === tag.name
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-on-surface border-gray-200 hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                {TAG_LABELS[tag.name] || tag.name}
                <span className="ml-1.5 text-xs opacity-70">{tag.count}</span>
              </button>
            ))}
            {tags.length === 0 && !loading && (
              <p className="text-sm text-on-surface-variant">No hay categorías disponibles</p>
            )}
          </div>
        </section>

        {/* Level filter */}
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
            Nivel
          </h2>
          <div className="flex gap-2 flex-wrap">
            {["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => (
              <button
                key={level}
                onClick={() => handleLevelClick(level)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
                  selectedLevel === level
                    ? `${LEVEL_COLORS[level]} border-current shadow-sm`
                    : "bg-white text-on-surface-variant border-gray-200 hover:border-primary/40"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </section>

        {/* Video grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl bg-white border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-16">
            <MaterialIcon name="video_library" className="text-5xl text-on-surface-variant/40 mb-3" />
            <p className="text-on-surface-variant font-medium">No se encontraron videos</p>
            <p className="text-sm text-on-surface-variant/70 mt-1">
              Intenta con otra categoría o nivel
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="rounded-xl bg-white border border-gray-100 overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-200 group flex flex-col"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute bottom-2 right-2 bg-black/75 text-white text-xs font-medium px-1.5 py-0.5 rounded">
                    {formatDuration(video.duration_seconds)}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start gap-2 mb-2">
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded text-xs font-bold ${
                        LEVEL_COLORS[video.level] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {video.level}
                    </span>
                    <div className="flex gap-1 flex-wrap min-w-0">
                      {video.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs"
                        >
                          {TAG_LABELS[t] || t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-on-surface line-clamp-2 mb-1">
                    {video.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-3">{video.channel}</p>

                  {video.description && (
                    <p className="text-xs text-on-surface-variant/70 line-clamp-2 mb-3">
                      {video.description}
                    </p>
                  )}

                  <div className="mt-auto">
                    <button
                      onClick={() => handleGenerateDeck(video.video_id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-[#1648c2] transition-colors"
                    >
                      <MaterialIcon name="auto_awesome" className="text-base" />
                      Generar mazo
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-sm text-on-surface-variant">
              Página {page} de {Math.ceil(total / limit)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
