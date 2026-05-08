# AnkiTube Learn 🚀

**Convierte cualquier video de YouTube en tu clase de inglés personalizada.**

Plataforma web SaaS que transforma videos de YouTube en mazos Anki personalizados usando IA, con audio real del video embebido en cada tarjeta.

![Estado](https://img.shields.io/badge/estado-en%20desarrollo-yellow)
![Backend](https://img.shields.io/badge/backend-FastAPI-green)
![Frontend](https://img.shields.io/badge/frontend-Next.js%2014-blue)
![Python](https://img.shields.io/badge/python-3.12-blue)
![Licencia](https://img.shields.io/badge/licencia-MIT-green)

---

## 📖 Tabla de Contenidos

- [Qué es AnkiTube Learn](#-qué-es-ankitube-learn)
- [Características](#-características)
- [Stack Técnico](#-stack-técnico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Cómo Usar](#-cómo-usar)
- [API Endpoints](#-api-endpoints)
- [Modelo de Precios](#-modelo-de-precios)
- [Roadmap](#-roadmap)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## ✨ Qué es AnkiTube Learn

AnkiTube Learn es una plataforma diseñada para colombianos (22-38 años) que están aprendiendo inglés, especialmente aquellos que trabajan en BPO/Call Center. La aplicación:

1. **Analiza videos de YouTube** usando IA para extraer frases y vocabulario relevante
2. **Genera tarjetas Anki** (.apkg) con audio real del video embebido
3. **Incluye contexto colombiano** en cada tarjeta para facilitar el aprendizaje
4. **Ofrece vista previa** antes de descargar el mazo completo

**Tagline:** "Convierte cualquier video de YouTube en tu clase de inglés personalizada."

**Dominio:** [ankitubelearn.com](https://ankitubelearn.com)  
**GitHub:** [github.com/Oscardtp/AnkiTube-Learn](https://github.com/Oscardtp/AnkiTube-Learn)

---

## 🎯 Características

### ✅ Completadas (Backend)

- **Generación de mazos con IA**: Convierte videos en 5-15 tarjetas de estudio
- **Audio embebido**: Cada tarjeta incluye audio real del momento exacto del video
- **Notas contextuales**: Incluye gramática, contexto y equivalente colombiano
- **Sistema de licencias**: Códigos tester para usuarios beta (ANKI-XXXX-XXXX)
- **Panel Superadmin**: Métricas, gestión de usuarios y feedback con 2FA
- **Auth JWT**: Registro, login y protección de rutas
- **Feedback integrado**: Sistema de reportes en 5 momentos clave
- **Modo Freemium**: 1 mazo/día, máximo 15 tarjetas para usuarios gratuitos

### ⏳ En Desarrollo (Frontend)

- Interfaz de generación de mazos
- Vista previa de tarjetas con flip 3D
- Sesiones de estudio con sistema SM-2
- Dashboard de usuario
- Integración con NextAuth.js

---

## 🛠️ Stack Técnico

| Capa | Tecnología | Estado |
|------|------------|--------|
| **Frontend** | Next.js 14 + Tailwind CSS | ⏳ En desarrollo |
| **Backend** | Python FastAPI (async) | ✅ Completo |
| **Base de Datos** | MongoDB Atlas + Motor async | ✅ Conectado |
| **Caché** | Redis | ⏳ Pendiente |
| **IA FREE** | Gemini 2.0 Flash | ✅ Configurado |
| **IA FLUENTE** | Gemini 1.5 Pro | ✅ Configurado |
| **IA NATIVO** | Claude Sonnet 4 | ✅ Configurado |
| **Mazos** | genanki → .apkg | ✅ Funcional |
| **YouTube** | Mock (Fase 1) / yt-dlp (Fase 2) | ✅ Mock listo |
| **Auth** | NextAuth.js + JWT + bcrypt | ✅ Backend, ⏳ Frontend |
| **Pagos** | Stripe | ⏳ Fase 2 |
| **Deploy** | Railway (backend) + Vercel (frontend) | ⏳ Pendiente |

---

## 📁 Estructura del Proyecto

```
AnkiTube-Learn/
├── backend/                 # API FastAPI
│   ├── main.py             # Punto de entrada
│   ├── config.py           # Configuración
│   ├── database.py         # Conexión MongoDB
│   ├── requirements.txt    # Dependencias Python
│   ├── Procfile            # Deploy Railway
│   ├── models/             # Modelos de datos
│   │   ├── user.py
│   │   ├── deck.py
│   │   ├── feedback.py
│   │   └── license.py
│   ├── routers/            # Endpoints API
│   │   ├── auth.py
│   │   ├── decks.py
│   │   ├── feedback.py
│   │   ├── licenses.py
│   │   └── admin.py
│   ├── services/           # Lógica de negocio
│   │   ├── ai_router.py    # Router IA con fallback
│   │   ├── anki_service.py # Generación .apkg
│   │   └── youtube_mock.py # Mock YouTube
│   └── utils/              # Utilidades
│       ├── prompts.py      # Prompts IA
│       ├── auth.py         # Auth helpers
│       ├── freemium.py     # Límites free
│       └── rate_limit.py   # Rate limiting
│
├── frontend/               # App Next.js 14
│   ├── app/               # App Router
│   ├── components/        # Componentes React
│   ├── context/           # Context API
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilidades
│   └── public/            # Assets estáticos
│
├── CLAUDE.md              # Documentación completa
└── README.md              # Este archivo
```

---

## 📋 Requisitos Previos

### Backend

- **Python 3.12** (3.14 no es compatible)
- **Rust** (para algunas dependencias)
- **MongoDB Atlas** (cuenta gratuita)
- **Redis** (opcional, para caché)

### Frontend

- **Node.js 18+**
- **npm** o **yarn**

### APIs (Opcional - tiene modo mock)

- Google API Key (Gemini)
- Anthropic API Key (Claude)

---

## 🔧 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Oscardtp/AnkiTube-Learn.git
cd AnkiTube-Learn
```

### 2. Configurar Backend

```bash
cd backend

# Crear entorno virtual
python -m venv .venv

# Activar entorno (Windows)
.venv\Scripts\activate

# Activar entorno (Mac/Linux)
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus credenciales
# MONGODB_URL, JWT_SECRET, API Keys, etc.
```

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Copiar variables de entorno (si aplica)
cp .env.example .env.local
```

### 4. Variables de Entorno (.env)

```bash
# App
DEBUG=true
FRONTEND_URL=http://localhost:3000

# MongoDB
MONGODB_URL=mongodb+srv://usuario:password@cluster.mongodb.net/?appName=AnkiTube
MONGODB_DB=ankitube_learn

# Redis
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

# Development
USE_MOCK_AI=true  # Cambiar a false con créditos IA reales
```

---

## ▶️ Cómo Usar

### Iniciar Backend

```bash
cd backend
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Mac/Linux

uvicorn main:app --reload
```

Acceder a:
- **Raíz:** http://127.0.0.1:8000
- **Health:** http://127.0.0.1:8000/health
- **Swagger Docs:** http://127.0.0.1:8000/docs (solo DEBUG=true)

### Iniciar Frontend

```bash
cd frontend
npm run dev
```

Acceder a: http://localhost:3000

---

## 📡 API Endpoints

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
| GET | `/api/admin/feedback` | Todos los feedbacks |

---

## 💰 Modelo de Precios

| Plan | Precio | IA | Límite |
|------|--------|-----|--------|
| **Explorador** | $0 COP/mes | Gemini Flash | 1 mazo/día, max 15 tarjetas |
| **Fluente** | $15.000 COP/mes | Gemini Pro | Ilimitado, todos contextos |
| **Nativo** | $120.000 COP/año | Claude Sonnet 4 | Todo + WhatsApp directo |

**Precio fundador:** $39.000 COP pago único para primeros 50 usuarios.

---

## 🗺️ Roadmap

### ✅ Fase 1 — MVP (Actual)

- [x] Backend FastAPI completo
- [x] Generación de mazos con IA
- [x] Sistema de licencias tester
- [x] Panel superadmin con 2FA
- [ ] Frontend /generate
- [ ] Frontend /preview con CardFlip
- [ ] Frontend /study con SM-2
- [ ] Deploy Railway + Vercel

### ⏳ Fase 2 — Producto Avanzado (Meses 4-8)

- [ ] YouTube real (yt-dlp + FFmpeg)
- [ ] Stripe + pagos
- [ ] Setup Wizard (5 preguntas)
- [ ] Curación guiada
- [ ] Recomendador de videos
- [ ] Celery + Redis

### ⏳ Fase 3 — Motor de Skills (Meses 9-14)

- [ ] Listening, Reading, Writing, Speaking
- [ ] Plan de estudio 8 semanas
- [ ] Firecrawl para artículos
- [ ] Reproductor integrado

### ⏳ Fase 4 — Mobile & Scale (Mes 15+)

- [ ] App React Native
- [ ] Reproductor Anki integrado
- [ ] Expansión Latinoamérica

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Sigue estos pasos:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

Por favor, lee `CLAUDE.md` para entender el contexto completo del proyecto.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 📞 Contacto

**Fundador:** Oscardtp  
**Email:** contacto@ankitubelearn.com  
**Sitio Web:** [ankitubelearn.com](https://ankitubelearn.com)

> *"Autodidacta colombiano frustrado con métodos tradicionales. Su propio cliente más exigente."*

---

## 🇨🇴 Hecho en Colombia

AnkiTube Learn está desarrollado en Colombia 🇨🇴 para ayudar a colombianos a aprender inglés de manera efectiva y contextualizada.

**¡Únete a la revolución del aprendizaje de inglés!** 🚀
