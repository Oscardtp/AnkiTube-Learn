"""
Central AI Router — the brain of AnkiTube Learn.
All AI calls go through here. Never call Gemini, Anthropic, or Nvidia directly from routes.

Dual-role routing:
- CURATOR (Step 1 - extraction): Nvidia Llama 3.3/3.1 → OpenRouter → Gemini Flash
- DESIGNER (Step 3 - selection): Nvidia Llama 3.3 → Nemotron → Qwen3 → OpenRouter → Gemini Flash
Circuit breaker: skip provider for 5 min after 3 consecutive failures.
"""

import json
import asyncio
import logging
import re
from datetime import datetime, timedelta
from typing import Optional

import google.generativeai as genai
import anthropic
import httpx

from config import get_settings
from models.deck import Card
from utils.prompts import build_prompt

logger = logging.getLogger(__name__)
settings = get_settings()

# Configure clients
genai.configure(api_key=settings.google_api_key)
anthropic_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

FREE_OPENROUTER_MODEL = settings.openrouter_free_model
FREE_OPENROUTER_SECONDARY_MODEL = settings.openrouter_free_secondary_model
FREE_OPENROUTER_TERTIARY_MODEL = settings.openrouter_free_tertiary_model

# Circuit breaker state — in-memory for MVP (Redis in Phase 2)
_circuit_breaker: dict[str, dict] = {
    "openrouter": {"failures": 0, "open_until": None},
    "openrouter_secondary": {"failures": 0, "open_until": None},
    "openrouter_tertiary": {"failures": 0, "open_until": None},
    "flash": {"failures": 0, "open_until": None},
    "pro": {"failures": 0, "open_until": None},
    "claude": {"failures": 0, "open_until": None},
    "nvidia_curator_primary": {"failures": 0, "open_until": None},
    "nvidia_curator_secondary": {"failures": 0, "open_until": None},
    "nvidia_designer_primary": {"failures": 0, "open_until": None},
    "nvidia_designer_secondary": {"failures": 0, "open_until": None},
    "nvidia_designer_tertiary": {"failures": 0, "open_until": None},
}

# Map user tier to provider key
# MVP: OpenRouter free → OpenRouter Secondary → OpenRouter Tertiary fallback chain
# Premium/Nativo: código listo, activar cuando haya pagos (Stripe)
TIER_TO_PROVIDER = {
    "user": "openrouter",       # Explorador → OpenRouter free
    "tester": "openrouter",    # Tester → OpenRouter free
    "premium": "openrouter",   # Temporal hasta Stripe (futuro: "pro")
    "superadmin": "claude",     # Keep para debugging
    "nativo": "openrouter",     # Temporal hasta Stripe (futuro: "claude")
}

