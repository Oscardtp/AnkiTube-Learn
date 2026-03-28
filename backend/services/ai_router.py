"""
Central AI Router — the brain of AnkiTube Learn.
All AI calls go through here. Never call Gemini or Anthropic directly from routes.

Fallback order: Gemini Flash → Gemini Pro → Claude → error
Circuit breaker: skip provider for 5 min after 3 consecutive failures.
"""

import json
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Optional

import google.generativeai as genai
import anthropic

from config import get_settings
from models.deck import Card
from utils.prompts import build_prompt

logger = logging.getLogger(__name__)
settings = get_settings()

# Configure clients
genai.configure(api_key=settings.google_api_key)
anthropic_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

# Circuit breaker state — in-memory for MVP (Redis in Phase 2)
_circuit_breaker: dict[str, dict] = {
    "flash": {"failures": 0, "open_until": None},
    "pro": {"failures": 0, "open_until": None},
    "claude": {"failures": 0, "open_until": None},
}

# Map user tier to provider key
TIER_TO_PROVIDER = {
    "user": "flash",
    "tester": "pro",
    "premium": "pro",
    "superadmin": "claude",
    "nativo": "claude",
}

PROVIDER_TO_MODEL = {
    "flash": settings.llm_model_free,
    "pro": settings.llm_model_fluente,
    "claude": settings.llm_model_nativo,
}


def _is_circuit_open(provider: str) -> bool:
    """Returns True if this provider should be skipped."""
    state = _circuit_breaker[provider]
    if state["open_until"] is None:
        return False
    if datetime.utcnow() >= state["open_until"]:
        # Reset after cooldown
        state["failures"] = 0
        state["open_until"] = None
        return False
    return True


def _record_failure(provider: str) -> None:
    state = _circuit_breaker[provider]
    state["failures"] += 1
    if state["failures"] >= settings.circuit_breaker_threshold:
        state["open_until"] = datetime.utcnow() + timedelta(
            seconds=settings.circuit_breaker_cooldown_seconds
        )
        logger.warning(f"Circuit breaker OPEN for {provider} until {state['open_until']}")


def _record_success(provider: str) -> None:
    _circuit_breaker[provider]["failures"] = 0
    _circuit_breaker[provider]["open_until"] = None


def _validate_cards(raw_cards: list[dict]) -> list[Card]:
    """
    Validate and filter AI output. Cards without colombian_note are discarded.
    Returns list of valid Card objects.
    """
    valid_cards = []
    for raw in raw_cards:
        # colombian_note is mandatory — discard card if missing or empty
        if not raw.get("colombian_note", "").strip():
            logger.warning(f"Card discarded — missing colombian_note: {raw.get('front', 'unknown')}")
            continue
        try:
            card = Card(**raw)
            valid_cards.append(card)
        except Exception as e:
            logger.warning(f"Card validation failed: {e} — raw: {raw}")
            continue
    return valid_cards


async def _call_gemini(
    model_name: str,
    system_prompt: str,
    user_prompt: str,
    temperature: float,
    max_output_tokens: int,
) -> list[dict]:
    """Call Gemini with response_schema for structured JSON output."""

    response_schema = {
        "type": "object",
        "properties": {
            "cards": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "front": {"type": "string"},
                        "back": {"type": "string"},
                        "keyword": {"type": "string"},
                        "grammar_note": {"type": "string"},
                        "context_note": {"type": "string"},
                        "colombian_note": {"type": "string"},
                        "timestamp_start": {"type": "number"},
                        "timestamp_end": {"type": "number"},
                        "card_type": {
                            "type": "string",
                            "enum": ["vocabulary", "phrase", "idiom", "grammar_pattern"],
                        },
                    },
                    "required": [
                        "front", "back", "keyword", "grammar_note",
                        "context_note", "colombian_note",
                        "timestamp_start", "timestamp_end", "card_type",
                    ],
                },
            }
        },
        "required": ["cards"],
    }

    model = genai.GenerativeModel(
        model_name=model_name,
        system_instruction=system_prompt,
        generation_config=genai.GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_output_tokens,
            response_mime_type="application/json",
            response_schema=response_schema,
        ),
    )

    # Run sync Gemini call in thread pool to keep FastAPI async
    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(
        None, lambda: model.generate_content(user_prompt)
    )

    data = json.loads(response.text)
    return data.get("cards", [])


