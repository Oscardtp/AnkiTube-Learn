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

logger = logging.getLogger(__name__)


def extract_video_id(url: str) -> Optional[str]:
    """Extract YouTube video ID from various URL formats."""
    patterns = [
        r"(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)",
        r"youtube\.com\/shorts\/([^&\n?#]+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


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

    # BPO context: keep mock behavior for demo purposes
    if context == "bpo":
        from services.youtube_mock import MOCK_TRANSCRIPTS
        mock = MOCK_TRANSCRIPTS["bpo"].copy()
        if video_id:
            mock["video_id"] = video_id
        return mock

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
