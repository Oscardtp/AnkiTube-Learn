# Environment Variables — AnkiTube Learn

---

## Backend (.env)

```bash
# App
DEBUG=true
FRONTEND_URL=http://localhost:3000

# MongoDB
MONGODB_URL=mongodb+srv://ankitube_admin:PASSWORD@ankitube.7mtxulv.mongodb.net/?appName=AnkiTube
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
USE_MOCK_AI=true  # Cambiar a false con créditos IA
```

---

## Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000  # Local
# NEXT_PUBLIC_API_URL=https://ankitube-learn-production.up.railway.app  # Producción
```

---

## Railway (Producción)

Variables configuradas en Railway Dashboard:
- Todas las variables del backend
- `PORT=8000`
- `RAILWAY_STATIC_URL` para archivos estáticos

---

## Vercel (Pendiente)

Variables a configurar:
- `NEXT_PUBLIC_API_URL=https://ankitube-learn-production.up.railway.app`
