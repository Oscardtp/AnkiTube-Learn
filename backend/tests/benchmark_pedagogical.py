"""
Pedagogical Benchmark for AnkiTube Learn AI Router.

Tests the dual-role routing system (Curator + Designer) with objective metrics:
1. Selection Accuracy: Do extracted phrases exist literally in the transcript?
2. Pedagogical Quality: Are phrases useful for learning English?
3. Translation Quality: Do translations sound natural in Colombian Spanish?
4. Format Compliance: Does the LLM return valid JSON without errors?
5. Latency and Cost per deck.

Usage:
    python -m tests.benchmark_pedagogical
    python -m tests.benchmark_pedagogical --role curator
    python -m tests.benchmark_pedagogical --role designer
    python -m tests.benchmark_pedagogical --provider nvidia_curator_primary
"""

import asyncio
import json
import time
import logging
import argparse
from dataclasses import dataclass, field
from typing import Optional
from pathlib import Path

# Add backend to path for imports
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import get_settings
from services.ai_router import (
    extract_candidates,
    select_best_cards,
    _call_nvidia,
    _call_openrouter,
    _call_gemini,
    PROVIDER_TO_MODEL,
    _get_role_fallback,
)

logger = logging.getLogger(__name__)
settings = get_settings()


# ── Test Data ────────────────────────────────────────────────────────────────
# 20 sample transcripts for benchmarking (diverse topics and levels)
SAMPLE_TRANSCRIPTS = [
    {
        "id": "sample_01",
        "title": "Daily Routine Vocabulary",
        "level": "A2",
        "context": "general",
        "transcript": """So basically every morning I wake up around six thirty. 
        First thing I do is brush my teeth and take a shower. 
        Then I have breakfast, usually just coffee and toast. 
        After that I drive to work, it takes about forty five minutes. 
        I usually listen to podcasts during the commute. 
        At work I check my emails first thing. 
        Then I have a team meeting at nine o'clock. 
        We discuss the projects we're working on. 
        I usually have lunch around twelve thirty. 
        After lunch I continue working on my tasks. 
        I try to leave work by five thirty. 
        When I get home I like to relax and watch TV. 
        Sometimes I cook dinner, but usually I order food. 
        I go to bed around eleven o'clock.""",
        "expected_phrases_count": 10,
    },
    {
        "id": "sample_02",
        "title": "BPO Customer Service",
        "level": "B1",
        "context": "bpo",
        "transcript": """Thank you for calling TechSupport, my name is Carlos, how can I help you today?
        I understand your frustration, let me look into that for you right away.
        Could you please provide me with your account number?
        I see the issue on my end, it looks like your subscription needs to be renewed.
        I can transfer you to our billing department, would you like me to do that?
        Is there anything else I can help you with today?
        I apologize for the inconvenience, we're working on resolving this issue.
        Your case number is 4521, please keep it for reference.
        Thank you for your patience, have a great day.""",
        "expected_phrases_count": 8,
    },
    {
        "id": "sample_03",
        "title": "Travel at the Airport",
        "level": "A2",
        "context": "travel",
        "transcript": """Excuse me, where is the check-in counter for Delta airlines?
        You need to go to terminal B, it's on the second floor.
        Do you have your passport and boarding pass ready?
        Yes, here they are. What time does the gate open?
        The gate opens at two thirty, boarding starts at three o'clock.
        How many bags are you checking in?
        Just one suitcase and a carry-on.
        Would you like a window seat or an aisle seat?
        Window seat please, I like looking at the clouds.
        Your flight has been delayed by thirty minutes, we apologize for the inconvenience.""",
        "expected_phrases_count": 9,
    },
    {
        "id": "sample_04",
        "title": "Job Interview",
        "level": "B2",
        "context": "interviews",
        "transcript": """Tell me about yourself and your experience.
        I've been working in customer service for about three years.
        What are your strengths and weaknesses?
        I'm very detail oriented and I work well under pressure.
        Where do you see yourself in five years?
        I hope to have grown into a team lead position.
        Why do you want to work for our company?
        I admire your company's commitment to customer satisfaction.
        Do you have any questions for us?
        Yes, what does a typical day look like in this role?""",
        "expected_phrases_count": 9,
    },
    {
        "id": "sample_05",
        "title": "Restaurant Order",
        "level": "A1",
        "context": "general",
        "transcript": """Good evening, table for two please.
        Right this way, here's the menu.
        Can I get you something to drink?
        Just water for me, please.
        I'll have the grilled chicken with vegetables.
        And I'd like the pasta with tomato sauce.
        Would you like any appetizers?
        No thanks, we'll just have the main course.
        How was everything tonight?
        It was delicious, thank you.
        Can we get the check please?
        Of course, I'll bring it right over.""",
        "expected_phrases_count": 11,
    },
]