PROVIDER_TO_MODEL = {
    "openrouter": FREE_OPENROUTER_MODEL,
    "openrouter_secondary": FREE_OPENROUTER_SECONDARY_MODEL,
    "openrouter_tertiary": FREE_OPENROUTER_TERTIARY_MODEL,
    "flash": settings.llm_model_free,
    "pro": settings.llm_model_fluente,
    "claude": settings.llm_model_nativo,
    "nvidia_curator_primary": settings.nvidia_model_curator_primary,
    "nvidia_curator_secondary": settings.nvidia_model_curator_secondary,
    "nvidia_designer_primary": settings.nvidia_model_designer_primary,
    "nvidia_designer_secondary": settings.nvidia_model_designer_secondary,
    "nvidia_designer_tertiary": settings.nvidia_model_designer_tertiary,
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


def _is_openrouter_free_mode(user_role: str) -> bool:
    return user_role in {"user", "tester", "premium", "nativo"}


def _get_safe_openrouter_request_settings(
    max_tokens: int,
    max_cards: int,
    user_role: str,
    provider: str,
) -> tuple[int, int]:
    if _is_openrouter_free_mode(user_role) and provider in {
        "openrouter",
        "openrouter_secondary",
        "openrouter_tertiary",
    }:
        capped_tokens = min(max_tokens, settings.openrouter_free_max_tokens)
        capped_cards = min(max_cards, settings.openrouter_free_max_cards)
        return capped_tokens, capped_cards
    return max_tokens, max_cards


def _validate_cards(raw_cards: list[dict]) -> list[Card]:
    """
    Validate and filter AI output. Cards without colombian_note are discarded.
    Ensures each card has a keyword for fill-in-the-blank exercises.
    Returns list of valid Card objects.
    """
    valid_cards = []
    for raw in raw_cards:
        # colombian_note is mandatory — discard card if missing or empty
        if not raw.get("colombian_note", "").strip():
            logger.warning(f"Card discarded — missing colombian_note: {raw.get('front', 'unknown')}")
            continue

        # Ensure keyword exists — fallback to first significant word
        keyword = raw.get("keyword", "").strip()
        front = raw.get("front", "")
        if not keyword or keyword.lower() == front.lower():
            # Use first word that's not a common article/preposition
            stopwords = {"the", "a", "an", "i", "you", "he", "she", "it", "we", "they", "my", "your", "his", "her", "its", "our", "their"}
            words = front.split()
            for word in words:
                clean = word.lower().strip(".,!?;:")
                if clean and clean not in stopwords:
                    keyword = word.strip(".,!?;:")
                    break
            if not keyword and words:
                keyword = words[0].strip(".,!?;:")
            raw["keyword"] = keyword
            logger.info(f"Card keyword auto-assigned: '{keyword}' for '{front[:50]}...'")

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

    max_output_tokens = min(max_output_tokens, 3000)

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
                        "card_type": {
                            "type": "string",
                            "enum": ["vocabulary", "phrase", "idiom", "grammar_pattern"],
                        },
                    },
                    "required": [
                        "front", "back", "keyword", "grammar_note",
                        "context_note", "colombian_note", "card_type",
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

    max_tokens = min(max_tokens, 3000)

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
                                "card_type": {
                                    "type": "string",
                                    "enum": ["vocabulary", "phrase", "idiom", "grammar_pattern"],
                                },
                            },
                            "required": [
                                "front", "back", "keyword", "grammar_note",
                                "context_note", "colombian_note", "card_type",
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


async def _call_openrouter(
    model_name: str,
    system_prompt: str,
    user_prompt: str,
    temperature: float,
    max_tokens: int,
) -> list[dict]:
    """Call OpenRouter with specified model for structured JSON output."""
    max_tokens = min(max_tokens, 3000)
    url = f"{settings.openrouter_base_url}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ankitubelearn.com",
        "X-Title": "AnkiTube Learn",
    }
    payload = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
        "response_format": {"type": "json_object"},
    }

    logger.info(f"[OPENROUTER] Request: model={model_name}, temp={temperature}, max_tokens={max_tokens}")
    logger.info(f"[OPENROUTER] System prompt length: {len(system_prompt)} chars")
    logger.info(f"[OPENROUTER] User prompt length: {len(user_prompt)} chars")
    logger.debug(f"[OPENROUTER] User prompt preview: {user_prompt[:500]}...")

    # Retry up to 3 times for rate limiting / credit limits with smaller payloads
    last_error: Optional[str] = None
    for attempt in range(3):
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload, headers=headers)

        if response.status_code == 200:
            break
        elif response.status_code == 429:
            last_error = "rate-limited"
            wait_time = 2 ** attempt * 2  # 2s, 4s, 8s
            logger.info(f"OpenRouter rate-limited, retrying in {wait_time}s (attempt {attempt + 1}/3)")
            await asyncio.sleep(wait_time)
            continue
        elif response.status_code == 402 and payload.get("max_tokens", 0) > 800:
            last_error = "credit-limit"
            payload["max_tokens"] = max(800, int(payload["max_tokens"] * 0.7))
            logger.warning(
                f"OpenRouter credits exhausted, retrying with smaller budget: {payload['max_tokens']} tokens"
            )
            await asyncio.sleep(2)
            continue
        else:
            raise ValueError(f"OpenRouter error {response.status_code}: {response.text}")

    if response.status_code != 200:
        raise ValueError(f"OpenRouter error after retries: {last_error}")

    data = response.json()
    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
    
    logger.info(f"[OPENROUTER] Response status: {response.status_code}")
    logger.info(f"[OPENROUTER] Response content length: {len(content)} chars")
    logger.info(f"[OPENROUTER] Response content preview: {content[:800]}...")

    # Parse JSON from response (model returns raw text, not wrapped in JSON)
    try:
        parsed = json.loads(content)
        logger.info(f"[OPENROUTER] JSON parsed OK — keys: {list(parsed.keys())}, cards count: {len(parsed.get('cards', []))}")
    except json.JSONDecodeError as e:
        logger.warning(f"[OPENROUTER] JSON decode failed: {e}")
        
        # Detect truncation: response cut off mid-JSON
        content_stripped = content.rstrip()
        last_char = content_stripped[-1] if content_stripped else ""
        is_truncated = (
            "Unterminated string" in str(e) or
            ("Expecting" in str(e) and last_char not in ('}', ']', '"')) or
            (len(content) > 100 and last_char not in ('}', ']', '"', ',', ':'))
        )
        
        if is_truncated:
            logger.error(f"[OPENROUTER] JSON TRUNCATED — max_tokens={max_tokens} too low for {len(content)} chars. "
                        f"Increase max_tokens or reduce max_cards in prompt.")
            raise ValueError(
                f"Response truncated at {len(content)} chars (max_tokens={max_tokens} too low). "
                f"Increase max_tokens or reduce cards requested."
            )
        
        # Try to extract JSON from markdown code block
        match = re.search(r"```json\s*(.*?)\s*```", content, re.DOTALL)
        if match:
            logger.info("[OPENROUTER] Found JSON in markdown code block, extracting...")
            parsed = json.loads(match.group(1))
            logger.info(f"[OPENROUTER] Extracted from code block — cards count: {len(parsed.get('cards', []))}")
        else:
            logger.error(f"[OPENROUTER] No JSON found in response. Full content:\n{content[:2000]}")
            raise ValueError(f"OpenRouter returned invalid JSON: {content[:200]}")

    cards = parsed.get("cards", [])
    if not cards:
        logger.warning(f"[OPENROUTER] Response parsed but 'cards' array is empty! Full parsed: {str(parsed)[:500]}")
    else:
        logger.info(f"[OPENROUTER] First card keys: {list(cards[0].keys()) if cards else 'N/A'}")
        logger.info(f"[OPENROUTER] First card preview: {str(cards[0])[:300]}")

    return cards


