# AnkiTube Learn — CLAUDE.md
## Contexto completo + Estado actual
**Última actualización:** Abril 2026 | Colombia

---

## 🚀 Qué es AnkiTube Learn

Plataforma web SaaS que convierte cualquier video de YouTube en un mazo Anki personalizado usando IA, con audio real del video embebido en cada tarjeta.

**Tagline:** "Convierte cualquier video de YouTube en tu clase de inglés personalizada."  
**Mercado:** Colombianos 22-38 años aprendiendo inglés (BPO/Call Center prioritario)  
**Dominio:** ankitubelearn.com  
**GitHub:** https://github.com/Oscardtp/AnkiTube-Learn  
**Especificación oficial:** AnkiTubeLearn_Especificacion_v8.docx

---

## 📊 Estado Actual — Abril 2026

### ✅ COMPLETO Y PRODUCCIÓN

**Backend FastAPI** — 27 archivos, producción-ready
- **Status:** ✅ Desplegado en Railway → `ankitube-learn-production.up.railway.app`
- **Base de datos:** ✅ MongoDB Atlas + Motor async conectado y funcionando
- **Cache:** ✅ Redis Cloud configurado y operativo
- **AI Router:** ✅ Gemini Flash → Gemini Pro → Claude Sonnet (fallback inteligente)
- **Endpoints:** ✅ Todos probados y verificados (/generate, /preview, /download, /feedback, /claim, licencias, superadmin)
- **Genanki:** ✅ Generando .apkg con audio embebido correctamente
- **Autenticación:** ✅ JWT + bcrypt con roles (user, premium, tester, superadmin)
- **Sistema de licencias:** ✅ Tester codes (ANKI-XXXX-XXXX) completamente operativo
- **Superadmin:** ✅ Panel + 2FA en cada request implementado

**Seguridad — Problema RESUELTO:**
- ✅ Credenciales rotadas: MongoDB, Google API, Anthropic API, JWT Secret
- ✅ `.env` removido de git tracking — nunca expondrá credenciales nuevamente
- ✅ GitHub `.gitignore` configurado correctamente (incluye planes y archivos de planificación)
- ✅ Infraestructura en Railway aislada de credenciales locales

**Problemas técnicos solucionados:**
- ✅ Python 3.14 incompatible → instalado Python 3.12
- ✅ Rust no instalado → rustup instalado
- ✅ SSL MongoDB → tls=True + tlsAllowInvalidCertificates=True
- ✅ GOOGLE_API_KEY sistema conflictando → eliminada
- ✅ Contraseña MongoDB → reseteada en Atlas
- ✅ bcrypt rounds → ajustado a 12
- ✅ APIs sin créditos → modo mock implementado

### ⏳ EN DESARROLLO — Frontend Next.js 14 (Actualizado Abril 2026)

**Estado actual:**
- ✅ `frontend/lib/api.ts` centralizado con 19 wrappers para todos los endpoints
- ✅ Token JWT enviado automáticamente en todas las peticiones (Authorization header)
- ✅ Manejo de errores 401/403 con redirección automática a login
- ✅ Corrección crítica: endpoint `/transfer` → `/claim` en RegisterModal (flujo de registro funcionando)
- ✅ Centralización total: Dashboard, MyDecks, Preview, Generate, Login, Register, Admin pages usan `api.*`
- ✅ Admin 2FA: soporte headers dinámicos `X-2FA-Code` en wrappers
- ✅ Build compilando exitosamente (errores de lint menores pendientes)

**Páginas implementadas:**
- ✅ Landing page (`/`)
- ✅ Login (`/login`)
- ✅ Register (`/register`)
- ✅ Dashboard (`/dashboard`) — estadísticas, generador URL, decks recientes
- ✅ Generate (`/generate`) — selector CEFR + contexto, barra progreso
- ✅ Preview (`/preview/[deck_id]`) — CardFlip, download, register modal
- ✅ My Decks (`/my-decks`) — lista con delete/download
- ✅ Settings (`/settings`) — nombre, nivel, notificaciones (nombre solo localStorage)
- ✅ Activate License (`/activate-license`)
- ✅ Admin panels: `/admin`, `/admin/users`, `/admin/feedback`, `/admin/flagged-cards`, `/admin/licenses`

