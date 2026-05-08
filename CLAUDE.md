# AnkiTube Learn — CLAUDE.md
## Contexto completo + Estado actual
**Última actualización:** Mayo 2026 | Colombia

---

## 🚀 Qué es AnkiTube Learn

Plataforma web SaaS que convierte cualquier video de YouTube en un mazo Anki personalizado usando IA, con audio real del video embebido en cada tarjeta.

**Tagline:** "Convierte cualquier video de YouTube en tu clase de inglés personalizada."  
**Mercado:** Colombianos 22-38 años aprendiendo inglés (BPO/Call Center prioritario)  
**Dominio:** ankitubelearn.com  
**GitHub:** https://github.com/Oscardtp/AnkiTube-Learn  

---

## 📊 Estado Actual — Mayo 2026

### ✅ COMPLETO

**Backend FastAPI** — 27+ archivos, totalmente funcional
- Endpoints principales: /generate, /preview, /download, /feedback, licencias, superadmin
- MongoDB Atlas conectado
- AI Router con fallback Gemini Flash → Pro → Claude
- Genanki generando .apkg con audio embebido
- Auth con JWT + bcrypt
- Sistema de licencias tester (ANKI-XXXX-XXXX)
- Superadmin panel + 2FA en cada request
- **Módulo Call Center Training** — frases, escenarios de práctica, seguimiento de progreso

**Frontend Next.js 14** — Iniciado y en desarrollo
- Landing page (/) con generador integrado
- Página /generate con selector CEFR + contexto + barra de progreso
- Dashboard /app con navegación lateral (learn, practice, progress, settings)
- Componentes de layout: AppLayout, LandingLayout, SideNavBar, TopNavBar
- API client completo (lib/api.ts) con tipos TypeScript
- AuthContext para gestión de autenticación
- Hook useCallCenter para módulo de entrenamiento
- Tailwind CSS configurado con diseño responsive

**Problemas solucionados:**
- Python 3.14 incompatible → instalado Python 3.12
- Rust no instalado → instalado rustup
- SSL MongoDB → tls=True, tlsAllowInvalidCertificates=True
- GOOGLE_API_KEY conflictando desde env sistema → eliminada
- Contraseña MongoDB incorrecta → reseteada en Atlas
- bcrypt error → configurado con rounds=12
- APIs sin créditos → implementado modo mock

### ❌ PENDIENTE

**Frontend — Páginas faltantes:**
- /preview/[deckId] — CardFlip.tsx + video iframe + botón "Faltó frase"
- /study/[deckId] — SM-2 + fill-in-the-blank
- Auth UI — Formularios login/register modales
- Superadmin UI — Panel + LicenseManager
- FeedbackWidget — 5 momentos + botón flotante

**Integraciones:**
- NextAuth.js integración completa
- useInterruptionManager() hook global
- YouTube IFrame API en preview
- Conexión real backend-frontend (actualmente usa localhost:8000)

**Deploy** — No iniciado
- Railway para backend
- Vercel para frontend
- MongoDB Atlas ya configurado

---

## 🛠️ Stack Técnico — Confirmado y Definitivo

| Capa | Tecnología | Estado |
|---|---|---|
| **Frontend** | Next.js 14 + Tailwind CSS + TypeScript | 🟡 En desarrollo |
| **Backend** | Python FastAPI async | ✅ Completo |
| **Base datos** | MongoDB Atlas + Motor async | ✅ Conectado |
| **Caché** | Redis | ⏳ Pendiente setup |
| **IA FREE** | Gemini 2.0 Flash | ✅ En mock |
| **IA FLUENTE** | Gemini 1.5 Pro | ✅ En mock |
| **IA NATIVO** | Claude Sonnet 4 | ✅ En mock |
| **Mazos** | genanki → .apkg | ✅ Funcional |
| **YouTube (MVP)** | Mock con schema real | ✅ Funcional |
| **YouTube (Fase 2)** | youtube-transcript-api + yt-dlp + FFmpeg | ⏳ Pendiente |
| **Auth** | JWT + bcrypt (backend), AuthContext (frontend) | ✅ Backend, 🟡 Frontend |
| **Pagos** | Stripe | ⏳ Fase 2 |
| **Estado** | Zustand | ✅ Instalado |
| **Data fetching** | SWR + React Query | ✅ Instalados |

**Regla crítica:** Este stack no cambia. Nunca PostgreSQL, nunca Node.js backend, nunca Supabase, nunca Firebase.

---

## 🏗️ Estructura Backend — 27+ Archivos