async def _call_claude(
    system_prompt: str,
    user_prompt: str,
    temperature: float,
    max_tokens: int,
) -> list[dict]:
    """Call Claude with tool_use + tool_choice forced for structured output."""

    tools = [
        {
            "name": "generate_flashcards",
            "description": "Generate Anki flashcards from a YouTube transcript",
            "input_schema": {
                "type": "object",
                "properties": {
                    "cards": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "front": {"type": "string"},
                                "back": {"type": "string"},
                                "keyword": {"type": "string"},
                                "grammar_note": {"type": "string"},
                                "context_note": {"type": "string"},
                                "colombian_note": {"type": "string"},
                                "timestamp_start": {"type": "number"},
                                "timestamp_end": {"type": "number"},
                                "card_type": {
                                    "type": "string",
                                    "enum": ["vocabulary", "phrase", "idiom", "grammar_pattern"],
                                },
                            },
                            "required": [
                                "front", "back", "keyword", "grammar_note",
                                "context_note", "colombian_note",
                                "timestamp_start", "timestamp_end", "card_type",
                            ],
                        },
                    }
                },
                "required": ["cards"],
            },
        }
    ]

    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(
        None,
        lambda: anthropic_client.messages.create(
            model=settings.llm_model_nativo,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_prompt,
            tools=tools,
            tool_choice={"type": "tool", "name": "generate_flashcards"},
            messages=[{"role": "user", "content": user_prompt}],
        ),
    )

    # Extract tool_use block
    for block in response.content:
        if block.type == "tool_use" and block.name == "generate_flashcards":
            return block.input.get("cards", [])

    raise ValueError("Claude did not return a tool_use block")

def _get_mock_cards() -> list[Card]:
    """Mock cards for development — replace with real AI when credits available."""
    return [
        Card(
            front="I've been swamped lately",
            back="He estado muy ocupado últimamente",
            keyword="swamped",
            grammar_note="Present perfect continuo — acción que empezó antes y sigue ahora",
            context_note="Úsalo cuando estás muy ocupado con trabajo o responsabilidades",
            colombian_note="Es como decir 'estoy hasta el cuello' o 'no doy abasto' — parce, llevo una semana encartado",
            timestamp_start=17.5,
            timestamp_end=21.5,
            card_type="phrase",
        ),
        Card(
            front="Let's touch base tomorrow",
            back="Hablemos mañana / Nos coordinamos mañana",
            keyword="touch base",
            grammar_note="Imperativo con 'let's' — propuesta informal para hacer algo juntos",
            context_note="Muy común en ambientes de trabajo para coordinar sin entrar en detalles",
            colombian_note="Como decir 'cuadramos mañana' o 'nos pegamos mañana' — típico en reuniones de trabajo",
            timestamp_start=44.2,
            timestamp_end=48.0,
            card_type="idiom",
        ),
        Card(
            front="Can you bring me up to speed?",
            back="¿Me puedes poner al día / actualizar?",
            keyword="bring up to speed",
            grammar_note="Modales con 'can' — petición educada. 'Up to speed' = al nivel actual",
            context_note="Cuando llegas tarde a un proyecto o reunión y necesitas que te expliquen qué pasó",
            colombian_note="Como decir '¿me cuentas qué ha pasado?' o '¿me pones en contexto?' — muy útil en call centers",
            timestamp_start=51.5,
            timestamp_end=55.2,
            card_type="phrase",
        ),
        Card(
            front="I've got it covered",
            back="Yo me encargo / Lo tengo bajo control",
            keyword="got it covered",
            grammar_note="Present perfect informal — 'got' reemplaza 'have' en inglés coloquial",
            context_note="Para decir que ya te responsabilizaste de algo sin que nadie más tenga que preocuparse",
            colombian_note="Como decir 'yo me encargo de eso' o 'tranquilo que yo lo manejo' — muy usado en trabajo",
            timestamp_start=62.5,
            timestamp_end=65.8,
            card_type="phrase",
        ),
        Card(
            front="My bad",
            back="Fue mi culpa / Me equivoqué",
            keyword="my bad",
            grammar_note="Expresión coloquial — equivalente informal de 'I'm sorry, it was my fault'",
            context_note="Para disculparse de forma casual por un error pequeño entre conocidos o compañeros",
            colombian_note="Como decir 'uy, fue mi culpa' o 'perdon, la embarré' — muy natural entre parceros",
            timestamp_start=65.8,
            timestamp_end=69.5,
            card_type="vocabulary",
        ),
    ]

