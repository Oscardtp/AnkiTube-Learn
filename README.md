# AnkiTube Learn

**Convierte cualquier video de YouTube en tu clase de inglés personalizada.**

Plataforma SaaS que transforma videos de YouTube en mazos Anki personalizados usando IA, con audio real del video embebido en cada tarjeta.

![Backend](https://img.shields.io/badge/backend-FastAPI-green)
![Frontend](https://img.shields.io/badge/frontend-Next.js%2014-blue)
![Python](https://img.shields.io/badge/python-3.12-blue)
![Licencia](https://img.shields.io/badge/licencia-MIT-green)

**Dominio:** [ankitubelearn.com](https://ankitubelearn.com) | **Backend:** Railway | **Frontend:** Vercel (pendiente)

---

## Qué es AnkiTube Learn

AnkiTube Learn es una plataforma diseñada para colombianos (22-38 años) que están aprendiendo inglés, especialmente aquellos que trabajan en BPO/Call Center.

1. **Analiza videos de YouTube** usando IA para extraer frases y vocabulario relevante
2. **Genera tarjetas Anki** (.apkg) con audio real del momento exacto del video
3. **Incluye contexto colombiano** en cada tarjeta para facilitar el aprendizaje
4. **Ofrece vista previa** antes de descargar el mazo completo

---

## Stack Técnico

| Capa | Tecnología | Estado |
|------|------------|--------|
| **Frontend** | Next.js 14 + TypeScript + Tailwind CSS | Funcional |
| **State** | Zustand + TanStack React Query | Funcional |
| **Backend** | Python FastAPI (async) | Producción |
| **Base de Datos** | MongoDB Atlas + Motor async | Activo |
| **Caché** | Redis Cloud | Activo |
| **IA** | OpenRouter → Gemini → Claude (fallback) | Activo |
| **Mazos** | genanki → .apkg con audio | Funcional |
| **YouTube** | youtube-transcript-api (real) | Funcional |
| **Auth** | JWT + bcrypt | Funcional |
| **Pagos** | Stripe | Pendiente (Fase 2) |
| **Deploy** | Railway (backend) + Vercel (frontend) | Backend en producción |

**Cadena de fallback IA:** OpenRouter (Llama 3.2 free) → OpenRouter Secondary (DeepSeek) → OpenRouter Tertiary (Gemini Flash) → Gemini Flash → error. Circuit breaker: 3 fallos → 5 min cooldown.

---

## Estructura del Proyecto

```
AnkiTube-Learn/
├── backend/                    # FastAPI API → Railway
│   ├── main.py                # Punto de entrada
│   ├── config.py              # Settings (pydantic-settings)
│   ├── database.py            # Conexión MongoDB
│   ├── models/                # Modelos de datos
│   ├── routers/               # Endpoints (auth, decks, feedback, licenses, admin)
│   ├── services/              # Lógica de negocio
│   │   ├── ai_router.py       # Router IA con fallback + circuit breaker
│   │   ├── anki_service.py    # Generación .apkg
│   │   ├── youtube_real.py    # Transcripción real
│   │   └── youtube_mock.py    # Mock para desarrollo
│   └── utils/                 # Prompts, auth, freemium, rate limiting
│
├── frontend/                  # Next.js 14 app → Vercel
│   ├── app/                   # App Router (14 páginas)
│   │   ├── page.tsx           # Landing page
│   │   ├── dashboard/         # Dashboard de usuario
│   │   ├── preview/[deck_id]/ # Vista previa de mazos
│   │   ├── admin/             # Panel admin (5 sub-páginas)
│   │   ├── login/             # Login
│   │   ├── register/          # Registro
│   │   └── ...
│   ├── components/            # 20+ componentes UI
│   ├── features/              # Módulos feature-based
│   │   ├── landing/           # Secciones de landing
│   │   └── dashboard/         # Componentes del dashboard
│   ├── hooks/                 # Custom hooks (useDeck, useCurrentUser, etc.)
│   ├── stores/                # Zustand stores
│   ├── lib/api.ts             # API client centralizado (19 endpoints)
│   └── types/                 # TypeScript types
│
├── docs/                      # Documentación detallada
├── workspace colaborativo/    # Specs, screenshots, planes
└── CLAUDE.md                  # Contexto para IA
```

---

## Requisitos Previos

### Backend

- **Python 3.12** (3.14 no es compatible)
- **MongoDB Atlas** (cuenta gratuita)
- **Redis** (opcional en local, necesario en producción)

### Frontend

- **Node.js 18+**
- **npm**

### APIs

- **OpenRouter API Key** (obligatoria — proveedor primario de IA)
- Google API Key (Gemini — fallback)
- Anthropic API Key (Claude — fallback)

---

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Oscardtp/AnkiTube-Learn.git
cd AnkiTube-Learn
```

### 2. Configurar Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# Mac/Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Editar .env con tus credenciales
```

### 3. Configurar Frontend

```bash
cd frontend
npm install
```

### 4. Variables de Entorno

Copiar `backend/.env.example` y completar:

```bash
# MongoDB
MONGODB_URL=mongodb+srv://usuario:password@cluster.mongodb.net/?appName=AnkiTube
MONGODB_DB=ankitube_learn

# JWT
JWT_SECRET=tu_clave_secreta_larga

# AI — OpenRouter (proveedor primario)
OPENROUTER_API_KEY=tu_api_key_de_openrouter

# AI — Gemini (fallback)
GOOGLE_API_KEY=AIza...

# AI — Anthropic (fallback)
ANTHROPIC_API_KEY=sk-ant-...

# Superadmin 2FA
SUPERADMIN_2FA_CODE=tu_codigo_6_digitos

# Development
USE_MOCK_AI=true  # Cambiar a false con IA real
```

Frontend: crear `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## Cómo Usar

### Backend

```bash
cd backend
.venv\Scripts\activate  # Windows
uvicorn main:app --reload
```

- **API:** http://127.0.0.1:8000
- **Health:** http://127.0.0.1:8000/health
- **Swagger:** http://127.0.0.1:8000/docs (solo con DEBUG=true)

### Frontend

```bash
cd frontend
npm run dev
```

- **App:** http://localhost:3000

---

## API Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar nuevo usuario |
| POST | `/api/auth/login` | Login + JWT token |
| GET | `/api/auth/me` | Perfil usuario actual |

### Mazos (Decks)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/decks/generate` | Generar mazo desde YouTube |
| GET | `/api/decks/{id}` | Obtener mazo específico |
| GET | `/api/decks/{id}/download` | Descargar .apkg |
| POST | `/api/decks/{id}/cards/add` | Añadir tarjeta manual |
| POST | `/api/decks/{id}/claim` | Reclamar mazo anónimo |
| DELETE | `/api/decks/{id}` | Eliminar mazo (soft delete) |
| GET | `/api/decks/user/my-decks` | Lista mazos del usuario |

### Feedback

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/feedback` | Enviar feedback (anónimo o auth) |

### Licencias

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/licenses/activate` | Activar código tester |

### Admin (Superadmin + 2FA)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/metrics` | Métricas generales |
| GET | `/api/admin/users` | Lista todos los usuarios |
| PATCH | `/api/admin/users/{id}/role` | Cambiar rol de usuario |
| GET | `/api/admin/feedback` | Todos los feedbacks |
| GET | `/api/admin/flagged-cards` | Tarjetas reportadas |
| GET | `/api/licenses/admin` | Listar licencias |
| POST | `/api/licenses/admin` | Crear licencia |
| DELETE | `/api/licenses/admin/{code}` | Eliminar licencia |

---

## Modelo de Precios

| Plan | Precio | IA | Límite |
|------|--------|-----|--------|
| **Explorador** | $0 COP/mes | OpenRouter (gratis) | 1 mazo/día, max 15 tarjetas |
| **Fluente** | $15.000 COP/mes | Gemini Pro | Ilimitado, todos contextos |
| **Nativo** | $120.000 COP/año | Claude Sonnet 4 | Todo + WhatsApp directo |

**Precio fundador:** $39.000 COP pago único para primeros 50 usuarios.

---

## Roadmap

### Fase 1 — MVP (Actual)

- [x] Backend FastAPI completo
- [x] Generación de mazos con IA (OpenRouter + fallback)
- [x] Transcripción real de YouTube
- [x] Sistema de licencias tester
- [x] Panel superadmin con 2FA
- [x] Frontend funcional (Landing, Dashboard, Preview, Admin)
- [x] Auth JWT completo (backend + frontend)
- [x] Sistema de feedback
- [ ] Deploy frontend en Vercel

### Fase 2 — Producto Avanzado

- [ ] Estudio con sistema SM-2 (spaced repetition)
- [ ] YouTube embed en preview
- [ ] Stripe + pagos
- [ ] Setup Wizard (5 preguntas)
- [ ] Curación guiada
- [ ] Recomendador de videos
- [ ] Celery + Redis (tareas en segundo plano)

### Fase 3 — Motor de Skills

- [ ] Listening, Reading, Writing, Speaking
- [ ] Plan de estudio 8 semanas
- [ ] Reproductor integrado

### Fase 4 — Mobile & Scale

- [ ] App React Native
- [ ] Expansión Latinoamérica

---

## Reglas de Negocio

1. `colombian_note` obligatorio — sin él, tarjeta se descarta
2. Audio siempre en backend — yt-dlp + FFmpeg, nunca en frontend
3. Freemium = 1 mazo/día — verificado server-side
4. Superadmin requiere 2FA — en cada request
5. Soft delete siempre — usar `deleted_at`, nunca borrar de MongoDB
6. Mock = schema real — `youtube_mock.py` misma firma que el real

---

## Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

Lee `CLAUDE.md` para entender el contexto completo del proyecto.

---

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## Contacto

**Fundador:** Oscardtp
**Email:** oscardtp15@gmail.com
**Sitio Web:** [ankitubelearn.com](https://ankitubelearn.com)

> *"Autodidacta colombiano frustrado con métodos tradicionales."*

---

Hecho en Colombia 🇨🇴 para ayudar a colombianos a aprender inglés de manera efectiva y contextualizada.