async def _call_nvidia(
    model_name: str,
    system_prompt: str,
    user_prompt: str,
    temperature: float,
    max_tokens: int,
) -> list[dict]:
    """Call Nvidia NIM API with specified model for structured JSON output."""
    from openai import OpenAI

    max_tokens = min(max_tokens, 3000)

    client = OpenAI(
        base_url=settings.nvidia_base_url,
        api_key=settings.nvidia_api_key,
    )

    logger.info(f"[NVIDIA] Request: model={model_name}, temp={temperature}, max_tokens={max_tokens}")
    logger.info(f"[NVIDIA] System prompt length: {len(system_prompt)} chars")
    logger.info(f"[NVIDIA] User prompt length: {len(user_prompt)} chars")
    logger.debug(f"[NVIDIA] User prompt preview: {user_prompt[:500]}...")

    last_error: Optional[str] = None
    for attempt in range(3):
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=temperature,
                max_tokens=max_tokens,
                response_format={"type": "json_object"},
            ),
        )

        content = response.choices[0].message.content or ""

        if response.choices[0].finish_reason == "stop":
            break
        elif response.choices[0].finish_reason == "length":
            last_error = "truncated"
            logger.warning(f"[NVIDIA] Response truncated (finish_reason=length), retrying...")
            await asyncio.sleep(1)
            continue
        else:
            last_error = f"finish_reason={response.choices[0].finish_reason}"
            logger.warning(f"[NVIDIA] Unexpected finish_reason: {last_error}")
            await asyncio.sleep(1)
            continue

    logger.info(f"[NVIDIA] Response content length: {len(content)} chars")
    logger.info(f"[NVIDIA] Response content preview: {content[:800]}...")

    try:
        parsed = json.loads(content)
        logger.info(f"[NVIDIA] JSON parsed OK — keys: {list(parsed.keys())}, cards count: {len(parsed.get('cards', []))}")
    except json.JSONDecodeError as e:
        logger.warning(f"[NVIDIA] JSON decode failed: {e}")

        content_stripped = content.rstrip()
        last_char = content_stripped[-1] if content_stripped else ""
        is_truncated = (
            "Unterminated string" in str(e) or
            ("Expecting" in str(e) and last_char not in ('}', ']', '"')) or
            (len(content) > 100 and last_char not in ('}', ']', '"', ',', ':'))
        )

        if is_truncated:
            logger.error(f"[NVIDIA] JSON TRUNCATED — max_tokens={max_tokens} too low for {len(content)} chars.")
            raise ValueError(
                f"Response truncated at {len(content)} chars (max_tokens={max_tokens} too low). "
                f"Increase max_tokens or reduce cards requested."
            )

        match = re.search(r"```json\s*(.*?)\s*```", content, re.DOTALL)
        if match:
            logger.info("[NVIDIA] Found JSON in markdown code block, extracting...")
            parsed = json.loads(match.group(1))
            logger.info(f"[NVIDIA] Extracted from code block — cards count: {len(parsed.get('cards', []))}")
        else:
            logger.error(f"[NVIDIA] No JSON found in response. Full content:\n{content[:2000]}")
            raise ValueError(f"Nvidia returned invalid JSON: {content[:200]}")

    cards = parsed.get("cards", [])
    if not cards:
        logger.warning(f"[NVIDIA] Response parsed but 'cards' array is empty! Full parsed: {str(parsed)[:500]}")
    else:
        logger.info(f"[NVIDIA] First card keys: {list(cards[0].keys()) if cards else 'N/A'}")
        logger.info(f"[NVIDIA] First card preview: {str(cards[0])[:300]}")

    return cards