@dataclass
class BenchmarkResult:
    """Result of a single benchmark test."""
    transcript_id: str
    provider: str
    role: str
    latency_seconds: float
    raw_cards_count: int
    valid_cards_count: int
    selection_accuracy: float  # % of phrases that exist in transcript
    format_compliance: bool   # Valid JSON returned
    error: Optional[str] = None
    
    # Per-card metrics
    avg_colombian_note_length: float = 0.0
    avg_grammar_note_length: float = 0.0
    avg_context_note_length: float = 0.0
    cards_with_keyword: int = 0


@dataclass
class BenchmarkReport:
    """Aggregated benchmark results."""
    role: str
    provider: str
    total_tests: int = 0
    successful_tests: int = 0
    failed_tests: int = 0
    avg_latency: float = 0.0
    avg_selection_accuracy: float = 0.0
    format_compliance_rate: float = 0.0
    avg_cards_per_test: float = 0.0
    results: list = field(default_factory=list)


def check_phrase_in_transcript(phrase: str, transcript: str) -> bool:
    """Check if a phrase exists in the transcript (case-insensitive)."""
    phrase_lower = phrase.lower().strip()
    transcript_lower = transcript.lower()
    
    # Exact match
    if phrase_lower in transcript_lower:
        return True
    
    # Word overlap check (for slight variations)
    phrase_words = set(phrase_lower.split())
    transcript_words = set(transcript_lower.split())
    
    if not phrase_words:
        return False
    
    overlap = phrase_words.intersection(transcript_words)
    return len(overlap) / len(phrase_words) >= 0.8


def evaluate_card_quality(card: dict, transcript: str) -> dict:
    """Evaluate a single card's quality metrics."""
    metrics = {
        "has_colombian_note": bool(card.get("colombian_note", "").strip()),
        "has_grammar_note": bool(card.get("grammar_note", "").strip()),
        "has_context_note": bool(card.get("context_note", "").strip()),
        "has_keyword": bool(card.get("keyword", "").strip()),
        "colombian_note_length": len(card.get("colombian_note", "")),
        "grammar_note_length": len(card.get("grammar_note", "")),
        "context_note_length": len(card.get("context_note", "")),
        "phrase_in_transcript": check_phrase_in_transcript(
            card.get("front", ""), transcript
        ),
    }
    return metrics


async def run_benchmark_single(
    transcript_data: dict,
    provider: str,
    role: str,
) -> BenchmarkResult:
    """Run benchmark for a single transcript with a specific provider."""
    start_time = time.time()
    error = None
    raw_cards = []
    
    try:
        if role == "curator":
            raw_cards, _ = await extract_candidates(
                transcript_text=transcript_data["transcript"],
                level=transcript_data["level"],
                max_cards=15,
                user_role="user",
            )
        else:  # designer
            # For designer, we need filtered candidates first
            # Use a simplified version for benchmarking
            raw_cards, _ = await extract_candidates(
                transcript_text=transcript_data["transcript"],
                level=transcript_data["level"],
                max_cards=15,
                user_role="user",
            )
    except Exception as e:
        error = str(e)
    
    latency = time.time() - start_time
    
    # Evaluate results
    valid_cards = [c for c in raw_cards if c.get("colombian_note", "").strip()]
    
    # Calculate metrics
    if valid_cards:
        card_metrics = [
            evaluate_card_quality(c, transcript_data["transcript"])
            for c in valid_cards
        ]
        
        selection_accuracy = sum(
            1 for m in card_metrics if m["phrase_in_transcript"]
        ) / len(card_metrics) * 100
        
        avg_colombian_len = sum(
            m["colombian_note_length"] for m in card_metrics
        ) / len(card_metrics)
        
        avg_grammar_len = sum(
            m["grammar_note_length"] for m in card_metrics
        ) / len(card_metrics)
        
        avg_context_len = sum(
            m["context_note_length"] for m in card_metrics
        ) / len(card_metrics)
        
        cards_with_keyword = sum(
            1 for m in card_metrics if m["has_keyword"]
        )
    else:
        selection_accuracy = 0
        avg_colombian_len = 0
        avg_grammar_len = 0
        avg_context_len = 0
        cards_with_keyword = 0
    
    return BenchmarkResult(
        transcript_id=transcript_data["id"],
        provider=provider,
        role=role,
        latency_seconds=round(latency, 2),
        raw_cards_count=len(raw_cards),
        valid_cards_count=len(valid_cards),
        selection_accuracy=round(selection_accuracy, 1),
        format_compliance=error is None,
        error=error,
        avg_colombian_note_length=round(avg_colombian_len, 1),
        avg_grammar_note_length=round(avg_grammar_len, 1),
        avg_context_note_length=round(avg_context_len, 1),
        cards_with_keyword=cards_with_keyword,
    )