```
backend/
├── main.py                    ✅ FastAPI app + CORS + rate limiting
├── config.py                  ✅ Settings con pydantic
├── database.py                ✅ MongoDB Atlas connection
├── requirements.txt           ✅ Dependencias Python
├── .env.example               ✅ Template variables entorno
├── Procfile                   ✅ Railway deploy
├── railway.json               ✅ Railway config
│
├── models/
│   ├── user.py               ✅ User schema + roles
│   ├── deck.py               ✅ Deck + Card embebido
│   ├── feedback.py           ✅ Feedback 5 momentos
│   └── license.py            ✅ Licencias tester
│
├── routers/
│   ├── auth.py               ✅ Register, login, me
│   ├── decks.py              ✅ Generate, preview, download
│   ├── feedback.py           ✅ Submit feedback
│   ├── licenses.py           ✅ Activate codes
│   ├── admin.py              ✅ Superadmin metrics
│   └── callcenter.py         ✅ Módulo entrenamiento BPO
│
├── services/
│   ├── ai_router.py          ✅ Router inteligente Gemini/Claude
│   ├── anki_service.py       ✅ Genanki .apkg generation
│   └── youtube_mock.py       ✅ Mock schema real YouTube
│
└── utils/
    ├── prompts.py            ✅ Build prompt unificado
    ├── auth.py               ✅ JWT + bcrypt
    ├── freemium.py           ✅ Límites plan gratis
    └── rate_limit.py         ✅ SlowAPI rate limiter
```

---

## 🏗️ Estructura Frontend — Next.js 14

```
frontend/
├── app/
│   ├── page.tsx              ✅ Landing page con generador
│   ├── layout.tsx            ✅ Root layout + fonts
│   ├── globals.css           ✅ Tailwind + custom styles
│   ├── generate/
│   │   └── page.tsx          ✅ Página /generate completa
│   └── app/                  ✅ Dashboard protegido
│       ├── layout.tsx        ✅ AppLayout con sidebar
│       ├── page.tsx          ✅ Dashboard home
│       ├── learn/
│       ├── practice/
│       ├── progress/
│       └── settings/
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx     ✅ Layout dashboard
│   │   ├── LandingLayout.tsx ✅ Layout landing
│   │   ├── SideNavBar.tsx    ✅ Navegación lateral
│   │   └── TopNavBar.tsx     ✅ Barra superior
│   └── Navbar.tsx            ✅ Navbar genérico
│
├── lib/
│   └── api.ts                ✅ API client completo + tipos
│
├── context/
│   └── AuthContext.tsx       ✅ Auth state management
│
├── hooks/
│   └── useCallCenter.ts      ✅ Hook módulo BPO
│
├── public/                   ✅ Assets estáticos
├── tailwind.config.ts        ✅ Configuración Tailwind
├── tsconfig.json             ✅ TypeScript config
└── package.json              ✅ Dependencias + scripts
```

---

## 🔐 Variables de Entorno — .env.example

```bash
# ── App ──────────────────────────────────────────────────────────────────────
DEBUG=false
FRONTEND_URL=http://localhost:3010

# ── MongoDB ──────────────────────────────────────────────────────────────────
MONGODB_URL=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=ankitube_learn

# ── Redis ────────────────────────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── JWT ──────────────────────────────────────────────────────────────────────
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE_MINUTES=10080

# ── AI — Gemini ───────────────────────────────────────────────────────────────
GOOGLE_API_KEY=your_google_api_key_here
LLM_MODEL_FREE=gemini-2.0-flash
LLM_MODEL_FLUENTE=gemini-1.5-pro

# ── AI — Anthropic ────────────────────────────────────────────────────────────
ANTHROPIC_API_KEY=your_anthropic_api_key_here
LLM_MODEL_NATIVO=claude-sonnet-4-20250514

# ── Superadmin 2FA ────────────────────────────────────────────────────────────
SUPERADMIN_2FA_CODE=your_6_digit_code

# ── Freemium limits ───────────────────────────────────────────────────────────
FREE_MAX_CARDS=15
FREE_MAX_DECKS_PER_DAY=1
```

**Nota:** No existe `.env` en el repositorio. Copia `.env.example` a `.env` y reemplaza los valores.

---

## ▶️ Cómo Correr el Proyecto Localmente

### Backend FastAPI

