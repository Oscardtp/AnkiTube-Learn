import asyncio
from unittest.mock import AsyncMock, patch

import pytest

from services.audio_service import get_audio_clip
from services.card_pipeline import CardPipeline


def test_pipeline_passthrough_when_filtered_pool_is_below_minimum():
    async def _run():
        pipeline = CardPipeline()
        raw_candidates = [{
            "front": "I am learning English",
            "back": "Estoy aprendiendo inglés",
            "keyword": "learning",
            "grammar_note": "Present continuous",
            "context_note": "Daily routine",
            "colombian_note": "Aprendiendo inglés",
            "card_type": "phrase",
        }]

        with patch("services.card_pipeline.extract_candidates", new=AsyncMock(return_value=(raw_candidates, "test-model"))), \
             patch("services.card_pipeline.filter_candidates", return_value=raw_candidates[:1]), \
             patch("services.card_pipeline.select_best_cards", new=AsyncMock(side_effect=AssertionError("selection should not be called"))):
            cards, model_used = await pipeline.run(
                transcript=[{"text": "I am learning English", "start": 10.0, "duration": 2.0}],
                transcript_text="Learning English every day helps me speak with confidence in work meetings school projects travel situations and daily conversations with friends and family members who want to practice real phrases and practical vocabulary for life business study and travel because repetition improves fluency and confidence for long term progress and better communication in many contexts.",
                level="A2",
                context="general",
                user_role="user",
                max_cards=16,
            )

        assert model_used == "test-model"
        assert len(cards) == 1
        assert cards[0].front == raw_candidates[0]["front"]

    asyncio.run(_run())


def test_get_audio_clip_rejects_invalid_ranges_before_downloading():
    async def _run():
        with patch("services.audio_service.download_audio", new=AsyncMock(side_effect=AssertionError("download should not run"))) as download_mock:
            with pytest.raises(ValueError, match="start.*end"):
                await get_audio_clip("abc123", 20.0, 10.0, "clip.mp3")

        download_mock.assert_not_called()

    asyncio.run(_run())