async def generate_cards(
    transcript_text: str,
    level: str,
    context: str,
    user_role: str,
    max_cards: Optional[int] = None,
    on_event=None,
) -> tuple[list[Card], str]:
    """
    Main entry point for card generation.

    Args:
        transcript_text: Full transcript as plain text
        level: CEFR level (A1-C2)
        context: Learning context (general, bpo, etc.)
        user_role: User's role to determine model tier
        max_cards: Override max cards (used for freemium limit)
        on_event: Optional async callback for SSE events: async def on_event(event_name, data)

    Returns:
        (list[Card], model_used_name)
    """
    # Determine card limits
    min_cards = 5
    if max_cards is None:
        max_cards = settings.free_max_cards if user_role == "user" else 25

    if _is_openrouter_free_mode(user_role):
        max_cards = min(max_cards, settings.openrouter_free_max_cards)

    system_prompt, user_prompt = build_prompt(
        transcript_text=transcript_text,
        level=level,
        context=context,
        min_cards=min_cards,
        max_cards=max_cards,
    )

    # Log transcript para debugging (primeros 200 chars)
    logger.info(f"[OPENROUTER] Transcript length: {len(transcript_text)} chars")
    logger.debug(f"[OPENROUTER] Transcript preview: {transcript_text[:200]}...")

    if on_event:
        await on_event("ai_started", {"phase": "ai", "status": "started"})

    # Determine provider order based on role-based fallback chain
    fallback_order = _get_role_fallback("curator")

    last_error: Optional[Exception] = None
    attempt_number = 0

    for provider in fallback_order:
        if _is_circuit_open(provider):
            logger.info(f"Skipping {provider} — circuit breaker open")
            continue

        attempt_number += 1

        if on_event:
            await on_event("ai_provider_attempt", {
                "phase": "ai",
                "status": "attempting",
                "provider": provider,
                "attempt": attempt_number,
            })

        try:
            logger.info(f"Calling provider: {provider} (model: {PROVIDER_TO_MODEL[provider]})")

            if provider in ("openrouter", "openrouter_secondary", "openrouter_tertiary"):
                safe_max_tokens, safe_max_cards = _get_safe_openrouter_request_settings(
                    max_tokens=3000,
                    max_cards=max_cards,
                    user_role=user_role,
                    provider=provider,
                )
                logger.info(
                    f"[AI-ROUTER] Using provider={provider} model={PROVIDER_TO_MODEL[provider]} "
                    f"max_tokens={safe_max_tokens} max_cards={safe_max_cards}"
                )
                raw_cards = await _call_openrouter(
                    model_name=PROVIDER_TO_MODEL[provider],
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    temperature=settings.temp_openrouter,
                    max_tokens=safe_max_tokens,
                )
            elif provider.startswith("nvidia_"):
                raw_cards = await _call_nvidia(
                    model_name=PROVIDER_TO_MODEL[provider],
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    temperature=0.3,
                    max_tokens=settings.nvidia_max_tokens,
                )
            elif provider in ("flash", "pro"):
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

            if on_event:
                await on_event("ai_provider_result", {
                    "phase": "ai",
                    "status": "success",
                    "provider": provider,
                    "cards_generated": len(valid_cards),
                })

            return valid_cards, PROVIDER_TO_MODEL[provider]

        except Exception as e:
            logger.error(f"Provider {provider} failed: {e}")
            _record_failure(provider)
            last_error = e

            if on_event:
                await on_event("ai_provider_result", {
                    "phase": "ai",
                    "status": "failed",
                    "provider": provider,
                    "error": str(e),
                    "attempt": attempt_number,
                })

            continue

    raise RuntimeError(
        f"All AI providers failed. Last error: {last_error}"
    )


