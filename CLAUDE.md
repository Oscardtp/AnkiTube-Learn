# AnkiTube Learn

Plataforma SaaS que convierte videos de YouTube en mazos Anki personalizados con IA y audio real embebido.

**Mercado:** Colombianos 22-38 años aprendiendo inglés (BPO/Call Center)  
**Dominio:** ankitubelearn.com | **Backend:** Railway | **Frontend:** Vercel (pendiente)

---

## Stack

| Capa | Tecnología | Estado |
|------|------------|--------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS + Zustand | En desarrollo |
| Backend | Python FastAPI async | ✅ Producción |
| DB | MongoDB Atlas + Motor async | ✅ |
| Cache | Redis Cloud | ✅ |
| IA | Gemini Flash/Pro + Claude Sonnet 4 (fallback) | ✅ |
| Mazos | genanki → .apkg con audio | ✅ |
| Auth | JWT + bcrypt (sin NextAuth) | ✅ |

**Regla:** No cambiar stack. No PostgreSQL, no Node.js, no Supabase, no Firebase.

---

## Correr Localmente

```bash
# Backend
cd backend && .venv\Scripts\activate && uvicorn main:app --reload
# http://127.0.0.1:8000/docs

# Frontend
cd frontend && npm run dev
# http://localhost:3000
```

**Variables frontend:** `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000`

---

## Reglas de Negocio (inquebrantables)

1. `colombian_note` obligatorio — sin él, tarjeta se descarta
2. Audio siempre en backend — yt-dlp + FFmpeg, nunca en frontend
3. Freemium = 1 mazo/día — verificado server-side
4. Superadmin requiere 2FA — en cada request
5. Rutas públicas — `/generate` y `/preview` nunca redirigen a login
6. Modal sobre redirect — botón bloqueado → modal de registro
7. Mock = schema real — `youtube_mock.py` misma firma que el real
8. Soft delete siempre — usar `deleted_at`, nunca borrar de MongoDB

---

## Estructura

```
backend/          FastAPI API (27 archivos) → Railway
frontend/         Next.js 14 app → Vercel
workspace colaborativo/   Specs, screenshots, planes
```

**Frontend clave:**
- `frontend/lib/api.ts` — 19 wrappers centralizados, token automático
- `frontend/stores/` — Zustand stores
- `frontend/components/CardFlip.tsx` — Tarjeta 3D con CSS Grid overlay
- `frontend/app/preview/[deck_id]/` — Página preview modular

---

## Modelos de Datos Clave

**Card** (embebida en Deck): `front`, `back`, `keyword`, `grammar_note`, `context_note`, `colombian_note` (obligatorio), `timestamp_start/end`, `audio_filename`, `card_type`

**User**: `email`, `password` (bcrypt), `role` (user/premium/tester/superadmin), `custom_name` (opcional), `wizard_answers`, `deleted_at`

**License**: `code` (ANKI-XXXX-XXXX), `status` (pending→active→expired→revoked), `duration_days`, `expires_at`

---

## Precios

| Plan | Precio | IA | Límite |
|------|--------|----|--------|
| Explorador | $0 | Gemini Flash | 1 mazo/día, max 15 tarjetas |
| Fluente | $15.000 COP/mes | Gemini Pro | Ilimitado |
| Nativo | $120.000 COP/año | Claude Sonnet 4 | Todo + WhatsApp |

**Lanzamiento:** $39.000 COP pago único (primeros 50 usuarios)

---

## Documentación Detallada

- `docs/BACKEND_ENDPOINTS.md` — Todos los endpoints documentados
- `docs/FRONTEND_PLAN_IA.md` — Plan de diseño frontend
- `docs/MONGODB_SCHEMAS.md` — Schemas completos de MongoDB
- `docs/ROADMAP.md` — Fases 1-4 del producto
- `docs/ENVVariables.md` — Variables de entorno

---

## Para Nuevas Sesiones

> "Leo el CLAUDE.md. Confirma que entendiste el contexto antes de responder."

---

**Contacto:** Oscardtp — Autodidacta colombiano, fundador  
**AnkiTube Learn | Mayo 2026 | Colombia**
