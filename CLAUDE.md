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
- **Endpoints:** ✅ Todos probados y verificados (/generate, /preview, /download, /feedback, licencias, superadmin)
- **Genanki:** ✅ Generando .apkg con audio embebido correctamente
- **Autenticación:** ✅ JWT + bcrypt con roles (user, premium, tester, superadmin)
- **Sistema de licencias:** ✅ Tester codes (ANKI-XXXX-XXXX) completamente operativo
- **Superadmin:** ✅ Panel + 2FA en cada request implementado

**Seguridad — Problema RESUELTO:**
- ✅ Credenciales rotadas: MongoDB, Google API, Anthropic API, JWT Secret
- ✅ `.env` removido de git tracking — nunca expondrá credenciales nuevamente
- ✅ GitHub `.gitignore` configurado correctamente
- ✅ Infraestructura en Railway aislada de credenciales locales

**Problemas técnicos solucionados:**
- ✅ Python 3.14 incompatible → instalado Python 3.12
- ✅ Rust no instalado → rustup instalado
- ✅ SSL MongoDB → tls=True + tlsAllowInvalidCertificates=True
- ✅ GOOGLE_API_KEY sistema conflictando → eliminada
- ✅ Contraseña MongoDB → reseteada en Atlas
- ✅ bcrypt rounds → ajustado a 12
- ✅ APIs sin créditos → modo mock implementado

### ⏳ EN DESARROLLO — Próximas Prioridades

**Frontend Next.js 14** — Arquitectura confirmada, build iniciado
- [ ] **Fase 1.1:** Scaffold + Navbar + Layout base (2 horas)
- [ ] **Fase 1.2:** Página `/generate` 
  - [ ] Input URL YouTube
  - [ ] Selector CEFR (A1-C2)
  - [ ] Selector contexto (General MVP)
  - [ ] Barra de progreso animada (Extrayendo → Analizando → Generando)
- [ ] **Fase 1.3:** Página `/preview`
  - [ ] CardFlip.tsx — animación 3D
  - [ ] YouTube IFrame API embebido
  - [ ] Botón "Faltó alguna frase" + POST /api/decks/{id}/cards/add
  - [ ] Botón "Descargar" y "Estudiar"
- [ ] **Fase 1.4:** Página `/study/[deckId]`
  - [ ] Motor SRS SM-2
  - [ ] Fill-in-the-blank para tarjetas vocabulary
  - [ ] Flip 3D normal para phrase/idiom
  - [ ] Celebración post-sesión
- [ ] **Fase 1.5:** Sistema de autenticación UI
  - [ ] NextAuth.js configurado
  - [ ] AuthModal (no redirect, overlay en misma página)
  - [ ] Transferencia mazo anónimo post-registro
- [ ] **Fase 1.6:** Funciones globales
  - [ ] useInterruptionManager() hook — control de pop-ups/notifications
  - [ ] Sistema de feedback (5 momentos + botón flotante "¿Algo que mejorar?")
  - [ ] Panel Superadmin UI + LicenseManager
- [ ] **Fase 1.7:** Deploy
  - [ ] Vercel setup (conexión GitHub)
  - [ ] Environment variables en Vercel
  - [ ] CORS backend/frontend verificado

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
| **Frontend** | Next.js 14 + Tailwind CSS | ⏳ En desarrollo | Vercel |
| **Backend** | Python FastAPI async | ✅ Producción | Railway |
| **Base datos** | MongoDB Atlas + Motor async | ✅ Conectado | Atlas |
| **Caché** | Redis Cloud | ✅ Operativo | Redis Cloud |
| **IA FREE** | Gemini 2.0 Flash | ✅ Funcional | Google AI |
| **IA FLUENTE** | Gemini 1.5 Pro | ✅ Funcional | Google AI |
| **IA NATIVO** | Claude Sonnet 4 (claude-sonnet-4-20250514) | ✅ Funcional | Anthropic |
| **Mazos** | genanki → .apkg | ✅ Funcional | Backend |
| **YouTube (MVP)** | Mock con schema real | ✅ Funcional | Backend |
| **YouTube (Fase 2)** | youtube-transcript-api + yt-dlp + FFmpeg | ⏳ Pendiente | Backend |
| **Auth** | NextAuth.js + JWT + bcrypt | ✅ Backend, ⏳ Frontend | Ambos |
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

### Frontend Next.js (cuando esté listo)
```bash
# Próximo: scaffold en Vercel
cd frontend
npm install
npm run dev
# http://localhost:3000
```

---

## 📡 Endpoints Principales — Probados ✅

```
POST /api/auth/register         → crea usuario, retorna JWT
POST /api/auth/login            → login + JWT
GET  /api/auth/me               → perfil usuario actual
POST /api/decks/generate        → genera 5 tarjetas mock con colombian_note
GET  /api/decks/{id}            → obtiene deck
GET  /api/decks/{id}/download   → descarga .apkg
POST /api/decks/{id}/cards/add  → añade tarjeta manualmente
GET  /api/decks/user/my-decks   → lista decks del usuario
POST /api/feedback              → envía feedback (anonimo o auth)
POST /api/licenses/activate     → activa código tester
GET  /api/admin/metrics         → métricas (superadmin + 2FA)
GET  /api/admin/users           → lista usuarios (superadmin + 2FA)
GET  /api/admin/feedback        → todos los feedbacks (superadmin + 2FA)
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
  card_type: String           // "vocabulary" | "phrase" | "idiom"
}
```

### Feedback
```javascript
{
  user_id: ObjectId | null,   // null si anónimo
  deck_id: ObjectId | null,   // null si feedback general
  moment: String,             // "post_generation" | "post_study" | "card_report" | "general" | "nps"
  section: String,            // "generator" | "cards" | "study" | "pricing" | null
  intent: String,             // "report" | "suggestion" | "praise"
  quick_answer: String,       // opción elegida
  text: String,               // feedback texto libre
  created_at: Date
}
```

### License (Sistema Tester)
```javascript
{
  code: String,               // "ANKI-7K3P-2MNQ" — UNIQUE
  email: String,              // del tester
  duration_days: Number,      // 7, 15 o 30
  status: String,             // "pending" → "active" → "expired"
  activated_by: ObjectId,     // usuario que lo activó
  expires_at: Date
}
```

---

## 🎨 Diseño — Principios Inamovibles

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