**Endpoints frontend → backend:**
| Endpoint | Método | Estado | Usado en |
|----------|--------|--------|----------|
| `/api/auth/register` | POST | ✅ | Register page, RegisterModal |
| `/api/auth/login` | POST | ✅ | Login page |
| `/api/auth/me` | GET | ✅ | Dashboard, Settings |
| `/api/decks/generate` | POST | ✅ | Dashboard, Generate, Landing |
| `/api/decks/user/my-decks` | GET | ✅ | MyDecks, Dashboard |
| `/api/decks/{id}` | GET | ✅ | Preview |
| `/api/decks/{id}/download` | GET | ✅ | Preview, MyDecks |
| `/api/decks/{id}/claim` | POST | ✅ | RegisterModal (fixed) |
| `/api/decks/{id}` | DELETE | ✅ | MyDecks |
| `/api/decks/{id}/cards/add` | POST | ⚠️ No usado aún | — |
| `/api/feedback` | POST | ❌ NO IMPLEMENTADO frontend | — |
| `/api/licenses/activate` | POST | ✅ | ActivateLicense |
| `/api/admin/metrics` | GET | ✅ | Admin page |
| `/api/admin/users` | GET/PATCH | ✅ | Admin users |
| `/api/admin/feedback` | GET | ✅ | Admin feedback |
| `/api/admin/flagged-cards` | GET | ✅ | Admin flagged-cards |
| `/api/licenses/admin` | GET/POST/DELETE | ✅ | Admin licenses |

**Optimizaciones Backend — Fase 2 prep**
- [ ] OpenRouter como provider IA gratuito (fallback chain)
- [ ] Ollama local como último fallback (offline capability)
- [ ] Redis cache para decks frecuentes
- [ ] Rate limiting refinado por usuario/IP
- [ ] Logging estructurado para debugging

---

## 🛠️ Stack Técnico — Confirmado y Definitivo

| Capa | Tecnología | Estado | Ubicación |
|---|---|---|---|
| **Frontend** | Next.js 14 + TypeScript + Tailwind CSS | ⏳ En desarrollo (60%) | Vercel (pendiente) |
| **Backend** | Python FastAPI async | ✅ Producción | Railway |
| **Base datos** | MongoDB Atlas + Motor async | ✅ Conectado | Atlas |
| **Caché** | Redis Cloud | ✅ Operativo | Redis Cloud |
| **IA FREE** | Gemini 2.0 Flash | ✅ Funcional | Google AI |
| **IA FLUENTE** | Gemini 1.5 Pro | ✅ Funcional | Google AI |
| **IA NATIVO** | Claude Sonnet 4 (claude-sonnet-4-20250514) | ✅ Funcional | Anthropic |
| **Mazos** | genanki → .apkg | ✅ Funcional | Backend |
| **YouTube (MVP)** | Mock con schema real | ✅ Funcional | Backend |
| **YouTube (Fase 2)** | youtube-transcript-api + yt-dlp + FFmpeg | ⏳ Pendiente | Backend |
| **Auth** | JWT manual + bcrypt (sin NextAuth) | ✅ Backend + Frontend | Ambos |
| **Pagos** | Stripe | ⏳ Fase 2 | — |
| **Deploy Backend** | Railway | ✅ Activo | Railway |
| **Deploy Frontend** | Vercel | ⏳ Pendiente | Vercel |

**Regla crítica:** Este stack no cambia. Nunca PostgreSQL, nunca Node.js, nunca Supabase, nunca Firebase.

---

## 🏗️ Estructura Backend — 27 Archivos

```
backend/
├── main.py                    ✅
├── config.py                  ✅
├── database.py                ✅
├── requirements.txt           ✅
├── .env                       ✅
├── Procfile                   ✅ (Railway)
│
├── models/
│   ├── user.py               ✅
│   ├── deck.py               ✅
│   ├── feedback.py           ✅
│   └── license.py            ✅
│
├── routers/
│   ├── auth.py               ✅
│   ├── decks.py              ✅
│   ├── feedback.py           ✅
│   ├── licenses.py           ✅
│   └── admin.py              ✅
│
├── services/
│   ├── ai_router.py          ✅ (router inteligente con fallback)
│   ├── anki_service.py       ✅ (genanki)
│   └── youtube_mock.py       ✅ (schema idéntico al real)
│
└── utils/
    ├── prompts.py            ✅ (build_prompt() — mismo prompt para todos)
    ├── auth.py               ✅
    ├── freemium.py           ✅
    └── rate_limit.py         ✅
```

