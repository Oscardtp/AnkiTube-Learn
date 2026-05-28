"use client"

function SkeletonPulse({ className = "" }: { className?: string }) {
  return <div className={`bg-surface-container-high rounded-lg animate-pulse ${className}`} />
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-800/30 p-5 rounded-2xl border border-outline-variant/10">
          <div className="flex items-center justify-between mb-3">
            <SkeletonPulse className="w-10 h-10 rounded-xl" />
            <SkeletonPulse className="w-16 h-3 rounded" />
          </div>
          <SkeletonPulse className="w-20 h-7 rounded mb-1" />
          <SkeletonPulse className="w-24 h-3 rounded" />
        </div>
      ))}
    </div>
  )
}

export function DeckCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-outline-variant/10 p-3.5">
      <div className="flex items-center gap-3">
        <SkeletonPulse className="w-14 h-10 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonPulse className="w-3/4 h-4 rounded" />
          <div className="flex gap-2">
            <SkeletonPulse className="w-8 h-4 rounded-full" />
            <SkeletonPulse className="w-16 h-3 rounded" />
          </div>
        </div>
        <SkeletonPulse className="w-5 h-5 rounded-full" />
      </div>
    </div>
  )
}

export function GeneratorSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800/30 rounded-2xl border border-outline-variant/10 p-6">
      <SkeletonPulse className="w-40 h-5 rounded mb-2" />
      <SkeletonPulse className="w-56 h-3 rounded mb-4" />
      <div className="flex gap-3">
        <SkeletonPulse className="flex-1 h-12 rounded-xl" />
        <SkeletonPulse className="w-24 h-12 rounded-xl" />
      </div>
      <div className="mt-4 flex gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonPulse key={i} className="w-10 h-8 rounded-full" />
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-surface p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      <SkeletonPulse className="w-48 h-8 rounded mb-2" />
      <SkeletonPulse className="w-64 h-4 rounded mb-8" />
      <GeneratorSkeleton />
      <StatsSkeleton />
      <SkeletonPulse className="w-32 h-6 rounded mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <DeckCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
