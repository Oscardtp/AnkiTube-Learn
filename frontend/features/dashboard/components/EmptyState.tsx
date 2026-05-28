"use client"

import MaterialIcon from "@/components/MaterialIcon"

export function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4 mx-auto">
        <MaterialIcon name="library_books" className="text-3xl text-on-surface-variant" />
      </div>
      <h4 className="font-bold text-on-surface mb-2">No tienes mazos aún</h4>
      <p className="text-sm text-on-surface-variant max-w-[300px] mx-auto">
        Genera tu primer mazo pegando un link de YouTube arriba
      </p>
    </div>
  )
}
