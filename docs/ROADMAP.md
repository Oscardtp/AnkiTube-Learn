# Roadmap — AnkiTube Learn

---

## Fase 1 — MVP (Actual — Mayo 2026)

### Completado
- ✅ Backend FastAPI completo y en producción (Railway)
- ✅ MongoDB Atlas + Redis Cloud conectados
- ✅ AI Router con fallback: Gemini Flash → Gemini Pro → Claude Sonnet
- ✅ Generación de mazos .apkg con audio embebido
- ✅ Auth JWT + bcrypt + roles
- ✅ Sistema de licencias tester
- ✅ Superadmin panels + 2FA
- ✅ Frontend Next.js 14 en desarrollo
- ✅ API client centralizado (`api.ts` — 19 wrappers)
- ✅ Landing, Login, Register, Dashboard, Generate, Preview, MyDecks, Settings
- ✅ Admin: metrics, users, feedback, flagged-cards, licenses
- ✅ CardFlip 3D con CSS Grid overlay (sin medición JavaScript)
- ✅ Preview page modularizada (6 componentes)

### Pendiente
- ⏳ Página `/study/[deckId]` — motor SRS SM-2
- ⏳ Sistema feedback frontend (backend listo)
- ⏳ `custom_name` en backend + Settings UI
- ⏳ useUserStore (Zustand) — estado global
- ⏳ Botón "Faltó frase" en Preview
- ⏳ YouTube real (reemplazar mock)
- ⏳ Deploy frontend en Vercel

---

## Fase 2 — Producto Avanzado (Meses 4-8)

- YouTube real (yt-dlp + youtube-transcript-api)
- Stripe + pagos recurrentes
- Setup Wizard (5 preguntas onboarding)
- Curación guiada de mazos
- Recomendador de videos personalizado
- Plantillas pro
- Detección CEFR automática (AI)
- Celery + Redis para tareas asíncronas
- Caché de decks frecuentes

---

## Fase 3 — Motor de Skills (Meses 9-14)

- Módulos: Listening, Reading, Writing, Speaking
- Plan de estudio 8 semanas personalizado
- Firecrawl para artículos (blogs, noticias)
- Reproductor integrado (sin salir de AnkiTube)
- Sistema de reportes de contenido abusivo

---

## Fase 4 — Mobile & Scale (Mes 15+)

- App React Native (iOS/Android)
- Reproductor Anki integrado (studyMode nativo)
- Expansión Latinoamérica (México, Perú, Ecuador)

---

## Prioridades — Mayo 2026

### 🔴 Urgente
1. Integrar `POST /api/feedback` en frontend
2. Implementar `custom_name` (User model + PATCH + Settings)
3. Crear página `/study/[deckId]` (SRS SM-2)
4. Limpiar lint (unused imports, `any` types, `next/image`)

### 🟡 Alta
5. Botón "Faltó frase" → POST `/decks/{id}/cards/add`
6. Feedback 5 momentos en UI
7. useUserStore (Zustand)
8. Paginación admin

### 🟢 Media
9. YouTube real (reemplazar mock)
10. Stripe integración
11. Setup Wizard onboarding
12. Caché Redis

### 🚀 Deploy
13. Vercel frontend
14. CORS verificado
15. E2E testing