```powershell
# 1. Entrar a la carpeta backend
cd backend

# 2. Activar entorno virtual (Windows)
.venv\Scripts\activate

# Linux/Mac: source .venv/bin/activate

# 3. Instalar dependencias (primera vez)
pip install -r requirements.txt

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales reales

# 5. Arrancar el servidor
uvicorn main:app --reload

# 6. Acceder a:
# http://127.0.0.1:8000                    # Root endpoint
# http://127.0.0.1:8000/health             # Health check
# http://127.0.0.1:8000/docs               # Swagger UI (solo DEBUG=true)
```

### Frontend Next.js

```powershell
# 1. Entrar a la carpeta frontend
cd frontend

# 2. Instalar dependencias (primera vez)
npm install

# 3. Configurar variable de entorno (opcional)
# Crear .env.local con:
# NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

# 4. Arrancar servidor desarrollo
npm run dev

# 5. Acceder a:
# http://localhost:3010                    # Landing page
# http://localhost:3010/generate           # Generador
# http://localhost:3010/app                # Dashboard
```

---

## 📡 Endpoints Principales — Backend

### Auth
```
POST /api/auth/register         → Crea usuario, retorna JWT + user info
POST /api/auth/login            → Login + JWT + user info
GET  /api/auth/me               → Perfil usuario actual (requiere auth)
```

### Decks
```
POST /api/decks/generate        → Genera mazo desde YouTube (mock)
GET  /api/decks/{id}            → Obtiene deck completo
GET  /api/decks/{id}/download   → Descarga archivo .apkg
POST /api/decks/{id}/cards/add  → Añade tarjeta manualmente
GET  /api/decks/user/my-decks   → Lista decks del usuario (auth)
```

### Feedback
```
POST /api/feedback              → Envía feedback (anónimo o autenticado)
```

### Licenses
```
POST /api/licenses/activate     → Activa código tester (ANKI-XXXX-XXXX)
```

### Admin (Superadmin + 2FA requerido)
```
GET  /api/admin/metrics         → Métricas generales
GET  /api/admin/users           → Lista todos los usuarios
GET  /api/admin/feedback        → Todos los feedbacks
```

### Call Center Training
```
GET  /api/callcenter/phrases          → Lista frases BPO
GET  /api/callcenter/phrases/{id}     → Detalle frase
POST /api/callcenter/phrases/{id}/learned → Marcar frase como aprendida
GET  /api/callcenter/scenarios        → Escenarios práctica
POST /api/callcenter/practice/start   → Iniciar sesión práctica
POST /api/callcenter/practice/submit  → Enviar respuesta
POST /api/callcenter/practice/{id}/complete → Completar sesión
GET  /api/callcenter/progress         → Progreso usuario
GET  /api/callcenter/achievements     → Logros desbloqueados
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

### Completados ✅
1. ✅ Backend FastAPI completo con todos los endpoints
2. ✅ Módulo Call Center Training implementado
3. ✅ Frontend landing page (/) con generador integrado
4. ✅ Frontend página /generate funcional
5. ✅ Dashboard /app con estructura de navegación
6. ✅ API client TypeScript completo (lib/api.ts)
7. ✅ AuthContext para gestión de autenticación
8. ✅ Componentes de layout reutilizables

### Pendientes Prioritarios 🔴
9. **⏳ Página /preview/[deckId]** — CardFlip.tsx + video YouTube iframe + botón "Faltó frase"
10. **⏳ Página /study/[deckId]** — Sistema SM-2 + fill-in-the-blank + audio playback
11. **⏳ Auth UI** — Modales login/register + integración NextAuth.js
12. **⏳ useInterruptionManager()** — Hook global para control de interrupciones
13. **⏳ FeedbackWidget** — Componente flotante + 5 momentos de feedback
14. **⏳ Superadmin UI** — Panel métricas + LicenseManager

### Deploy y Producción ⏳
15. **⏳ Deploy backend** — Railway con variables de entorno
16. **⏳ Deploy frontend** — Vercel con NEXT_PUBLIC_API_URL
17. **⏳ MongoDB Atlas** — Configurar IP allowlist para producción
18. **⏳ Redis setup** — Caché para rate limiting y sesiones

---

## 🔑 Palabras Clave para Nuevas Sesiones

Cuando inicies un chat nuevo con Claude sobre AnkiTube Learn, pega este archivo y empieza con:

> "Leo el CLAUDE.md. Confirma que entendiste el contexto, estado actual y stack antes de responder."

---

## 📞 Contacto / Fundador

Oscardtp — Autodidacta colombiano frustrado con métodos tradicionales. Su propio cliente más exigente.

---

**AnkiTube Learn | CLAUDE.md | Mayo 2026 | Colombia**
