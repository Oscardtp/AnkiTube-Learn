# AnkiTube Learn — CLAUDE.md
## Contexto completo + Estado actual
**Última actualización:** Marzo 2026 | Colombia

---

## 🚀 Qué es AnkiTube Learn

Plataforma web SaaS que convierte cualquier video de YouTube en un mazo Anki personalizado usando IA, con audio real del video embebido en cada tarjeta.

**Tagline:** "Convierte cualquier video de YouTube en tu clase de inglés personalizada."  
**Mercado:** Colombianos 22-38 años aprendiendo inglés (BPO/Call Center prioritario)  
**Dominio:** ankitubelearn.com  
**GitHub:** https://github.com/Oscardtp/AnkiTube-Learn  
**Especificación oficial:** AnkiTubeLearn_Especificacion_v8.docx

---

## 📊 Estado Actual — Marzo 2026

### ✅ COMPLETO

**Backend FastAPI** — 27 archivos, totalmente funcional, corriendo localmente en `http://127.0.0.1:8000`
- Endpoints principales probados (/generate, /preview, /download, /feedback, licencias, superadmin)
- MongoDB Atlas conectado
- AI Router con fallback Gemini Flash → Pro → Claude
- Modo mock activado (`USE_MOCK_AI=true` en .env)
- Genanki generando .apkg con audio embebido
- Auth con JWT + bcrypt
- Sistema de licencias tester (ANKI-XXXX-XXXX)
- Superadmin panel + 2FA en cada request

**Problemas solucionados en esta sesión:**
- Python 3.14 incompatible → instalado Python 3.12
- Rust no instalado → instalado rustup
- SSL MongoDB → added tls=True, tlsAllowInvalidCertificates=True
- GOOGLE_API_KEY conflictando desde env sistema → eliminada
- Contraseña MongoDB incorrecta → reseteada en Atlas
- bcrypt error → configurado con rounds=12
- APIs sin créditos → implementado modo mock

### ❌ PENDIENTE

**Frontend Next.js 14** — No iniciado
- /generate, /preview, /dashboard, /study/[deckId], /superadmin
- CardFlip.tsx, StudySession.tsx, FeedbackWidget.tsx
- NextAuth.js integración
- useInterruptionManager() hook
- Integración YouTube IFrame API

**Deploy** — No iniciado
- Railway para backend
- Vercel para frontend
- MongoDB Atlas ya configurado

---

## 🛠️ Stack Técnico — Confirmado y Definitivo

| Capa | Tecnología | Estado |
|---|---|---|
| **Frontend** | Next.js 14 + Tailwind CSS | ⏳ Pendiente |
| **Backend** | Python FastAPI async | ✅ Completo |
| **Base datos** | MongoDB Atlas + Motor async | ✅ Conectado |
| **Caché** | Redis | ⏳ Pendiente setup |
| **IA FREE** | Gemini 2.0 Flash | ✅ En mock |
| **IA FLUENTE** | Gemini 1.5 Pro | ✅ En mock |
| **IA NATIVO** | Claude Sonnet 4 | ✅ En mock |
| **Mazos** | genanki → .apkg | ✅ Funcional |
| **YouTube (MVP)** | Mock con schema real | ✅ Funcional |
| **YouTube (Fase 2)** | youtube-transcript-api + yt-dlp + FFmpeg | ⏳ Pendiente |
| **Auth** | NextAuth.js + JWT + bcrypt | ✅ Backend, ⏳ Frontend |
| **Pagos** | Stripe | ⏳ Fase 2 |

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

## ▶️ Cómo Correr el Backend Localmente

```powershell
# 1. Entrar a la carpeta
cd backend

# 2. Activar entorno virtual (Windows)
.venv\Scripts\activate

# 3. Arrancar el servidor
uvicorn main:app --reload

# 4. Acceder a:
# http://127.0.0.1:8000                    # root
# http://127.0.0.1:8000/health             # health check
# http://127.0.0.1:8000/docs               # Swagger (solo con DEBUG=true)
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

## 🎯 Próximos Pasos — Orden Prioridad

1. ✅ Backend → completo
2. **⏳ Frontend /generate** — URL input + selector CEFR + barra progreso
3. **⏳ Frontend /preview** — CardFlip.tsx + video iframe + botón "Faltó frase"
4. **⏳ Frontend /study/[deckId]** — SM-2 + fill-in-the-blank
5. **⏳ Auth UI** — NextAuth.js + AuthModal
6. **⏳ useInterruptionManager()** — Hook global control interrupciones
7. **⏳ Sistema feedback** — 5 momentos + botón flotante
8. **⏳ Superadmin UI** — Panel + LicenseManager
9. **⏳ Deploy** — Railway backend + Vercel frontend

---

## 🔑 Palabras Clave para Nuevas Sesiones

Cuando inicies un chat nuevo con Claude sobre AnkiTube Learn, pega este archivo y empieza con:

> "Leo el CLAUDE.md. Confirma que entendiste el contexto, estado actual y stack antes de responder."

---

## 📞 Contacto / Fundador

Oscardtp — Autodidacta colombiano frustrado con métodos tradicionales. Su propio cliente más exigente.

---

**AnkiTube Learn | CLAUDE.md | Marzo 2026 | Colombia**
