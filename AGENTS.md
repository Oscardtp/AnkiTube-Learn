# AGENTS.md — AnkiTube Learn

## Quick Start

**Backend:**
```powershell
cd backend
.venv\Scripts\activate
uvicorn main:app --reload
# API: http://127.0.0.1:8000
```

**Frontend:**
```powershell
cd frontend
npm install
npm run dev
# App: http://localhost:3000
```

## Architecture

| Directory | Purpose |
|-----------|---------|
| `backend/` | FastAPI + MongoDB + AI Router |
| `frontend/` | Next.js 14 + Tailwind |

**Entry points:**
- Backend: `backend/main.py` (FastAPI app)
- Frontend: `frontend/app/page.tsx` (Next.js router)

## Key Commands

| Task | Command |
|------|--------|
| Backend dev | `uvicorn main:app --reload` |
| Backend restart | `taskkill /F /IM uvicorn.exe` then start new process |
| Frontend dev | `npm run dev` |
| Frontend build | `npm run build` |
| Frontend typecheck | `npx tsc --noEmit` |
| Lint | `npm run lint` |

## AI Router (Critical)

**Provider fallback chain:**
```
openrouter/auto → gemini-2.0-flash → gemini-1.5-pro-002 → claude-sonnet-4-20250514
```

**Environment variables required in Railway:**
- `OPENROUTER_API_KEY` — OpenRouter key (get from openrouter.ai/keys)
- `LLM_MODEL_OPENROUTER=openrouter/auto` — auto-selects free model
- `LLM_MODEL_FLUENTE=gemini-1.5-pro-002`
- `USE_MOCK_AI=false`

**Circuit breaker:** Each provider has a 3-failure threshold, 5-min cooldown.

**⚠️ OpenRouter credits:** Account has limited credits. Keep `max_tokens` ≤ 4000 for Step 1 (card extraction). Reduce `multiplier` in `card_pipeline.py` if credits are low.

**⚠️ google.generativeai deprecated:** Emits FutureWarning on import. Migrate to `google.genai` package when possible.

## Secrets

- `.env` is gitignored. Never commit credentials.
- All secrets in Railway Dashboard as environment variables.
- `.env.example` contains required variable names (no values).

## Testing AI Providers

To verify a provider works outside the app:
```python
import httpx
r = httpx.post('https://openrouter.ai/api/v1/chat/completions',
  headers={'Authorization': 'Bearer YOUR_KEY', 'Content-Type': 'application/json'},
  json={'model': 'openrouter/auto', 'messages': [{'role': 'user', 'content': 'Hi'}], 'max_tokens': 20},
  timeout=60)
print(r.status_code, r.text[:300])
```

## Database

- **MongoDB Atlas**: `ankitube.7mtxulv.mongodb.net`
- **Collections**: users, decks, feedback, licenses
- **Soft delete**: Use `deleted_at` field, never hard delete

## Frontend API Client

`frontend/lib/api.ts` wraps all backend endpoints. All calls include JWT automatically.

## Important Constraints

- **Freemium**: 1 deck/day, max 15 cards (enforced server-side)
- **colombian_note** is mandatory on every card — cards without it are discarded
- **RegisterModal** uses `/api/decks/{id}/claim` (not `/transfer`)

## Pydantic v2 Compatibility

- Always use `Field(default=...)` not `= ""` directly in models
- Example: `grammar_note: str = Field(default="")`

## Audio Generation

- `yt-dlp` and `ffmpeg` are blocking tools — wrap in `asyncio.to_thread()` for async context
- Use `asyncio.gather()` for parallel audio clip generation
- Audio cache directory: `backend/assets/audio/`
- Static mount in FastAPI: use absolute `AUDIO_CACHE_DIR` path, not relative

## Card Generation Pipeline

1. Extract candidates from transcript (`ai_router.py` → `extract_candidates`)
2. Filter duplicates and validate
3. Generate audio clips in parallel
4. Create Anki package with `genanki`

Key files:
- `backend/services/card_pipeline.py` — orchestrates the pipeline
- `backend/services/ai_router.py` — handles LLM calls with fallback
- `backend/services/audio_service.py` — audio download and clipping