async def generate_cards(
    transcript_text: str,
    level: str,
    context: str,
    user_role: str,
    max_cards: Optional[int] = None,
) -> tuple[list[Card], str]:
    """
    Main entry point for card generation.

    Args:
        transcript_text: Full transcript as plain text
        level: CEFR level (A1-C2)
        context: Learning context (general, bpo, etc.)
        user_role: User's role to determine model tier
        max_cards: Override max cards (used for freemium limit)

    Returns:
        (list[Card], model_used_name)
    """
    # Determine card limits
    min_cards = 5
    if max_cards is None:
        max_cards = settings.free_max_cards if user_role == "user" else 25

    system_prompt, user_prompt = build_prompt(
        transcript_text=transcript_text,
        level=level,
        context=context,
        min_cards=min_cards,
        max_cards=max_cards,
    )

    # Determine provider order based on user tier + circuit breaker
    # DEVELOPMENT MODE — remove when AI credits are available
    if settings.use_mock_ai:
        logger.info("Using mock AI cards (development mode)")
        return _get_mock_cards(), "mock-development"        
    primary_provider = TIER_TO_PROVIDER.get(user_role, "flash")
    fallback_order = _get_fallback_order(primary_provider)

    last_error: Optional[Exception] = None

    for provider in fallback_order:
        if _is_circuit_open(provider):
            logger.info(f"Skipping {provider} — circuit breaker open")
            continue

        try:
            logger.info(f"Calling provider: {provider} (model: {PROVIDER_TO_MODEL[provider]})")

            if provider in ("flash", "pro"):
                temperature = settings.temp_flash if provider == "flash" else settings.temp_pro
                max_tokens = 2000 if provider == "flash" else 3000
                raw_cards = await _call_gemini(
                    model_name=PROVIDER_TO_MODEL[provider],
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    temperature=temperature,
                    max_output_tokens=max_tokens,
                )
            else:  # claude
                raw_cards = await _call_claude(
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    temperature=settings.temp_claude,
                    max_tokens=4000,
                )

            valid_cards = _validate_cards(raw_cards)

            if not valid_cards:
                raise ValueError("All generated cards failed validation (missing colombian_note)")

            _record_success(provider)
            logger.info(f"Success — {provider} returned {len(valid_cards)} valid cards")
            return valid_cards, PROVIDER_TO_MODEL[provider]

        except Exception as e:
            logger.error(f"Provider {provider} failed: {e}")
            _record_failure(provider)
            last_error = e
            continue

    raise RuntimeError(
        f"All AI providers failed. Last error: {last_error}"
    )


def _get_fallback_order(primary: str) -> list[str]:
    """Build fallback chain starting from primary provider."""
    all_providers = ["flash", "pro", "claude"]
    try:
        idx = all_providers.index(primary)
        return all_providers[idx:] + all_providers[:idx]
    except ValueError:
        logger.warning(f"Unknown provider '{primary}', using default fallback order")
        return all_providers