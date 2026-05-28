# Backend Endpoints — API Reference

**Base URL:** `https://ankitube-learn-production.up.railway.app` (producción)  
**Local:** `http://127.0.0.1:8000`  
**Docs:** `http://127.0.0.1:8000/docs` (solo con DEBUG=true)

---

## Auth

| Endpoint | Método | Descripción | Auth |
|----------|--------|-------------|------|
| `/api/auth/register` | POST | Crear usuario → JWT + user | No |
| `/api/auth/login` | POST | Login → JWT + user | No |
| `/api/auth/me` | GET | Perfil usuario actual | Sí |

## Decks

| Endpoint | Método | Descripción | Auth |
|----------|--------|-------------|------|
| `/api/decks/generate` | POST | Generar mazo (5-15 tarjetas) | No* |
| `/api/decks/{id}` | GET | Obtener deck | No** |
| `/api/decks/{id}/download` | GET | Descargar .apkg | Sí*** |
| `/api/decks/{id}/cards/add` | POST | Añadir tarjeta manual | Sí |
| `/api/decks/user/my-decks` | GET | Lista decks del usuario | Sí |
| `/api/decks/{id}/claim` | POST | Transferir mazo anónimo | Sí |
| `/api/decks/{id}` | DELETE | Soft delete deck | Sí |

\* Rate-limit: 5/día para free users  
\** Verifica ownership o session_id  
\*** Requiere auth si tiene user_id

## Feedback

| Endpoint | Método | Descripción | Auth |
|----------|--------|-------------|------|
| `/api/feedback` | POST | Enviar feedback | No |

**Tipos:** `post_generation`, `post_download`, `card_report`, `nps`, `general`  
**Rate-limit:** 5/día por tipo

## Licencias

| Endpoint | Método | Descripción | Auth |
|----------|--------|-------------|------|
| `/api/licenses/activate` | POST | Activar código tester | No |

## Superadmin (requiere 2FA header `X-2FA-Code`)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/admin/metrics` | GET | Métricas globales |
| `/api/admin/users` | GET | Lista usuarios paginado |
| `/api/admin/users/{id}/role` | PATCH | Actualizar rol |
| `/api/admin/feedback` | GET | Lista feedbacks con filtros |
| `/api/admin/flagged-cards` | GET | Tarjetas reportadas |
| `/api/licenses/admin` | GET/POST | Lista/crear licencias |
| `/api/licenses/admin/{code}` | DELETE | Revocar licencia |

---

## Frontend API Client

Todos los endpoints se acceden via `frontend/lib/api.ts`:
- Token JWT automático en header
- Manejo uniforme de errores 401/403
- 19 wrappers centralizados