---

## 🔐 Variables de Entorno — .env Actual

```bash
# App
DEBUG=true
FRONTEND_URL=http://localhost:3000

# MongoDB
MONGODB_URL=mongodb+srv://ankitube_admin:PASSWORD@ankitube.7mtxulv.mongodb.net/?appName=AnkiTube
MONGODB_DB=ankitube_learn

# Redis (pendiente setup)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=tu_clave_secreta_larga
JWT_EXPIRE_MINUTES=10080

# AI — Gemini
GOOGLE_API_KEY=AIza...
LLM_MODEL_FREE=gemini-2.0-flash
LLM_MODEL_FLUENTE=gemini-1.5-pro

# AI — Anthropic
ANTHROPIC_API_KEY=sk-ant-...
LLM_MODEL_NATIVO=claude-sonnet-4-20250514

# Superadmin 2FA
SUPERADMIN_2FA_CODE=tu_codigo_6_digitos

# Freemium
FREE_MAX_CARDS=15
FREE_MAX_DECKS_PER_DAY=1

# Development (mock mode — cambiar a false con créditos IA)
USE_MOCK_AI=true
```

---

## ▶️ Cómo Correr Localmente

### Backend FastAPI
```powershell
# 1. Entrar a la carpeta
cd backend

# 2. Activar entorno virtual (Windows)
.venv\Scripts\activate

# 3. Arrancar el servidor
uvicorn main:app --reload

# 4. URLs de acceso:
# http://127.0.0.1:8000                    # root
# http://127.0.0.1:8000/health             # health check
# http://127.0.0.1:8000/docs               # Swagger (solo con DEBUG=true)
```

### Backend Railway (Producción)
```bash
# El backend está siempre disponible en:
https://ankitube-learn-production.up.railway.app

# Verifica status:
curl https://ankitube-learn-production.up.railway.app/health
```

### Frontend Next.js (Abril 2026 — En desarrollo)
```bash
# 1. Clonar e instalar
cd frontend
npm install

# 2. Variables de entorno (crear .env.local)
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000  # o URL production Railway

# 3. Correr en desarrollo
npm run dev
# http://localhost:3000

# 4. Build producción
npm run build
npm start
```

---

## 📡 Endpoints Principales — Probados ✅

**Frontend API Client:** Todos los endpoints se acceden via `frontend/lib/api.ts` wrappers (centralizado, token automático, error handling uniforme).

```
# Auth
POST /api/auth/register         → crea usuario, retorna JWT + user
POST /api/auth/login            → login + JWT + user
GET  /api/auth/me               → perfil usuario actual (incluye custom_name cuando esté implementado)

# Decks (dueño: user_id | anónimo: anonymous_session_id)
POST /api/decks/generate        → genera mazo (5-15 tarjetas según rol)
GET  /api/decks/{id}            → obtiene deck (verifica ownership o session_id)
GET  /api/decks/{id}/download   → descarga .apkg (requiere auth si user_id)
POST /api/decks/{id}/cards/add  → añade tarjeta manualmente (solo propietario)
GET  /api/decks/user/my-decks   → lista decks del usuario autenticado
POST /api/decks/{id}/claim      → transfiere mazo anónimo a usuario autenticado (usa token + opcional session_id)
DELETE /api/decks/{id}          → elimina mazo (soft delete, solo propietario)

# Feedback (5 momentos)
POST /api/feedback              → envía feedback (anonimo o auth)
                               → tipos: post_generation, post_download, card_report, nps, general
                               → rate-limit: 5/día por tipo

# Licencias
POST /api/licenses/activate     → activa código tester/licencia (asigna rol y expiración)

# Superadmin (todos requieren 2FA en header X-2FA-Code)
GET  /api/admin/metrics         → métricas globales (users, decks, feedback, licenses)
GET  /api/admin/users           → lista usuarios paginado (page, limit)
PATCH /api/admin/users/{id}/role→ actualiza rol de usuario
GET  /api/admin/feedback        → lista feedbacks con filtros (moment, intent, page, limit)
GET  /api/admin/flagged-cards   → tarjetas reportadas por usuarios
GET  /api/licenses/admin        → lista todas las licencias
POST /api/licenses/admin        → crea licencia (code, email, duration_days, internal_note)
DELETE /api/licenses/admin/{code}→ revoca licencia (cambia status a revoked)
```

