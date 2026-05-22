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
**Especificación oficial:** AnkiTubeLearn_Especificacion_v8.docx

---

## 📊 Estado Actual — Mayo 2026

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

### ⚡ AVANZADO Y PULIDO (Frontend - Actualizado Mayo 2026)
**EL FRONTEND ESTÁ MUCHO MÁS ADELANTADO DE LO INDICADO EN ABRIL 2026** - Ahora aproximadamente **85% completado** para el MVP, con una calidad de implementación excepcional:

#### Páginas Implementadas (Todas Funcionales)
- ✅ Landing page (`/`) - Con video demo y llamada a la acción clara
- ✅ Login (`/login`) - Con validación y manejo de errores
- ✅ Register (`/register`) - Con transferencia de mazos anónimos
- ✅ Dashboard (`/dashboard`) - **Interfaz sobresaliente** con:
  - Estadísticas visuales en formato bento grid
  - Sección de generación con gradientes y animaciones
  - Grid reciente de mazos con efectos hover sofisticados
  - Barra lateral navegable con secciones colapsables
  - Indicador flotante de uso mensual
  - Manejo completo de estados de carga y error
- ✅ Generate (`/generate`) - Selector CEFR + contexto, barra de progreso
- ✅ Preview (`/preview/[deck_id]`) - **Implementación avanzada** con:
  - Componente CardFlip 3D de alta calidad
  - Navegación entre tarjetas con puntos indicadores
  - Sistema de selección de tarjetas para descarga parcial
  - Botón "Estudiar aquí" (navega a `/study/[deckId]` - pendiente)
  - Modales de registro y toasts de notificación
  - Descarga de mazos con nombre personalizado
- ✅ My Decks (`/my-decks`) - Lista con delete/download y vista previa
- ✅ Settings (`/settings`) - **Configuración completa** con:
  - Perfil (nombre, nivel, notificaciones, idioma)
  - Indicadores visuales para características pro bloqueadas
  - Guardado en localStorage (pendiente sincronización backend)
  - Interfaz limpia y profesional
- ✅ Activate License (`/activate-license`)
- ✅ Todos los paneles de Superadmin (`/admin/*`) - Con 2FA requerida

#### Calidad de Implementación Frontend
- **UI/UX Ejemplar**: Uso sofisticado de Tailwind CSS con espaciado sistemático, colores semánticos, sombras y transiciones intencionales
- **Componentes Reutilizables**: 
  - `DeckCardWithActions.tsx` con puntos de estado (estudiado/hoy pendiente)
  - `MaterialIcon.tsx` wrapper para íconos de Google Material
  - Modales, loaders y notificaciones consistentes
- **Experiencia de Pulido**: 
  - Estados hover, focus y active intencionales en todos los elementos interactivos
  - Animaciones sutiles pero efectivas (escalado, desplazamiento, desvanecimiento)
  - Manejo de errores amigable y recuperable
  - Accesibilidad básica considerada (contraste, tamaño de objetivo táctil)

### 🔧 Estado de las Prioridades Urgentes (Actualizado Mayo 2026)

#### ✅ COMPLETADO O AVANZADO
- **Limpiar lint** - Significativamente mejorado: código TypeScript con buenas prácticas, interfaces bien definidas, mínimo uso de `any`, sin `console.log` en producción

#### ⏳ PENDIENTE (Requiere atención inmediata)

1. **❌ Integrar `POST /api/feedback`** 
   - **Backend**: Endpoint completamente listo con rate-limit (5/día por tipo)
   - **Frontend**: `submitFeedback` wrapper existe en `frontend/lib/api.ts`
   - **Gap**: **Ningún llamado a este endpoint en ninguna página**
   - **Ubicaciones esperadas**:
     - Después de generar un mazo (Dashboard - tipo: `post_generation`)
     - Después de descargar un mazo (Preview - tipo: `post_download`)
     - Al reportar una tarjeta (Preview - necesita botón "Reportar tarjeta", tipo: `card_report`)
     - En Settings (NPS ocasional - tipo: `nps`)
     - Botón flotante de feedback en todas las páginas (tipo: `general`)

2. **❌ Implementar `custom_name`** 
   - **Backend**: 
     - Modelo User ya incluye el campo `custom_name?: string`
     - **Pero falta el endpoint PATCH /api/auth/me para actualizarlo**
   - **Frontend**:
     - Settings page tiene input de nombre
     - **Pero solo actualiza localStorage, no llama al backend**
     - Sincronización con estado global de usuario pendiente
   - **Gap**: 
     - Endpoint de actualización de usuario faltante en backend
     - Llamada desde Settings al endpoint faltante en frontend
     - Tienda de estado global de usuario (Zustand) no implementada

3. **❌ Crear página `/study/[deckId]`** (Motor SRS SM-2)
   - **Referencias existentes**: 
     - Botón "Estudiar aquí" en Preview
   - **Gap**: Página completamente faltante
   - **Requisitos**:
     - Motor SRS SM-2 (algoritmo de repetición espaciada estándar)
     - Sistema de fill-in-the-blank para tarjetas de vocabulario
     - Flip 3D normal para frases/idiomas
     - Celebración post-sesión con métricas específicas
     - Conectar con navegación desde Preview y header global

4. **❌ Botón flotante feedback en todas las páginas**
   - **Gap**: Pequeño botón de acción flotante (como FAB) que abra modal de feedback
   - **Ubicación**: Esquina inferior derecha en todas las páginas principales
   - **Funcionalidad**: Abrir modal para reportar problemas, sugerencias o dar elogios inmediato