def _get_role_fallback(role: str) -> list[str]:
    """
    Get the fallback chain for a specific role.
    role: "curator" (Step 1 - extraction) or "designer" (Step 3 - selection)
    """
    curator_chain = [p.strip() for p in settings.curator_fallback_chain.split(",")]
    designer_chain = [p.strip() for p in settings.designer_fallback_chain.split(",")]

    if role == "curator":
        return curator_chain
    elif role == "designer":
        return designer_chain
    else:
        logger.warning(f"Unknown role '{role}', using curator chain as fallback")
        return curator_chain


async def extract_candidates(
    transcript_text: str,
    level: str,
    max_cards: int,
    user_role: str = "user",
    on_event=None,
) -> tuple[list[dict], str]:
    """
    Step 1: Extract candidate phrases from transcript.
    Returns (list of raw card dicts, model_used_name).
    Phrases MUST exist in the transcript — no rewriting.
    """
    from utils.prompts import build_extraction_prompt

    if _is_openrouter_free_mode(user_role):
        max_cards = min(max_cards, settings.openrouter_free_max_cards)

    system_prompt, user_prompt = build_extraction_prompt(
        transcript_text=transcript_text,
        level=level,
        max_cards=max_cards,
    )

    if on_event:
        await on_event("pipeline_step1_started", {"phase": "pipeline_step1", "status": "started"})

    # Role-based fallback chain for Step 1 (Curator)
    fallback_order = _get_role_fallback("curator")

    last_error = None
    for provider in fallback_order:
        if _is_circuit_open(provider):
            logger.info(f"[PIPELINE-STEP1] Skipping {provider} — circuit breaker open")
            continue

        try:
            logger.info(f"[PIPELINE-STEP1] Trying provider: {provider} (model: {PROVIDER_TO_MODEL[provider]})")
            
            if provider in ("openrouter", "openrouter_secondary", "openrouter_tertiary"):
                safe_max_tokens, _ = _get_safe_openrouter_request_settings(
                    max_tokens=4000,
                    max_cards=max_cards,
                    user_role=user_role,
                    provider=provider,
                )
                raw_cards = await _call_openrouter(
                    model_name=PROVIDER_TO_MODEL[provider],
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    temperature=0.3,  # Low for consistency
                    max_tokens=safe_max_tokens,
                )
            elif provider.startswith("nvidia_"):
                raw_cards = await _call_nvidia(
                    model_name=PROVIDER_TO_MODEL[provider],
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    temperature=0.3,
                    max_tokens=settings.nvidia_max_tokens,
                )
            elif provider in ("flash", "pro"):
                raw_cards = await _call_gemini(
                    model_name=PROVIDER_TO_MODEL[provider],
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    temperature=0.3,
                    max_output_tokens=3000,
                )
            else:
                raw_cards = await _call_claude(
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    temperature=0.2,
                    max_tokens=4000,
                )

            logger.info(f"[PIPELINE-STEP1] Provider {provider} returned {len(raw_cards)} raw cards")
            
            _record_success(provider)
            
            if on_event:
                await on_event("pipeline_step1_complete", {
                    "phase": "pipeline_step1",
                    "status": "complete",
                    "candidates_found": len(raw_cards),
                    "provider": provider,
                })

            return raw_cards, PROVIDER_TO_MODEL[provider]

        except Exception as e:
            logger.error(f"[PIPELINE-STEP1] Provider {provider} FAILED: {type(e).__name__}: {e}")
            _record_failure(provider)
            last_error = e
            if on_event:
                await on_event("pipeline_step1_error", {
                    "phase": "pipeline_step1",
                    "status": "failed",
                    "provider": provider,
                    "error": str(e),
                })
            continue

    raise RuntimeError(f"All AI providers failed for Step 1. Last error: {last_error}")


