# Backend Audit Report — AnkiTube Learn

**Fecha:** 2026-05-30
**Alcance:** Full backend review — routers, models, services, utils, frontend integration

---

## 1. Resumen General

### Estado actual del backend
- **Framework:** FastAPI + MongoDB (Motor async)
- **Architectura:** Router-based con separación por dominio (auth, decks, feedback, licenses, admin)
- **Autenticación:** JWT Bearer tokens con roles (user, premium, tester, superadmin)
- **AI:** Router con fallback chain (OpenRouter → Gemini → Claude) + circuit breaker
- **Freemium:** 1 deck/day para usuarios gratuitos, validado server-side

### Nivel de integración real
- **18 endpoints** en el backend
- **16 endpoints** consumidos por el frontend
- **2 endpoints** sin consumo directo (`GET /health`, `GET /`)

### Riesgos detectados
| Riesgo | Severidad | Descripción |
|--------|-----------|-------------|
| Feedback mismatch | **CRÍTICO** | Frontend envía campos que el backend no espera |
| CORS `*` | **ALTO** | Permite cualquier origen en producción |
| Sin rate limit en auth | **ALTO** | Brute force en login/register |
| UserResponse incompleto | **MEDIO** | Frontend espera campos que backend no retorna |
| Código duplicado | **BAJO** | Lógica repetida en decks.py |

---

## 2. APIs No Implementadas Correctamente

### 2.1 CRÍTICO: Feedback Endpoint Mismatch

**Endpoint:** `POST /api/feedback`

**Frontend envía:**
```json
{
  "type": "post_generation",
  "rating": 5,
  "comment": "Great deck!",
  "card_id": "abc123",
  "issue": "bad translation",
  "deck_id": "xyz789"
}
```

**Backend espera:**
```json
{
  "moment": "post_generation",
  "quick_answer": "Buenísimas",
  "text": "Great deck!",
  "card_id": "abc123",
  "intent": "praise",
  "deck_id": "xyz789",
  "section": "cards",
  "follow_up": null,
  "anonymous_session_id": null
}
```

**Problema:** El frontend usa `type`, `rating`, `comment`, `issue`. El backend espera `moment`, `quick_answer`, `text`, `intent`. **El feedback nunca se guarda correctamente.**

**Impacto:** Datos de feedback perdidos. No hay visibilidad real de satisfacción del usuario.

**Recomendación:** Unificar el contrato. Actualizar el frontend para enviar los campos que el backend espera, o actualizar el backend para aceptar los campos del frontend.

---

### 2.2 ALTO: Admin Update Role — Body vs Query Param

**Endpoint:** `PATCH /api/admin/users/{user_id}/role`

**Frontend envía:** `{ role: "premium" }` en el body

**Backend espera:** `role` como query parameter (`?role=premium`)

```python
# Backend (admin.py línea 196-199):
async def update_user_role(
    user_id: str,
    role: str,  # ← query parameter, no body
    ...
```

**Problema:** El body enviado por el frontend es ignorado. El role nunca se actualiza.

**Recomendación:** Cambiar el backend para recibir `role` en el body, o actualizar el frontend para enviarlo como query param.

---

### 2.3 MEDIO: UserResponse Incompleto

**Frontend `UserResponse` interface:**
```typescript
interface UserResponse {
  id: string;
  email: string;
  role: string;
  setup_wizard_completed: boolean;
  generations_today: number;
  total_decks?: number;     // ← Backend no retorna
  total_cards?: number;     // ← Backend no retorna
  level?: string;           // ← Backend no retorna
  custom_name?: string;     // ← Backend no retorna
}
```

**Backend `UserResponse` model:**
```python
class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    setup_wizard_completed: bool
    generations_today: int
    # ← Falta: total_decks, total_cards, level, custom_name
```

**Impacto:** El frontend no puede mostrar stats del usuario ni nombre personalizado.

---

### 2.4 MEDIO: GenerateResponse Incompleto

**Frontend espera:** `level` y `context` en la respuesta de generate

**Backend `GenerateResponse`:**
```python
class GenerateResponse(BaseModel):
    deck_id: str
    video_title: str
    video_thumbnail: str
    video_id: str
    cards: list[Card]
    model_used: str
    total_cards: int
    # ← Falta: level, context
```

**Impacto:** El frontend no recibe el nivel y contexto del mazo generado.

---

## 3. Endpoints Desaprovechados

### 3.1 `GET /health` — No consumido por frontend
- Útil para monitoring y Railway health checks
- No requiere acción

### 3.2 `GET /` — No consumido por frontend
- Endpoint informativo
- No requiere acción

### 3.3 Servicio Mock No Conectado

