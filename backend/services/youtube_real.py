"""
Real YouTube service using youtube-transcript-api.
Same signature as youtube_mock.py — drop-in replacement.
"""

import logging
import re
from typing import Optional

import requests
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import NoTranscriptFound, TranscriptsDisabled, VideoUnavailable

from utils.youtube import extract_video_id

logger = logging.getLogger(__name__)


def _normalize_text(text: str) -> str:
    """Normalize text for matching: lowercase, remove punctuation, collapse spaces."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text


def match_cards_to_transcript(cards: list, transcript: list[dict]) -> list:
    """
    Match each card's front text to transcript entries and assign real timestamps.

    Args:
        cards: AI-generated cards (without reliable timestamps)
        transcript: YouTube transcript entries with start/duration

    Returns:
        Cards with real timestamps assigned from the transcript
    """
    if not transcript:
        return cards

    # Build normalized transcript entries
    normalized_entries = []
    for entry in transcript:
        normalized_entries.append({
            "text": _normalize_text(entry["text"]),
            "start": entry["start"],
            "duration": entry["duration"],
        })

    for card in cards:
        card_text = _normalize_text(card.front)

        best_start = None
        best_end = None
        best_score = 0

        # Sliding window: try matching against 1-3 consecutive transcript entries
        for window_size in range(1, min(4, len(normalized_entries) + 1)):
            for i in range(len(normalized_entries) - window_size + 1):
                window = normalized_entries[i : i + window_size]
                combined_text = " ".join(e["text"] for e in window)

                # Calculate overlap score
                card_words = set(card_text.split())
                window_words = set(combined_text.split())
                if not card_words:
                    continue
                overlap = len(card_words & window_words)
                score = overlap / len(card_words)

                if score > best_score and score >= 0.5:
                    best_score = score
                    best_start = window[0]["start"]
                    best_end = window[-1]["start"] + window[-1]["duration"]

        if best_start is not None:
            card.timestamp_start = best_start
            card.timestamp_end = best_end
        else:
            # Fallback: leave timestamps as-is (AI estimate)
            logger.warning(f"No transcript match found for card: {card.front[:50]}...")

    return cards


def get_transcript(youtube_url: str, context: str = "general") -> dict:
    """
    Fetch real YouTube transcript and video metadata.

    Returns:
        {
            "video_id": str,
            "title": str,
            "thumbnail": str,
            "transcript": [{"text": str, "start": float, "duration": float}]
        }
    """
    video_id = extract_video_id(youtube_url)

    if not video_id:
        logger.error(f"Could not extract video ID from URL: {youtube_url}")
        raise ValueError("URL de YouTube inválida")

    # Fetch transcript
    try:
        yt = YouTubeTranscriptApi()
        raw_transcript = yt.fetch(video_id, languages=['es', 'en'])
    except NoTranscriptFound:
        logger.warning(f"No transcript found for video {video_id}")
        raise ValueError("El video no tiene subtítulos disponibles")
    except TranscriptsDisabled:
        logger.warning(f"Transcripts disabled for video {video_id}")
        raise ValueError("Los subtítulos están deshabilitados para este video")
    except VideoUnavailable:
        logger.warning(f"Video unavailable: {video_id}")
        raise ValueError("El video no está disponible (privado o eliminado)")
    except Exception as e:
        logger.error(f"YouTube transcript API error for {video_id}: {e}")
        raise ValueError("No pudimos obtener los subtítulos para este video")

    # Fetch video title via oembed (lightweight, no API key needed)
    title = "YouTube Video"
    try:
        oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        response = requests.get(oembed_url, timeout=5)
        if response.status_code == 200:
            title = response.json().get("title", title)
    except Exception as e:
        logger.warning(f"Could not fetch video title via oembed for {video_id}: {e}")

    thumbnail = f"https://img.youtube.com/vi/{video_id}/mqdefault.jpg"

    # Normalize transcript entries to expected schema
    transcript = []
    for entry in raw_transcript:
        # Handle both dict (old API) and object (new API)
        if isinstance(entry, dict):
            text = entry.get("text", "")
            start = entry.get("start", 0.0)
            duration = entry.get("duration", 0.0)
        else:
            # New API returns objects with attributes
            text = getattr(entry, 'text', '')
            start = getattr(entry, 'start', 0.0)
            duration = getattr(entry, 'duration', 0.0)
        transcript.append({
            "text": text,
            "start": float(start),
            "duration": float(duration),
        })

    return {
        "video_id": video_id,
        "title": title,
        "thumbnail": thumbnail,
        "transcript": transcript,
    }


def transcript_to_text(transcript: list[dict]) -> str:
    """Convert transcript list to clean text for AI processing."""
    return " ".join(entry["text"] for entry in transcript)


def get_transcript_segment(transcript: list[dict], start: float, end: float) -> str:
    """Get transcript text for a specific time range."""
    segment = [
        entry["text"]
        for entry in transcript
        if entry["start"] >= start and (entry["start"] + entry["duration"]) <= end + 2
    ]
    return " ".join(segment)
