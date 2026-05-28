# Frontend Design Plan — AnkiTube Learn

---

## Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Material Design 3 tokens
- **State:** Zustand (global) + React Query (server)
- **HTTP:** `lib/api.ts` centralizado
- **Auth:** JWT manual (sin NextAuth)

---

## Arquitectura de Componentes

```
frontend/
├── app/                    # Pages (App Router)
│   ├── page.tsx           # Landing
│   ├── login/             # Login
│   ├── register/          # Register
│   ├── dashboard/         # Dashboard principal
│   ├── generate/          # Generador de mazos
│   ├── preview/[deck_id]/ # Preview de mazo
│   ├── study/[deck_id]/   # Estudio SRS (pendiente)
│   ├── my-decks/          # Mis mazos
│   ├── settings/          # Configuración
│   ├── activate-license/  # Activar licencia
│   └── admin/             # Superadmin panels
│
├── components/            # Componentes reutilizables
│   ├── CardFlip.tsx       # Tarjeta 3D con CSS Grid
│   ├── PreviewNavbar.tsx  # Navbar de preview
│   ├── DeckHeader.tsx     # Header con badge CEFR
│   ├── VideoEmbed.tsx     # Embed YouTube
│   ├── CardCarousel.tsx   # Carrusel de tarjetas
│   ├── ActionButtons.tsx  # Download/Study/Generate
│   ├── MissingPhraseWidget.tsx
│   └── FeedbackBanner.tsx
│
├── hooks/                 # Custom hooks
│   ├── useDeck.ts         # React Query para deck
│   ├── usePreviewSession.ts
│   ├── useFeedbackTrigger.ts
│   └── useInterruptionManager.ts
│
├── stores/                # Zustand stores
│   ├── usePreviewStore.ts
│   └── useUserStore.ts    # (pendiente)
│
├── context/               # React Context
│   └── NotificationContext.tsx
│
├── lib/                   # Utilidades
│   └── api.ts             # 19 wrappers centralizados
│
└── types/                 # TypeScript types
    └── preview.ts
```

---

## Estándares de Código

- **Componentes:** Functional components + hooks
- **Estilos:** Tailwind CSS, Material Design 3 tokens
- **State server:** React Query para datos del backend
- **State client:** Zustand para estado global UI
- **Types:** TypeScript estricto, interfaces para props
- **Naming:** PascalCase componentes, camelCase funciones/variables
- **Archivos:** Un componente por archivo, nombre igual al componente

---

## Reglas de UI

1. **Mobile-first** — 80% tráfico desde móvil
2. **Modal sobre redirect** — botón bloqueado → modal
3. **Interrupción Cero** — elementos secundarios solo después de acción principal
4. **Tono colombiano** — tuteo, "¿Listo para repasar?"
5. **Placeholder real** — español con ejemplo específico

---

## Design Tokens (Material Design 3)

```css
--primary: #006A6A;
--primary-container: #6FF6F6;
--on-surface: #191C1C;
--on-surface-variant: #3F4946;
--surface-container-lowest: #FFFFFF;
--outline: #6F7979;
--outline-variant: #BFC9C8;
```