**Archivo:** `services/youtube_mock.py`
**Problema:** El servicio mock existe pero nunca se importa. `decks.py` siempre importa `youtube_real`.

```python
# decks.py línea 11:
from services.youtube_real import get_transcript, transcript_to_text
# ← Nunca usa youtube_mock
```

**Config existe:** `use_mock_ai: bool = False` en `config.py` pero no se usa para cambiar la importación.

**Recomendación:** Implementar switch condicional:
```python
if settings.use_mock_ai:
    from services.youtube_mock import get_transcript, transcript_to_text
else:
    from services.youtube_real import get_transcript, transcript_to_text
```

---

## 4. Problemas Arquitectónicos

### 4.1 Duplicación de Código

#### `extract_video_id` duplicado
- `services/youtube_real.py` línea 17-27
- `services/youtube_mock.py` línea 67-77
- **Solución:** Extraer a `utils/youtube.py`

#### Ownership verification duplicado
- `decks.py` línea 208-215 (get_deck)
- `decks.py` línea 301-308 (add_card)
- Lógica idéntica verificando si el usuario es dueño del mazo
- **Solución:** Extraer a función `verify_deck_ownership(deck, user_id, anonymous_session_id)`

#### Freemium counter update duplicado
- `decks.py` línea 112-145: Lógica compleja de fechas para actualizar contadores
- `utils/freemium.py`: Ya tiene `has_exceeded_daily_limit()` con lógica similar
- **Solución:** Mover la lógica de actualización a `freemium.py`

#### Settings duplicado en decks.py
```python
# decks.py:
settings = get_settings()  # línea 19
settings = get_settings()  # línea 22 ← duplicado
```

### 4.2 Acoplamiento

**decks.py** tiene demasiada responsabilidad:
- Generación de mazos
- Gestión de transcripts
- Actualización de contadores freemium
- Verificación de ownership
- Descarga de archivos
- CRUD de tarjetas

**Recomendación:** Dividir en:
- `services/deck_service.py` — lógica de negocio
- `services/freemium_service.py` — contadores y límites
- `routers/decks.py` solo maneja HTTP

### 4.3 Deuda Técnica

| Item | Descripción | Prioridad |
|------|-------------|-----------|
| `use_mock_ai` | Config existe pero no se usa | Media |
| `WizardAnswers` | Modelo definido pero nunca se guarda en registro | Baja |
| `custom_name` | En `UserResponse` del frontend pero no en backend | Media |
| `content_reports` | Index creado en `database.py` pero no hay endpoint | Baja |
| `test_transcript_flow.py` | Test manual, no integrado en CI | Baja |

---

## 5. Recomendaciones de Mejora

### 5.1 Seguridad

| Issue | Actual | Recomendado |
|-------|--------|-------------|
| CORS | `allow_origins=["*"]` | Lista explícita de orígenes permitidos |
| Rate limit auth | Sin rate limiting | Agregar `@limiter.limit("5/minute")` en login/register |
| Rate limit feedback | Sin rate limiting | Agregar `@limiter.limit("30/minute")` |
| 2FA superadmin | Code en header | Mover a validation por request con expiración |

### 5.2 Consistencia de Contratos

| Endpoint | Frontend | Backend | Acción |
|----------|----------|---------|--------|
| `POST /api/feedback` | `type, rating, comment` | `moment, quick_answer, text` | Unificar |
| `PATCH /api/admin/users/{id}/role` | Body `{role}` | Query param `?role=` | Unificar |
| `GET /api/auth/me` | Espera `total_decks, custom_name` | No retorna | Agregar campos |
| `POST /api/decks/generate` | Espera `level, context` en response | No retorna | Agregar campos |

### 5.3 Rendimiento

| Endpoint | Issue | Mejora |
|----------|-------|--------|
| `GET /api/decks/user/my-decks` | Query sin proyección de campos innecesarios | Ya usa `{"cards": 0}` — OK |
| `GET /api/admin/users` | Sin paginación eficiente | Ya usa skip/limit — OK |
| `GET /api/admin/flagged-cards` | Pipeline aggregation sin `$limit` | Agregar `$limit` |

### 5.4 Mantenibilidad

| Area | Mejora |
|------|--------|
| Error handling | Estándarizar formato `{ detail: string, code?: string }` |
| Logging | Agregar request_id para trazabilidad |
| Testing | Integrar `test_transcript_flow.py` en CI |
| Docs | Actualizar OpenAPI schema con todos los campos |

---

## 6. Plan de Refactorización

### Prioridad Alta (Hacer primero)

