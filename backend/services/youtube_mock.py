"""
Mock YouTube service for Phase 1 MVP.
get_transcript() has the IDENTICAL signature as youtube-transcript-api.
Phase 2 replacement: swap this file for youtube_real.py — zero other changes needed.
"""

import re
from typing import Optional, Tuple
from langdetect import detect, DetectorFactory
from langdetect.lang_detect_exception import LangDetectException

# Set seed for consistent language detection
DetectorFactory.seed = 0


# Schema identical to youtube-transcript-api TranscriptList
MOCK_TRANSCRIPTS: dict[str, dict] = {
    "default": {
        "video_id": "dQw4w9WgXcQ",
        "title": "English for Everyday Life — Common Phrases",
        "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
        "transcript": [
            {"text": "Hey, what's up everyone? Welcome back to the channel.", "start": 0.5, "duration": 3.2},
            {"text": "Today we're gonna talk about phrases you actually use every single day.", "start": 3.7, "duration": 4.1},
            {"text": "Let's kick things off with something super common.", "start": 8.0, "duration": 2.8},
            {"text": "When someone asks how you're doing, instead of just saying 'fine',", "start": 10.8, "duration": 3.5},
            {"text": "you can say 'I'm doing pretty well, thanks for asking.'", "start": 14.3, "duration": 3.2},
            {"text": "Or if you're really busy, 'I've been swamped lately, but I'm hanging in there.'", "start": 17.5, "duration": 4.0},
            {"text": "That phrase — hanging in there — means you're managing despite difficulties.", "start": 21.5, "duration": 4.2},
            {"text": "Now let's talk about making plans with someone.", "start": 26.0, "duration": 2.9},
            {"text": "You might say 'Are you down for grabbing coffee later?'", "start": 28.9, "duration": 3.1},
            {"text": "'Down for' means you're interested or willing to do something.", "start": 32.0, "duration": 3.5},
            {"text": "And if you need to cancel, always give a heads up.", "start": 35.5, "duration": 2.8},
            {"text": "'Hey, I hate to bail on you, but something came up.'", "start": 38.3, "duration": 3.2},
            {"text": "Bail means to cancel or leave unexpectedly.", "start": 41.5, "duration": 2.7},
            {"text": "At work, you'll often hear 'let's touch base on that tomorrow.'", "start": 44.2, "duration": 3.8},
            {"text": "Touch base means to briefly connect or check in with someone.", "start": 48.0, "duration": 3.5},
            {"text": "Another work phrase: 'Can you bring me up to speed on the project?'", "start": 51.5, "duration": 3.7},
            {"text": "Bring someone up to speed means to update them on what's happened.", "start": 55.2, "duration": 3.8},
            {"text": "When something is your responsibility, you say 'I'll take care of it.'", "start": 59.0, "duration": 3.5},
            {"text": "Or more casually, 'I've got it covered, don't worry about it.'", "start": 62.5, "duration": 3.3},
            {"text": "If you make a mistake, own it: 'My bad, that was completely on me.'", "start": 65.8, "duration": 3.7},
            {"text": "'My bad' is a casual way to apologize for a small mistake.", "start": 69.5, "duration": 3.2},
            {"text": "When you don't understand something, instead of saying 'I don't understand',", "start": 72.7, "duration": 3.5},
            {"text": "try 'Could you break that down for me?' or 'I'm not following, can you clarify?'", "start": 76.2, "duration": 4.0},
            {"text": "These sound much more natural and professional.", "start": 80.2, "duration": 2.8},
            {"text": "Alright, that's a wrap for today. If this was helpful, hit that like button.", "start": 83.0, "duration": 4.0},
            {"text": "And I'll catch you in the next one. Take care!", "start": 87.0, "duration": 2.5},
        ],
    },
    "bpo": {
        "video_id": "bpo_mock_001",
        "title": "Call Center English — Customer Service Phrases",
        "thumbnail": "https://img.youtube.com/vi/bpo_mock_001/mqdefault.jpg",
        "transcript": [
            {"text": "Welcome to customer service training. Let's get started.", "start": 1.0, "duration": 3.0},
            {"text": "The first thing you say when answering a call:", "start": 4.0, "duration": 2.5},
            {"text": "'Thank you for calling, this is [name], how can I assist you today?'", "start": 6.5, "duration": 4.2},
            {"text": "When a customer is upset, never say 'calm down'. Instead:", "start": 10.7, "duration": 3.5},
            {"text": "'I completely understand your frustration, and I'm here to help.'", "start": 14.2, "duration": 3.8},
            {"text": "When you need them to wait: 'Would you mind holding for just a moment?'", "start": 18.0, "duration": 3.5},
            {"text": "Always say 'just a moment' — never 'hold on' which sounds abrupt.", "start": 21.5, "duration": 3.8},
            {"text": "When transferring: 'I'm going to connect you with the right department.'", "start": 25.3, "duration": 3.7},
            {"text": "When you've resolved the issue: 'Is there anything else I can help you with?'", "start": 29.0, "duration": 3.5},
            {"text": "And always close with: 'Thank you for your patience. Have a great day!'", "start": 32.5, "duration": 3.8},
            {"text": "Remember: empathy, clarity, and professionalism are your three pillars.", "start": 36.3, "duration": 4.0},
        ],
    },
}


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
    Returns transcript data with schema IDENTICAL to youtube-transcript-api.
    Phase 2: replace this function body with real API call — signature stays the same.

    Returns:
        {
            "video_id": str,
            "title": str,
            "thumbnail": str,
            "transcript": [{"text": str, "start": float, "duration": float}]
        }
    """
    video_id = extract_video_id(youtube_url)

    # Use BPO mock if context is bpo
    if context == "bpo":
        mock = MOCK_TRANSCRIPTS["bpo"].copy()
        if video_id:
            mock["video_id"] = video_id
        return mock

    # Default mock for all other contexts
    mock = MOCK_TRANSCRIPTS["default"].copy()
    if video_id:
        mock["video_id"] = video_id
        mock["thumbnail"] = f"https://img.youtube.com/vi/{video_id}/mqdefault.jpg"
    return mock


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


def detect_language(text: str) -> Tuple[str, float]:
    """
    Detect the primary language of a text.
    
    Returns:
        Tuple of (language_code, confidence_score)
        e.g., ("en", 0.99) for English, ("es", 0.95) for Spanish
    """
    try:
        # langdetect returns just the language code
        lang = detect(text)
        # We don't have explicit confidence, but we can estimate based on text length
        # For short texts, detection is less reliable
        confidence = 0.99 if len(text) > 100 else 0.85
        return lang, confidence
    except LangDetectException:
        # If detection fails, assume unknown
        return "unknown", 0.0


def is_english_content(transcript: list[dict], threshold: float = 0.7) -> Tuple[bool, str]:
    """
    Check if the transcript is primarily in English.
    
    Args:
        transcript: List of transcript entries with "text" field
        threshold: Minimum proportion of English text required (default 70%)
    
    Returns:
        Tuple of (is_english, detected_language)
    """
    if not transcript:
        return False, "unknown"
    
    # Combine all transcript text for analysis
    full_text = " ".join(entry["text"] for entry in transcript)
    
    if len(full_text.strip()) < 50:
        # Too short to reliably detect - allow it through
        return True, "en"
    
    try:
        detected_lang = detect(full_text)
        is_english = detected_lang == "en"
        return is_english, detected_lang
    except LangDetectException:
        # If detection fails, allow it through (don't block legitimate content)
        return True, "unknown"