---

## 🎯 Reglas de Negocio — Nunca se Rompen

1. **colombian_note obligatorio** — Si la IA no lo genera, la tarjeta se descarta
2. **Audio en backend siempre** — yt-dlp + FFmpeg en Python, nunca en frontend
3. **Freemium = 1 mazo/día** — Verificado server-side, no solo client-side
4. **Superadmin requiere 2FA** — En cada request, no solo en login
5. **Rutas públicas** — /generate y /preview nunca redirigen a login
6. **Modal no redirect** — Al tocar botón bloqueado → modal de registro sobre la misma página
7. **Mock = schema real** — `youtube_mock.py` tiene la misma firma que `youtube-transcript-api`
8. **Soft delete siempre** — Nunca borrar documentos de MongoDB, usar `deleted_at`

---

## 💰 Modelo de Precios

| Plan | Precio | IA | Límite |
|---|---|---|---|
| **Explorador** | $0 | Gemini Flash | 1 mazo/día, max 15 tarjetas |
| **Fluente** | $15.000 COP/mes | Gemini Pro | Ilimitado, todos contextos |
| **Nativo** | $120.000 COP/año | Claude Sonnet 4 | Todo + WhatsApp directo |

**Estrategia lanzamiento:** Precio fundador $39.000 COP pago único para primeros 50 usuarios.

---

## 🗂️ Schemas MongoDB — Clave

### Card (embebido en Deck)
```javascript
{
  front: String,              // "What's the rush?"
  back: String,               // "¿Cuál es la prisa?"
  keyword: String,            // "rush"
  grammar_note: String,       // "What's = What is"
  context_note: String,       // "Usado cuando algo es urgente"
  colombian_note: String,     // "¿Cuál es el afán?" — OBLIGATORIO
  timestamp_start: Number,    // 123 (segundos)
  timestamp_end: Number,      // 127
  audio_filename: String,     // "card_1.mp3"
  card_type: String           // "vocabulary" | "phrase" | "idiom" | "grammar_pattern"
}
```

### User (actualizado)
```javascript
{
  _id: ObjectId,
  email: String,              // unique
  password: String,           // bcrypt hash
  role: String,               // "user" | "premium" | "tester" | "superadmin"
  custom_name: String,        // OPCIONAL: nombre personalizado (único, case-insensitive)
  tester_expires_at: Date,
  last_generation_date: Date,
  generations_today: Number,
  setup_wizard_completed: Boolean,
  wizard_answers: {
    level: String,            // "B1"
    goal: String,
    daily_minutes: Number,
    content_type: String,
    cards_per_day: Number
  },
  created_at: Date,
  deleted_at: Date | null
}
```

### Feedback
```javascript
{
  user_id: ObjectId | null,   // null si anónimo
  deck_id: ObjectId | null,   // null si feedback general
  moment: String,             // "post_generation" | "post_download" | "card_report" | "nps" | "general"
  section: String | null,     // "generator" | "cards" | "study" | "pricing" | null
  intent: String | null,      // "report" | "suggestion" | "praise"
  quick_answer: String,       // opción elegida (ej. "5" para NPS)
  text: String | null,        // feedback texto libre
  created_at: Date
}
```

### License (Sistema Tester)
```javascript
{
  code: String,               // "ANKI-7K3P-2MNQ" — UNIQUE
  email: String,              // del tester
  duration_days: Number,      // 7, 15 o 30
  status: String,             // "pending" → "active" → "expired" → "revoked"
  activated_by: ObjectId,     // usuario que lo activó
  expires_at: Date,
  internal_note: String | null,
  created_at: Date
}
```

---

## 📋 Las 4 Fases del Producto

### Fase 1 — MVP (60% completado — Abril 2026)