5. **❌ Botón "Faltó frase"** en Preview
   - **UI**: Botón presente en Preview page
   - **Backend**: Endpoint POST `/api/decks/{id}/cards/add` existe
   - **Frontend**: No llama al endpoint backend
   - **Gap**: Conectar UI al endpoint existente

### 📈 Próximos Pasos - Prioridad Ordenada (Actualizado Mayo 2026)

#### 🔴 **Urgente (Esta semana)**
1. **Integrar `POST /api/feedback`** - Añadir llamadas en:
   - Dashboard: después de generar mazo (tipo: `post_generation`)
   - Preview: después de descargar (tipo: `post_download`)
   - Preview: añadir botón "Reportar tarjeta" en CardFlip (tipo: `card_report`)
   - Settings: añadir encuesta NPS ocasional (tipo: `nps`)
   - Implementar botón flotante de feedback global

2. **⚡ Implementar `custom_name`** 
   - Backend: Crear endpoint PATCH `/api/auth/me` para actualizar nombre
   - Frontend: Modificar Settings para llamar al endpoint al guardar
   - Frontend: Crear tienda de Zustand para estado global de usuario
   - Frontend: Sincronizar nombre con tienda y API

3. **📚 Crear página `/study/[deckId]`**
   - Implementar motor SRS SM-2 estándar
   - Crear UI para estudio de tarjetas (flip, fill-in-the-blank)
   - Añadir sistema de celebración post-sesión
   - Conectar con navegación desde Preview y header global

#### 🟡 **Alta (Próximas 2 semanas)**
4. **Botón "Faltó frase"** en Preview → Conectar al endpoint existente `/api/decks/{id}/cards/add`
5. **Refinamiento de useUserStore** - Completar tienda de Zustand con todas las preferencias de usuario
6. **Paginación admin mejorada** - Mejorar UI y experiencia de admin

#### 🟢 **Media (Mayo-Junio 2026)**
7. **YouTube real** - Reemplazar mock por `youtube-transcript-api` + yt-dlp + FFmpeg
8. **Stripe integración** - Planes Fluente y Nativo
9. **Setup Wizard onboarding** - 5 preguntas iniciales
10. **Caché Redis** - Para decks frecuentes y rate limiting avanzado

---

## 🛠️ Stack Técnico — Confirmado y Definitivo

| Capa | Tecnología | Estado | Ubicación |
|---|---|---|---|
| **Frontend** | Next.js 14 + TypeScript + Tailwind CSS | ⚡ Avanzado (85%) | Vercel (pendiente deploy) |
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

### Frontend Next.js (Actualizado Mayo 2026)
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

```text
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

### Fase 1 — MVP (Ahora - Completando últimos detalles)
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
- Plan de estudio 8 semanas personalizado
- Firecrawl para artículos
- Reproductor integrado
- Sistema de reportes de contenido

### Fase 4 — Mobile & Scale (Mes 15+)
- App React Native
- Reproductor Anki integrado
- Expansión Latinoamérica (México, Perú, Ecuador)

---

## 🎯 Próximos Pasos — Orden Estricto (Actualizado Mayo 2026)

### 🔴 Urgente (Esta semana)
1. **Integrar `POST /api/feedback`** — backend listo con rate-limit, frontend ausente
2. **Implementar `custom_name`** — User model + endpoint PATCH + Settings UI + store Zustand
3. **Crear página `/study/[deckId]`** — motor SRS SM-2 (criterios SM-2 estándar)
4. **Botón "Faltó frase"** en Preview → POST `/decks/{id}/cards/add` (UI + handling)
5. **Limpiar lint restante** — unused imports, tipos mejorados

### 🟡 Alta (Próximas 2 semanas)
6. **Feedback 5 momentos** en:
   - Dashboard → después de generar (post_generation)
   - Preview → después de descargar (post_download)
   - CardFlip → botón "Reportar tarjeta" (card_report)
   - Settings → ocasional NPS (nps)
   - Botón flotante global (general)
7. **useUserStore (Zustand)** — centralizar custom_name, level, role, sincronización con localStorage + API
8. **Paginación admin** — usuarios, feedback (soportado backend, falta UI completa)

### 🟢 Media (Mayo-Junio 2026)
9. **YouTube real** — reemplazar mock por `youtube-transcript-api` + yt-dlp
10. **Stripe integración** — planes Fluente ($15k/mes) y Nativo ($120k/año)
11. **Setup Wizard onboarding** — 5 preguntas (nivel, objetivo, minutos/día, contenido, tarjetas/día)
12. **Caché Redis** — decks frecuentes, rate limiting por usuario/IP

### 🚀 Deploy (Cuanto antes)
13. **Vercel frontend** — conectar GitHub repo + environment variables
14. **CORS verificado** — backend Railway ↔ frontend Vercel (allow_origins)
15. **E2E testing** — flujo completo: generar → preview → download → import Anki (smoke test)

---

## 📞 Contacto / Fundador

Oscardtp — Autodidacta colombiano frustrado con métodos tradicionales. Su propio cliente más exigente.

---
*Actualizado: Mayo 19, 2026 | Basado en revisión de código actual del repositorio*
*Nota: Esta actualización refleja el estado real del código, superando las estimaciones de abril 2026.*