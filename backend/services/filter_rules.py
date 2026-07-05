"""
Deterministic filtering rules for the 3-step card generation pipeline.
No LLM calls — pure Python logic.
"""
import re
import logging
from difflib import SequenceMatcher

logger = logging.getLogger(__name__)

SIMILARITY_THRESHOLD = 0.8
MIN_WORDS = 3
MAX_WORDS = 15

STOPWORDS = {
    "the", "a", "an", "i", "you", "he", "she", "it", "we", "they",
    "my", "your", "his", "her", "its", "our", "their", "is", "am",
    "are", "was", "were", "be", "been", "being", "have", "has", "had",
    "do", "does", "did", "will", "would", "could", "should", "may",
    "might", "shall", "can", "to", "of", "in", "for", "on", "with",
    "at", "by", "from", "as", "into", "through", "during", "before",
    "after", "above", "below", "between", "and", "but", "or", "so",
    "if", "that", "this", "these", "those", "not", "no", "nor",
}

VALID_CARD_TYPES = {"vocabulary", "phrase", "idiom", "grammar_pattern"}


def _safe_str(value, default: str = "") -> str:
    """Safely convert value to string. Returns default if None or not a string."""
    if value is None:
        return default
    if isinstance(value, str):
        return value
    return str(value)


def _normalize(text: str) -> str:
    """Normalize text for comparison: lowercase, remove punctuation, collapse spaces."""
    text = _safe_str(text).lower().strip()
    text = re.sub(r"[^\w\s]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text


def _word_count(text: str) -> int:
    """Count words in text."""
    return len(text.split())


def _similarity(a: str, b: str) -> float:
    """Calculate similarity ratio between two strings."""
    return SequenceMatcher(None, _normalize(a), _normalize(b)).ratio()


def deduplicate(candidates: list[dict]) -> list[dict]:
    """
    Remove duplicate and near-duplicate cards.
    1. Exact duplicates: same normalized front
    2. Near-duplicates: similarity > 0.8
    Keeps the first occurrence.
    """
    if not candidates:
        return []

    seen_normalized: list[str] = []
    unique: list[dict] = []

    for card in candidates:
        front = card.get("front", "")
        if not front:
            continue

        norm_front = _normalize(front)

        # Check exact duplicate
        if norm_front in seen_normalized:
            continue

        # Check near-duplicate
        is_near_dup = False
        for seen in seen_normalized:
            if _similarity(norm_front, seen) > SIMILARITY_THRESHOLD:
                is_near_dup = True
                break

        if not is_near_dup:
            seen_normalized.append(norm_front)
            unique.append(card)

    return unique


def filter_by_length(candidates: list[dict]) -> list[dict]:
    """
    Filter cards by word count.
    - Too short: < 3 words
    - Too long: > 15 words
    """
    if not candidates:
        return []

    return [
        card for card in candidates
        if MIN_WORDS <= _word_count(card.get("front", "")) <= MAX_WORDS
    ]


def validate_timestamps(candidates: list[dict], transcript: list[dict]) -> list[dict]:
    """
    Validate that card timestamps exist within the transcript time range.
    If a card has timestamp_start and timestamp_end, check they're valid.
    If timestamps are 0.0, try to match the front text against transcript entries.
    Uses sliding window matching (1-3 entries).
    """
    if not candidates:
        return []

    if not transcript:
        logger.warning("Empty transcript — skipping timestamp validation")
        return candidates

    # Build normalized transcript entries
    normalized_entries = []
    for entry in transcript:
        normalized_entries.append({
            "text": _normalize(entry.get("text", "")),
            "start": float(entry.get("start", 0.0)),
            "duration": float(entry.get("duration", 0.0)),
        })

    transcript_duration = 0.0
    if normalized_entries:
        last = normalized_entries[-1]
        transcript_duration = last["start"] + last["duration"]

    result = []
    for card in candidates:
        ts_start = float(card.get("timestamp_start", 0.0) or 0.0)
        ts_end = float(card.get("timestamp_end", 0.0) or 0.0)

        # If timestamps are provided and non-zero, validate range
        if ts_start > 0.0 and ts_end > 0.0:
            if ts_start > transcript_duration or ts_end > transcript_duration + 2:
                # Invalid timestamp — try to re-match
                matched = _match_front_to_transcript(_safe_str(card.get("front")), normalized_entries)
                if matched:
                    card["timestamp_start"] = matched["start"]
                    card["timestamp_end"] = matched["end"]
                else:
                    card["timestamp_start"] = 0.0
                    card["timestamp_end"] = 0.0
            elif ts_end <= ts_start:
                card["timestamp_end"] = ts_start + 2.0
        else:
            # Timestamps missing — try to match
            matched = _match_front_to_transcript(_safe_str(card.get("front")), normalized_entries)
            if matched:
                card["timestamp_start"] = matched["start"]
                card["timestamp_end"] = matched["end"]

        result.append(card)

    return result


def _match_front_to_transcript(
    front: str, normalized_entries: list[dict]
) -> dict | None:
    """Match a card's front text against transcript using sliding window."""
    if not front or not normalized_entries:
        return None

    card_text = _normalize(front)
    card_words = set(card_text.split())
    if not card_words:
        return None

    best_start = None
    best_end = None
    best_score = 0

    for window_size in range(1, min(4, len(normalized_entries) + 1)):
        for i in range(len(normalized_entries) - window_size + 1):
            window = normalized_entries[i : i + window_size]
            combined_text = " ".join(e["text"] for e in window)
            window_words = set(combined_text.split())

            overlap = len(card_words & window_words)
            score = overlap / len(card_words)

            if score > best_score and score >= 0.5:
                best_score = score
                best_start = window[0]["start"]
                best_end = window[-1]["start"] + window[-1]["duration"]

    if best_start is not None:
        return {"start": best_start, "end": best_end}
    return None


def remove_identical_front_back(candidates: list[dict]) -> list[dict]:
    """
    Remove cards where front and back are the same (or very similar).
    """
    if not candidates:
        return []

    return [
        card for card in candidates
        if _similarity(card.get("front", ""), card.get("back", "")) < SIMILARITY_THRESHOLD
    ]


def validate_required_fields(candidates: list[dict]) -> list[dict]:
    """
    Validate required fields exist and are non-empty:
    - front: required, non-empty
    - back: required, non-empty
    - keyword: if missing, auto-assign first non-stopword from front
    - colombian_note: required, non-empty (discard if missing)
    - grammar_note: optional (used in Step 3 selection, not Step 1 extraction)
    - context_note: optional (used in Step 3 selection, not Step 1 extraction)
    - card_type: must be one of vocabulary|phrase|idiom|grammar_pattern
    """
    if not candidates:
        return []

    valid = []
    for card in candidates:
        front = _safe_str(card.get("front")).strip()
        back = _safe_str(card.get("back")).strip()

        if not front or not back:
            continue

        colombian_note = _safe_str(card.get("colombian_note")).strip()
        if not colombian_note:
            logger.debug(f"Card discarded — missing colombian_note: {front[:50]}")
            continue

        # grammar_note and context_note are OPTIONAL in Step 1 extraction
        # They get enriched in Step 3 (selection) by the LLM
        # Don't discard cards missing these fields

        # Auto-assign keyword if missing
        keyword = _safe_str(card.get("keyword")).strip()
        if not keyword or keyword.lower() == front.lower():
            words = front.split()
            for word in words:
                clean = word.lower().strip(".,!?;:")
                if clean and clean not in STOPWORDS:
                    keyword = word.strip(".,!?;:")
                    break
            if not keyword and words:
                keyword = words[0].strip(".,!?;:")
            card["keyword"] = keyword

        # Validate card_type
        card_type = _safe_str(card.get("card_type"), "phrase").strip()
        if card_type not in VALID_CARD_TYPES:
            card_type = "phrase"
        card["card_type"] = card_type

        valid.append(card)

    return valid


def filter_candidates(candidates: list[dict], transcript: list[dict]) -> list[dict]:
    """
    Main entry point. Apply all filters in sequence.
    Returns filtered list of card dicts.
    """
    logger.info(f"[FILTER] Starting with {len(candidates)} candidates")
    
    result = deduplicate(candidates)
    logger.info(f"[FILTER] After deduplicate: {len(result)}")
    
    result = filter_by_length(result)
    logger.info(f"[FILTER] After length filter: {len(result)}")
    
    result = validate_timestamps(result, transcript)
    logger.info(f"[FILTER] After timestamp validation: {len(result)}")
    
    result = remove_identical_front_back(result)
    logger.info(f"[FILTER] After identical front/back: {len(result)}")
    
    result = validate_required_fields(result)
    logger.info(f"[FILTER] After required fields: {len(result)}")
    
    return result