async def select_best_cards(
    filtered_cards: list[dict],
    level: str,
    context: str,
    max_cards: int,
    user_role: str = "user",
    on_event=None,
) -> tuple[list[Card], str]:
    """
    Step 3: Select the best cards from filtered candidates.
    Uses the Senior English Learning Expert prompt.
    Returns (list of Card objects, model_used_name).
    """
    from utils.prompts import build_selection_prompt

    if _is_openrouter_free_mode(user_role):
        max_cards = min(max_cards, settings.openrouter_free_max_cards)

    system_prompt, user_prompt = build_selection_prompt(
        filtered_cards=filtered_cards,
        level=level,
        context=context,
        max_cards=max_cards,
    )

    if on_event:
        await on_event("pipeline_step3_started", {"phase": "pipeline_step3", "status": "started"})

    # Role-based fallback chain for Step 3 (Designer)
    fallback_order = _get_role_fallback("designer")

    last_error = None
    for provider in fallback_order:
        if _is_circuit_open(provider):
            continue

        try:
            if provider in ("openrouter", "openrouter_secondary", "openrouter_tertiary"):
                safe_max_tokens, _ = _get_safe_openrouter_request_settings(
                    max_tokens=4000,
                    max_cards=max_cards,
                    user_role=user_role,
                    provider=provider,
                )
                raw_cards = await _call_openrouter(
                    model_name=PROVIDER_TO_MODEL[provider],
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    temperature=0.2,  # Very low for pedagogical decisions
                    max_tokens=safe_max_tokens,
                )
            elif provider.startswith("nvidia_"):
                raw_cards = await _call_nvidia(
                    model_name=PROVIDER_TO_MODEL[provider],
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    temperature=0.2,  # Lower for pedagogical decisions
                    max_tokens=settings.nvidia_max_tokens,
                )
            elif provider in ("flash", "pro"):
                raw_cards = await _call_gemini(
                    model_name=PROVIDER_TO_MODEL[provider],
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    temperature=0.2,
                    max_output_tokens=3000,
                )
            else:
                raw_cards = await _call_claude(
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    temperature=0.2,
                    max_tokens=4000,
                )

            valid_cards = _validate_cards(raw_cards)

            if not valid_cards:
                raise ValueError("All selected cards failed validation")

            _record_success(provider)

            if on_event:
                await on_event("pipeline_step3_complete", {
                    "phase": "pipeline_step3",
                    "status": "complete",
                    "cards_selected": len(valid_cards),
                    "provider": provider,
                })

            return valid_cards, PROVIDER_TO_MODEL[provider]

        except Exception as e:
            _record_failure(provider)
            last_error = e
            if on_event:
                await on_event("pipeline_step3_error", {
                    "phase": "pipeline_step3",
                    "status": "failed",
                    "provider": provider,
                    "error": str(e),
                })
            continue

    raise RuntimeError(f"All AI providers failed for Step 3. Last error: {last_error}")