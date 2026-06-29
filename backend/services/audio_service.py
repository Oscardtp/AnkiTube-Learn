import os
import subprocess
import tempfile
import hashlib
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

# Temporary audio storage (Railway volume or /tmp)
AUDIO_CACHE_DIR = Path("/tmp/ankitube_audio")
AUDIO_CACHE_DIR.mkdir(exist_ok=True)


async def download_audio(video_id: str) -> Path:
    """Download full audio from YouTube using yt-dlp."""
    output_path = AUDIO_CACHE_DIR / f"{video_id}.mp3"

    if output_path.exists():
        return output_path

    url = f"https://www.youtube.com/watch?v={video_id}"
    cmd = [
        "yt-dlp",
        "--extract-audio",
        "--audio-format", "mp3",
        "--audio-quality", "5",  # Lower quality = smaller file
        "-o", str(output_path),
        url
    ]

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if result.returncode != 0:
        raise Exception(f"yt-dlp failed: {result.stderr}")

    return output_path


async def get_audio_clip(video_id: str, start: float, end: float, card_index: int) -> Path:
    """Extract a specific clip from the audio."""
    clip_key = f"{video_id}_{card_index}"
    clip_path = AUDIO_CACHE_DIR / f"{clip_key}.mp3"

    if clip_path.exists():
        return clip_path

    # Download full audio first
    full_audio = await download_audio(video_id)

    # Cut with FFmpeg
    duration = end - start
    cmd = [
        "ffmpeg",
        "-i", str(full_audio),
        "-ss", str(start),
        "-t", str(duration),
        "-acodec", "copy",
        "-y",  # Overwrite
        str(clip_path)
    ]

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if result.returncode != 0:
        raise Exception(f"FFmpeg failed: {result.stderr}")

    return clip_path


async def get_all_deck_clips(video_id: str, cards: list) -> list[Path]:
    """Pre-download all clips for a deck."""
    clips = []
    for i, card in enumerate(cards):
        clip = await get_audio_clip(
            video_id,
            card["timestamp_start"],
            card["timestamp_end"],
            i
        )
        clips.append(clip)
    return clips


def cleanup_old_files(max_age_hours: int = 24):
    """Remove audio files older than max_age_hours."""
    now = time.time()
    for f in AUDIO_CACHE_DIR.glob("*.mp3"):
        if now - f.stat().st_mtime > max_age_hours * 3600:
            f.unlink()
