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
| Benchmark | `cd backend && python -m tests.benchmark_pedagogical` |

## AI Router (Critical)

**Provider fallback chain:**
```
Curator: nvidia_llama_3.3 → nvidia_llama_3.1 → openrouter/auto → gemini-flash
Designer: nvidia_llama_3.3 → nemotron-ultra → qwen3-next → openrouter/auto → gemini-flash
```

**Environment variables required in Railway:**
- `OPENROUTER_API_KEY` — OpenRouter key (get from openrouter.ai/keys)
- `LLM_MODEL_OPENROUTER=openrouter/auto` — auto-selects free model
- `LLM_MODEL_FLUENTE=gemini-1.5-pro-002`
- `USE_MOCK_AI=false`

**Circuit breaker:** Each provider has a 3-failure threshold, 5-min cooldown.

**⚠️ OpenRouter credits:** Account has limited credits. Keep `max_tokens` ≤ 4000 for Step 1 (card extraction). Reduce `multiplier` in `card_pipeline.py` if credits are low.

**⚠️ google.generativeai deprecated:** Emits FutureWarning on import. Migrate to `google.genai` package when possible.

## AI Router — Dual-Role Architecture (v2)

The AI Router uses two specialized roles with independent fallback chains:

### 🟢 LLM #1 — Pedagogical Curator (Step 1: Extraction)
**Role:** Extract candidate phrases from transcripts with high precision.
**Priority:** Nvidia Llama 3.3 70B → Llama 3.1 70B → OpenRouter auto (free) → Gemini Flash

| Provider Key | Model | Purpose |
|--------------|-------|---------|
| `nvidia_curator_primary` | meta/llama-3.3-70b-instruct | Primary |
| `nvidia_curator_secondary` | meta/llama-3.1-70b-instruct | Fallback |
| `openrouter` | openrouter/auto | Free fallback |
| `flash` | gemini-2.0-flash | Last resort |

**Config:** `temperature=0.3`, `max_tokens=4096`

### 🟢 LLM #2 — Learning Designer (Step 3: Selection/Design)
**Role:** Select and design pedagogically excellent flashcards.
**Priority:** Nvidia Llama 3.3 70B → Nemotron Ultra → Qwen3-next → OpenRouter auto (free) → Gemini Flash

| Provider Key | Model | Purpose |
|--------------|-------|---------|
| `nvidia_designer_primary` | meta/llama-3.3-70b-instruct | Primary |
| `nvidia_designer_secondary` | nvidia/nemotron-ultra-253b | Fallback |
| `nvidia_designer_tertiary` | qwen/qwen3-next-80b-a3b-instruct | Fallback |
| `openrouter` | openrouter/auto | Free fallback |
| `flash` | gemini-2.0-flash | Last resort |

**Config:** `temperature=0.2`, `max_tokens=4096`

### Circuit Breaker
Each provider has independent circuit breaker state per role.
After 3 consecutive failures → 5 min cooldown.

### Running Benchmarks
```bash
cd backend
python -m tests.benchmark_pedagogical --role curator
python -m tests.benchmark_pedagogical --role designer
python -m tests.benchmark_pedagogical --role both
```

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