**Completado:**
- ✅ URL YouTube → .apkg con audio (backend + frontend)
- ✅ CEFR selector + contexto General (frontend)
- ✅ Vista previa CardFlip 3D
- ✅ YouTube IFrame API embebido (preview)
- ✅ Botón "Descargar" → .apkg funcional
- ✅ Botón "Faltó alguna frase" → endpoint backend `POST /decks/{id}/cards/add` (no integrado frontend)
- ✅ Auth JWT + Login/Register páginas
- ✅ RegisterModal overlay — transferencia mazo anónimo con endpoint **CORREGIDO** `/claim`
- ✅ Dashboard con estadísticas + generador
- ✅ MyDecks con lista, delete, download
- ✅ Settings básico (nombre, nivel, notificaciones) — nombre solo localStorage
- ✅ Superadmin panels completos (metrics, users, feedback, flagged, licenses) + 2FA
- ✅ API client centralizado (`frontend/lib/api.ts`) con 19 wrappers
- ✅ Token JWT automático en todas las peticiones
- ✅ Manejo global 401/403 con redirect a login

**Pendiente Fase 1:**
- ⏳ Página `/study/[deckId]` — motor SRS SM-2, fill-in-the-blank, celebración
- ⏳ Sistema feedback frontend (5 momentos) — backend ✅, frontend ❌
- ⏳ useUserStore (Zustand) — estado global usuario + `custom_name` persistente
- ⏳ `custom_name` en backend (modelo User + endpoint PATCH /profile) + Settings UI
- ⏳ Botón flotante feedback en todas las páginas

### Fase 2 — Producto Avanzado (Meses 4-8)
- YouTube real (yt-dlp + youtube-transcript-api)
- Stripe + pagos recurrentes
- Setup Wizard (5 preguntas onboarding)
- Curación guiada de mazos
- Recomendador de videos personalizado
- Plantillas pro (templates de tarjetas)
- Detección CEFR automática (AI)
- Celery + Redis para tareas asíncronas
- Caché de decks frecuentes

### Fase 3 — Motor de Skills (Meses 9-14)
- Módulos: Listening, Reading, Writing, Speaking
- Plan de estudio 8 semanas personalizado
- Firecrawl para artículos (blogs, noticias)
- Reproductor integrado (sin salir de AnkiTube)
- Sistema de reportes de contenido abusivo

### Fase 4 — Mobile & Scale (Mes 15+)
- App React Native (iOS/Android)
- Reproductor Anki integrado (studyMode nativo)
- Expansión Latinoamérica (México, Perú, Ecuador)

---

## 🎯 Próximos Pasos — Prioridad Ordenada (Abril 2026)

### 🔴 Urgente (Esta semana)
1. **Integrar `POST /api/feedback`** — backend listo con rate-limit, frontend ausente
2. **Implementar `custom_name`** — User model + endpoint PATCH + Settings UI + store Zustand
3. **Crear página `/study/[deckId]`** — motor SRS SM-2 (criterios SM-2 estándar)
4. **Limpiar lint** — unused imports, `any` types, usar `next/image`

**Nota crítica:** Antes de `custom_name`, asegurar que `/api/feedback` se use (post_generation, post_download, card_report).

### 🟡 Alta (Próximas 2 semanas)
5. **Botón "Faltó frase"** en Preview → POST `/decks/{id}/cards/add` (UI + handling)
6. **Feedback 5 momentos** en:
   - Dashboard → después de generar (post_generation)
   - Preview → después de descargar (post_download)
   - CardFlip → botón "Reportar tarjeta" (card_report)
   - Settings → ocasional NPS (nps)
7. **useUserStore (Zustand)** — centralizar custom_name, level, role, sincronización con localStorage + API
8. **Paginación admin** — usuarios, feedback (soportado backend, falta UI completa)

### 🟢 Media (Mayo 2026)
9. **YouTube real** — reemplazar mock por `youtube-transcript-api` + yt-dlp
10. **Stripe integración** — planes Fluente ($15k/mes) y Nativo ($120k/año)
11. **Setup Wizard onboarding** — 5 preguntas (nivel, objetivo, minutos/día, contenido, tarjetas/día)
12. **Caché Redis** — decks frecuentes, rate limiting por usuario/IP

### 🚀 Deploy (Cuanto antes)
13. **Vercel frontend** — conectar GitHub repo + environment variables
14. **CORS verificado** — backend Railway ↔ frontend Vercel (allow_origins)
15. **E2E testing** — flujo completo:生成 → preview → download → import Anki ( smoke test )

---

