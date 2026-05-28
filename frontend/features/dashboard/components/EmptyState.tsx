"use client"

import MaterialIcon from "@/components/MaterialIcon"

export function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4 mx-auto">
        <MaterialIcon name="library_books" className="text-3xl text-on-surface-variant" />
      </div>
      <h4 className="font-bold text-on-surface mb-2">Tu primer mazo te espera</h4>
      <p className="text-sm text-on-surface-variant max-w-[300px] mx-auto mb-4">
        Pegá el link de cualquier video de YouTube y tenés tus tarjetas en 30 segundos.
      </p>
      <div className="bg-surface-container-low rounded-xl p-4 max-w-[320px] mx-auto text-left">
        <p className="text-xs font-bold text-on-surface mb-2">No sabés por dónde empezar?</p>
        <div className="space-y-1.5">
          <p className="text-xs text-on-surface-variant flex items-center gap-2">
            <MaterialIcon name="theaters" className="text-sm text-primary" />
            Series con subtítulos en inglés
          </p>
          <p className="text-xs text-on-surface-variant flex items-center gap-2">
            <MaterialIcon name="mic" className="text-sm text-primary" />
            Podcasts sobre temas que te gustan
          </p>
          <p className="text-xs text-on-surface-variant flex items-center gap-2">
            <MaterialIcon name="menu_book" className="text-sm text-primary" />
            Charlas TED en tu área profesional
          </p>
        </div>
      </div>
    </div>
  )
}
