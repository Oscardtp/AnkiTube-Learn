"""
End-to-end test for YouTube → transcript → AI Router → cards flow.
Tests the complete pipeline from a real YouTube video to generated flashcards.
"""

import asyncio
import json
import logging
import sys
import os
from typing import Optional

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from services.youtube_real import get_transcript, transcript_to_text
from services.ai_router import generate_cards, _validate_cards
from models.deck import Card

# Configure verbose logging
logging.basicConfig(
    level=logging.DEBUG,
    format='[%(levelname)s] %(name)s: %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Test configuration
# ─────────────────────────────────────────────────────────────────────────────

# Simple, short public video with captions (TED-Ed or similar educational content)
TEST_YOUTUBE_URL = "https://www.youtube.com/watch?v=O5b4PGzxPfM"  # Short animated explainer

# Fallback: any of these should work if the above fails
FALLBACK_URLS = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",  # Rick Astley — always has captions
    "https://youtu.be/jNQXAC9IVRw",                # "Me at the zoo" — first YouTube video
]

TEST_LEVEL = "B1"
TEST_CONTEXT = "general"
TEST_USER_ROLE = "user"  # Uses free tier (OpenRouter)


# ─────────────────────────────────────────────────────────────────────────────
# Test steps
# ─────────────────────────────────────────────────────────────────────────────

async def test_transcript_fetch():
    """Step 1: Fetch real transcript from YouTube."""
    print("\n" + "="*70)
    print("STEP 1: Fetch YouTube transcript")
    print("="*70)
    
    result = None
    for url in [TEST_YOUTUBE_URL] + FALLBACK_URLS:
        try:
            print(f"Attempting URL: {url}")
            result = get_transcript(url, context="general")
            print(f"[OK] Success! Video ID: {result['video_id']}")
            print(f"   Title: {result['title']}")
            print(f"   Thumbnail: {result['thumbnail']}")
            print(f"   Transcript entries: {len(result['transcript'])}")
            return result
        except Exception as e:
            print(f"[FAIL] Failed: {e}")
            continue
    
    raise RuntimeError("All YouTube URLs failed — check network and transcript availability")


def test_transcript_to_text(transcript_data: dict):
    """Step 2: Convert transcript list to plain text."""
    print("\n" + "="*70)
    print("STEP 2: Convert transcript to text")
    print("="*70)
    
    transcript_list = transcript_data['transcript']
    print(f"Input: {len(transcript_list)} transcript entries")
    
    # Show first 3 entries for verification
    print("First 3 transcript entries:")
    for i, entry in enumerate(transcript_list[:3]):
        text_raw = entry['text']
        text_display = text_raw.encode('ascii', 'replace').decode('ascii')
        print(f"  [{i}] start={entry['start']:.1f}s dur={entry['duration']:.1f}s text={text_display!r}")
    
    text = transcript_to_text(transcript_list)
    print(f"\n[OK] Converted text length: {len(text)} chars")
    print(f"Text preview (first 300 chars):")
    text_display = text[:300].encode('ascii', 'replace').decode('ascii')
    print(f"  {text_display!r}...")
    
    return text


async def test_generate_cards(transcript_text: str):
    """Step 3: Generate cards via AI router."""
    print("\n" + "="*70)
    print("STEP 3: Generate cards via AI router")
    print("="*70)
    
    print(f"Transcript text length: {len(transcript_text)} chars")
    print(f"Level: {TEST_LEVEL}")
    print(f"Context: {TEST_CONTEXT}")
    print(f"User role: {TEST_USER_ROLE}")
    print()
    
    try:
        cards, model_used = await generate_cards(
            transcript_text=transcript_text,
            level=TEST_LEVEL,
            context=TEST_CONTEXT,
            user_role=TEST_USER_ROLE,
            max_cards=5  # Limit for faster testing
        )
        
        print(f"[OK] Success! Model used: {model_used}")
        print(f"   Cards generated: {len(cards)}")
        
        if cards:
            print("\nCard details:")
            for i, card in enumerate(cards, 1):
                print(f"\n  Card {i}:")
                print(f"    Type: {card.card_type}")
                front_display = card.front.encode('ascii', 'replace').decode('ascii')
                back_display = card.back.encode('ascii', 'replace').decode('ascii')
                keyword_display = card.keyword.encode('ascii', 'replace').decode('ascii')
                grammar_display = card.grammar_note.encode('ascii', 'replace').decode('ascii')
                colombian_display = card.colombian_note.encode('ascii', 'replace').decode('ascii')
                print(f"    Front: {front_display!r}")
                print(f"    Back: {back_display!r}")
                print(f"    Keyword: {keyword_display!r}")
                print(f"    Grammar: {grammar_display!r}")
                print(f"    Colombian: {colombian_display!r}")
                print(f"    Timestamps: {card.timestamp_start:.1f}s -> {card.timestamp_end:.1f}s")
        
        return cards
        
    except Exception as e:
        print(f"[FAIL] Card generation failed: {e}")
        print(f"   Type: {type(e).__name__}")
        raise


def test_validation():
    """Step 4: Test card validation directly."""
    print("\n" + "="*70)
    print("STEP 4: Test card validation")
    print("="*70)
    
    # Create some test cards (valid and invalid)
    test_cards = [
        {
            "front": "It's on me",
            "back": "Yo invito",
            "keyword": "on me",
            "grammar_note": "Expresión idiomática",
            "context_note": "Para invitar a pagar",
            "colombian_note": "Como decir 'yo pago' — cuando invitas a alguien",
            "timestamp_start": 10.0,
            "timestamp_end": 12.0,
            "card_type": "phrase"
        },
        {
            "front": "Generic greeting",
            "back": "Saludo genérico",
            "keyword": "greeting",
            "grammar_note": "N/A",
            "context_note": "N/A",
            "colombian_note": "",  # INVALID — empty
            "timestamp_start": 5.0,
            "timestamp_end": 7.0,
            "card_type": "phrase"
        }
    ]
    
    print(f"Input: {len(test_cards)} raw cards (1 valid, 1 invalid)")
    valid_cards = _validate_cards(test_cards)
    print(f"[OK] Valid cards after validation: {len(valid_cards)}")
    
    for i, card in enumerate(valid_cards, 1):
        print(f"  [{i}] {card.front} -> {card.back}")
    
    return valid_cards


# ─────────────────────────────────────────────────────────────────────────────
# Main test runner
# ─────────────────────────────────────────────────────────────────────────────

async def main():
    print("\n" + "="*70)
    print("ANKITUBE LEARN — TRANSCRIPT FLOW TEST")
    print("="*70)
    
    try:
        # Step 1: Fetch transcript
        transcript_data = await test_transcript_fetch()
        
        # Step 2: Convert to text
        transcript_text = test_transcript_to_text(transcript_data)
        
        # Step 3: Generate cards
        cards = await test_generate_cards(transcript_text)
        
        # Step 4: Validation unit test
        test_validation()
        
        print("\n" + "="*70)
        print("SUMMARY")
        print("="*70)
        print(f"[OK] Transcript fetched: {len(transcript_data['transcript'])} entries")
        print(f"[OK] Text conversion: {len(transcript_text)} chars")
        print(f"[OK] Cards generated: {len(cards) if cards else 0}")
        if cards:
            card_types = {c.card_type for c in cards}
            print(f"   Card types: {card_types}")
        print("\n[OK] All tests passed!")
        
    except Exception as e:
        print(f"\n[FAIL] Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