| Principio | Descripción |
|---|---|
| **Calidad > cantidad** | Menos features, mejor ejecutadas |
| **Placeholder real** | Español colombiano con ejemplo específico en TODO campo |
| **IA hace el trabajo** | No transferir carga cognitiva. Resultado listo, usuario revisa |
| **Interrupción Cero** | Elemento secundario solo después de acción principal completada |
| **Mobile-first** | 80% tráfico colombiano desde móvil |
| **Value before registration** | Usuario genera/previsualiza ANTES de crear cuenta |
| **Tono colombiano** | Tuteo. "¿Listo para repasar?" no "¿Está preparado?" |

---

## 📋 Las 4 Fases del Producto

### Fase 1 — MVP (Ahora)
- URL YouTube → .apkg con audio
- CEFR selector + contexto General
- Vista previa flip 3D
- Video YouTube embebido en /preview
- Botón "Faltó alguna frase"
- Fill-in-the-blank en estudio (SM-2)
- Sistema de feedback 5 momentos
- Regla de Interrupción Cero
- Auth + roles
- Superadmin + licencias tester
- Mock YouTube

### Fase 2 — Producto Avanzado (Meses 4-8)
- YouTube real (yt-dlp)
- Stripe + pagos
- Setup Wizard (5 preguntas)
- Curación guiada
- Recomendador de videos
- Plantillas pro
- Detección CEFR automática
- Celery + Redis

### Fase 3 — Motor de Skills (Meses 9-14)
- Listening, Reading, Writing, Speaking
- Plan de estudio 8 semanas
- Firecrawl para artículos
- Reproductor integrado
- Sistema de reportes de contenido

### Fase 4 — Mobile & Scale (Mes 15+)
- App React Native
- Reproductor Anki integrado
- Expansión Latinoamérica

---

## 🎯 Próximos Pasos — Orden Estricta

### Fase 1.1 — Setup Frontend (2-3 horas)
1. ✅ Backend → completo y en Railway
2. **→ Scaffold Next.js 14** con Tailwind CSS
3. → Configurar NextAuth.js
4. → Crear Navbar + Layout base

### Fase 1.2 — Página `/generate` (4-6 horas)
5. → Input URL YouTube con placeholder "https://www.youtube.com/watch?v=..."
6. → Selector CEFR con helper text
7. → Selector contexto (General solo en MVP)
8. → Barra de progreso animada (3 pasos)
9. → POST /api/decks/generate conectado

### Fase 1.3 — Página `/preview` (6-8 horas)
10. → CardFlip.tsx — animación 3D flip
11. → YouTube IFrame API embebido
12. → Botón "Faltó alguna frase" + POST endpoint
13. → Botón "Descargar" → descarga .apkg
14. → Botón "Estudiar" → redirige a /study/[deckId]

### Fase 1.4 — Página `/study/[deckId]` (6-8 horas)
15. → Motor SRS SM-2 en frontend
16. → Fill-in-the-blank para vocabulary cards
17. → Flip 3D normal para phrase/idiom
18. → Celebración post-sesión (números específicos)

### Fase 1.5 — Autenticación UI (4-6 horas)
19. → AuthModal (overlay, no redirect)
20. → Transferencia mazo anónimo post-registro

### Fase 1.6 — Sistema Global (6-8 horas)
21. → useInterruptionManager() hook
22. → Sistema feedback (5 momentos)
23. → Botón flotante "¿Algo que mejorar?"

### Fase 1.7 — Superadmin (4 horas)
24. → Panel Superadmin UI básico
25. → LicenseManager — crear/ver/revocar códigos

### Fase 1.8 — Deploy (2-3 horas)
26. → Vercel: conectar GitHub + env vars
27. → CORS backend/frontend verificado
28. → Testing E2E: URL → .apkg en Anki

---

## 🔑 Palabras Clave para Nuevas Sesiones

Cuando inicies un chat nuevo con Claude sobre AnkiTube Learn, pega este archivo y empieza con:

> "Leo el CLAUDE.md. Confirma que entendiste el contexto, estado actual y stack antes de responder."

---

## 📞 Contacto / Fundador

Oscardtp — Autodidacta colombiano frustrado con métodos tradicionales. Su propio cliente más exigente.

---

**AnkiTube Learn | CLAUDE.md | Abril 2026 | Colombia**