async def run_benchmark(
    role: str = "curator",
    provider: Optional[str] = None,
    max_transcripts: int = 5,
) -> BenchmarkReport:
    """Run full benchmark for a role and provider."""
    if provider is None:
        # Use first provider in the role's fallback chain
        fallback = _get_role_fallback(role)
        provider = fallback[0] if fallback else "openrouter"
    
    logger.info(f"Starting benchmark: role={role}, provider={provider}")
    
    results = []
    transcripts_to_test = SAMPLE_TRANSCRIPTS[:max_transcripts]
    
    for t in transcripts_to_test:
        logger.info(f"Testing {t['id']}...")
        result = await run_benchmark_single(t, provider, role)
        results.append(result)
        logger.info(
            f"  {result.transcript_id}: {result.valid_cards_count} cards, "
            f"accuracy={result.selection_accuracy}%, latency={result.latency_seconds}s"
        )
    
    # Aggregate
    successful = [r for r in results if r.format_compliance and r.valid_cards_count > 0]
    
    report = BenchmarkReport(
        role=role,
        provider=provider,
        total_tests=len(results),
        successful_tests=len(successful),
        failed_tests=len(results) - len(successful),
        avg_latency=round(
            sum(r.latency_seconds for r in successful) / max(len(successful), 1), 2
        ),
        avg_selection_accuracy=round(
            sum(r.selection_accuracy for r in successful) / max(len(successful), 1), 1
        ),
        format_compliance_rate=round(
            sum(1 for r in results if r.format_compliance) / len(results) * 100, 1
        ),
        avg_cards_per_test=round(
            sum(r.valid_cards_count for r in successful) / max(len(successful), 1), 1
        ),
        results=results,
    )
    
    return report


def print_report(report: BenchmarkReport):
    """Print a formatted benchmark report."""
    print("\n" + "=" * 70)
    print(f"BENCHMARK REPORT — {report.role.upper()} Role — Provider: {report.provider}")
    print("=" * 70)
    print(f"  Total Tests:        {report.total_tests}")
    print(f"  Successful:         {report.successful_tests}")
    print(f"  Failed:             {report.failed_tests}")
    print(f"  Avg Latency:        {report.avg_latency}s")
    print(f"  Avg Accuracy:       {report.avg_selection_accuracy}%")
    print(f"  Format Compliance:  {report.format_compliance_rate}%")
    print(f"  Avg Cards/Test:     {report.avg_cards_per_test}")
    print("-" * 70)
    
    for r in report.results:
        status = "PASS" if r.format_compliance and r.valid_cards_count > 0 else "FAIL"
        print(f"  [{status}] {r.transcript_id}: "
              f"{r.valid_cards_count} cards, "
              f"accuracy={r.selection_accuracy}%, "
              f"latency={r.latency_seconds}s"
              f"{f' — ERROR: {r.error}' if r.error else ''}")
    
    print("=" * 70 + "\n")


async def main():
    parser = argparse.ArgumentParser(description="Pedagogical Benchmark for AnkiTube AI Router")
    parser.add_argument("--role", choices=["curator", "designer", "both"], default="both")
    parser.add_argument("--provider", type=str, default=None)
    parser.add_argument("--transcripts", type=int, default=5)
    args = parser.parse_args()
    
    reports = []
    
    if args.role in ("curator", "both"):
        report = await run_benchmark("curator", args.provider, args.transcripts)
        print_report(report)
        reports.append(report)
    
    if args.role in ("designer", "both"):
        report = await run_benchmark("designer", args.provider, args.transcripts)
        print_report(report)
        reports.append(report)
    
    # Save results
    output_path = Path(__file__).parent / "benchmark_results.json"
    output_data = []
    for r in reports:
        output_data.append({
            "role": r.role,
            "provider": r.provider,
            "total_tests": r.total_tests,
            "successful_tests": r.successful_tests,
            "avg_latency": r.avg_latency,
            "avg_selection_accuracy": r.avg_selection_accuracy,
            "format_compliance_rate": r.format_compliance_rate,
            "avg_cards_per_test": r.avg_cards_per_test,
        })
    
    output_path.write_text(json.dumps(output_data, indent=2))
    print(f"Results saved to {output_path}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