| # | Tarea | Archivos | Esfuerzo |
|---|-------|----------|----------|
| 1 | **Fix feedback mismatch** — Unificar contrato frontend/backend | `routers/feedback.py`, `lib/api.ts` | 1h |
| 2 | **Fix admin update role** — Cambiar a body param | `routers/admin.py`, `lib/api.ts` | 15min |
| 3 | **Agregar campos a UserResponse** — `total_decks`, `total_cards`, `custom_name` | `models/user.py`, `routers/auth.py` | 30min |
| 4 | **Agregar campos a GenerateResponse** — `level`, `context` | `models/deck.py`, `routers/decks.py` | 15min |
| 5 | **Rate limiting en auth** — Proteger login/register de brute force | `routers/auth.py` | 15min |

### Prioridad Media (Siguiente sprint)

| # | Tarea | Archivos | Esfuerzo |
|---|-------|----------|----------|
| 6 | **Extraer `extract_video_id`** a `utils/youtube.py` | `services/youtube_real.py`, `services/youtube_mock.py` | 20min |
| 7 | **Extraer ownership check** a función reutilizable | `routers/decks.py` | 30min |
| 8 | **Mover freemium counter update** a `utils/freemium.py` | `routers/decks.py`, `utils/freemium.py` | 30min |
| 9 | **Implementar `use_mock_ai`** — Switch condicional | `routers/decks.py`, `config.py` | 20min |
| 10 | **Fix CORS** — Lista explícita de orígenes | `main.py` | 10min |
| 11 | **Agregar forgot password endpoint** | `routers/auth.py` | 1h |
| 12 | **Agregar profile update endpoint** | `routers/auth.py` | 1h |

### Mejoras Futuras (Phase 2)

| # | Tarea | Descripción |
|---|-------|-------------|
| 13 | **Refactor decks.py** — Extraer deck_service.py | Separar lógica de negocio |
| 14 | **Integrar tests en CI** | `test_transcript_flow.py` |
| 15 | **Redis para circuit breaker** | Reemplazar in-memory dict |
| 16 | **TTL index en decks** | Limpiar soft-deleted decks |
| 17 | **Standardized error format** | `{ detail, code, timestamp }` |
| 18 | **Request ID logging** | Trazabilidad de requests |

---

## 7. Tabla Resumen de Endpoints

| Método | Endpoint | Frontend | Estado | Issues |
|--------|----------|----------|--------|--------|
| POST | `/api/auth/register` | ✅ | ⚠️ | Falta `name`, `preferred_language` |
| POST | `/api/auth/login` | ✅ | ⚠️ | Sin rate limit |
| GET | `/api/auth/me` | ✅ | ⚠️ | Falta `total_decks`, `custom_name` |
| POST | `/api/decks/generate` | ✅ | ⚠️ | Falta `level`, `context` en response |
| GET | `/api/decks/user/my-decks` | ✅ | ✅ | — |
| GET | `/api/decks/{deck_id}` | ✅ | ✅ | — |
| GET | `/api/decks/{deck_id}/download` | ✅ | ✅ | — |
| POST | `/api/decks/{deck_id}/cards/add` | ✅ | ✅ | — |
| POST | `/api/decks/{deck_id}/claim` | ✅ | ✅ | — |
| DELETE | `/api/decks/{deck_id}` | ✅ | ✅ | — |
| POST | `/api/feedback` | ✅ | ❌ | **Mismatch de campos crítico** |
| POST | `/api/licenses/activate` | ✅ | ✅ | — |
| POST | `/api/licenses/admin` | ✅ | ✅ | — |
| GET | `/api/licenses/admin` | ✅ | ✅ | — |
| DELETE | `/api/licenses/admin/{code}` | ✅ | ✅ | — |
| GET | `/api/admin/metrics` | ✅ | ✅ | — |
| GET | `/api/admin/users` | ✅ | ✅ | — |
| GET | `/api/admin/feedback` | ✅ | ✅ | — |
| GET | `/api/admin/flagged-cards` | ✅ | ✅ | — |
| PATCH | `/api/admin/users/{id}/role` | ✅ | ❌ | **Body vs query param** |
| GET | `/health` | ❌ | ✅ | — |
| GET | `/` | ❌ | ✅ | — |

**Leyenda:** ✅ OK | ⚠️ Parcial | ❌ROTO

---

## 8. Conclusión

El backend tiene una arquitectura sólida para MVP con buena separación de concerns. Los problemas más críticos son:

1. **Feedback mismatch** — datos de usuario perdidos
2. **Admin role update roto** — función de administración no funciona
3. **UserResponse incompleto** — frontend sin datos de stats
4. **Sin rate limiting en auth** — vulnerable a brute force
5. **CORS abierto** — riesgo de seguridad en producción

Las mejoras de prioridad alta son ráridas (1-2 horas total) y resuelven los problemas funcionales más importantes.
