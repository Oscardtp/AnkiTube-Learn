export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="h-14 bg-white border-b border-outline-variant/20" />

      <div className="md:ml-64 p-6 md:p-8 lg:p-12 max-w-[1600px]">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-surface-container-high rounded-lg animate-pulse" />
            <div className="h-4 w-48 bg-surface-container rounded-md animate-pulse" />
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-container-high animate-pulse" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-high animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-surface-container-high rounded animate-pulse" />
                  <div className="h-6 w-12 bg-surface-container rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-48 bg-surface-container-lowest rounded-[2rem] border border-outline-variant/10 mb-8 animate-pulse" />

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-surface-container-lowest rounded-xl border border-outline-variant/10 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
