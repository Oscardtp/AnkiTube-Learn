"""
3-step card generation pipeline for AnkiTube Learn.
Step 1: LLM extracts candidate phrases
Step 2: Backend filters deterministically
Step 3: LLM selects the best cards
"""

import logging
from typing import Optional

from models.deck import Card
from services.ai_router import extract_candidates, select_best_cards
from services.filter_rules import filter_candidates

logger = logging.getLogger(__name__)

MIN_TRANSCRIPT_WORDS = 50


class CardPipeline:
    """Orchestrates the 3-step card generation pipeline."""

    async def run(
        self,
        transcript: list[dict],
        transcript_text: str,
        level: str,
        context: str,
        user_role: str,
        max_cards: int,
        on_event=None,
    ) -> tuple[list[Card], str]:
        """
        Execute the full 3-step pipeline.

        Args:
            transcript: Raw transcript entries with text, start, duration
            transcript_text: Full transcript as plain text
            level: CEFR level (A1-C2)
            context: Learning context (general, bpo, etc.)
            user_role: User role for model tier
            max_cards: Maximum cards to generate
            on_event: Optional async callback for SSE events

        Returns:
            (list of Card objects, model_used_name)
        """
        # Validate transcript quality
        word_count = len(transcript_text.split())
        if word_count < MIN_TRANSCRIPT_WORDS:
            raise ValueError(
                f"El video es demasiado corto para generar tarjetas. "
                f"Se necesitan al menos {MIN_TRANSCRIPT_WORDS} palabras."
            )

        # Step 1: LLM extracts candidates
        # Dynamic multiplier: short transcripts → fewer candidates requested
        if word_count < 1000:
            multiplier = 2  # ~20 candidates for 10 cards
        elif word_count < 3000:
            multiplier = 2  # ~30 candidates
        else:
            multiplier = 2  # ~30 candidates (longer transcripts = more useful phrases)
        
        requested_cards = int(max_cards * multiplier)
        logger.info(f"[PIPELINE] Step 1: Extracting candidates from {word_count} words (requesting {requested_cards} cards)")
        raw_candidates, model_used = await extract_candidates(
            transcript_text=transcript_text,
            level=level,
            max_cards=requested_cards,
            user_role=user_role,
            on_event=on_event,
        )
        logger.info(f"[PIPELINE] Step 1 complete: {len(raw_candidates)} candidates extracted")

        # Validate Step 1 output
        if not raw_candidates:
            raise ValueError(
                "La IA no pudo extraer frases del video. "
                "Intenta con otro video o nivel."
            )

        # Step 2: Backend filters deterministically
        if on_event:
            await on_event("pipeline_step2_started", {"phase": "pipeline_step2", "status": "started"})

        logger.info(f"[PIPELINE] Step 2: Filtering {len(raw_candidates)} candidates")
        filtered = filter_candidates(raw_candidates, transcript)
        logger.info(f"[PIPELINE] Step 2 complete: {len(filtered)} candidates after filtering")

        if on_event:
            await on_event("pipeline_step2_complete", {
                "phase": "pipeline_step2",
                "status": "complete",
                "candidates_before": len(raw_candidates),
                "candidates_after": len(filtered),
            })

        # If not enough candidates after filtering, use what we have
        if not filtered:
            raise ValueError(
                "No se encontraron frases válidas en el video. "
                "Intenta con otro video o nivel."
            )

        # Step 3: LLM selects the best cards
        logger.info(f"[PIPELINE] Step 3: Selecting best {max_cards} from {len(filtered)} candidates")
        cards, _ = await select_best_cards(
            filtered_cards=filtered,
            level=level,
            context=context,
            max_cards=min(max_cards, len(filtered)),
            user_role=user_role,
            on_event=on_event,
        )
        logger.info(f"[PIPELINE] Step 3 complete: {len(cards)} cards selected")

        return cards, model_used
