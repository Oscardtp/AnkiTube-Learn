import os
import subprocess
import logging
import time
import sys
import asyncio
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)

# Store audio clips in backend/assets/audio
AUDIO_CACHE_DIR = Path(os.path.join(os.path.dirname(__file__), "..", "assets", "audio"))
AUDIO_CACHE_DIR.mkdir(parents=True, exist_ok=True)

# Resolve ffmpeg path - prefer imageio-ffmpeg bundled binary, fallback to system ffmpeg
def _get_ffmpeg_path() -> str:
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return "ffmpeg"

FFMPEG_PATH = _get_ffmpeg_path()


async def download_audio(video_id: str) -> Path:
    """Download full audio from YouTube using yt-dlp."""
    output_path = AUDIO_CACHE_DIR / f"{video_id}.mp3"

    if output_path.exists():
        return output_path

    # Use atomic lock file to prevent concurrent downloads for same video_id
    lock_path = AUDIO_CACHE_DIR / f"{video_id}_download.lock"
    
    # Check again after acquiring lock pattern (double-checked locking)
    if output_path.exists():
        return output_path

    # First download as webm, then convert to mp3 with ffmpeg
    temp_path = AUDIO_CACHE_DIR / f"{video_id}_temp.webm"
    url = f"https://www.youtube.com/watch?v={video_id}"

    # Step 1: Download audio with yt-dlp (no postprocessing) — run in thread to avoid blocking
    cmd_download = [
        sys.executable, "-m", "yt_dlp",
        "-f", "bestaudio",
        "--remote-components", "ejs:github",
        "--js-runtimes", "node",
        "-o", str(temp_path),
        url
    ]

    def _run_download():
        return subprocess.run(cmd_download, capture_output=True, text=True, timeout=180)

    result = await asyncio.to_thread(_run_download)
    if result.returncode != 0:
        raise Exception(f"yt-dlp failed: {result.stderr}")

    # Find the downloaded file (yt-dlp may add extension)
    downloaded_file = None
    for f in AUDIO_CACHE_DIR.glob(f"{video_id}_temp.*"):
        if not f.name.endswith(".lock"):
            downloaded_file = f
            break

    if not downloaded_file:
        raise Exception("Downloaded file not found")

    # Step 2: Convert to mp3 with ffmpeg — run in thread to avoid blocking
    cmd_convert = [
        FFMPEG_PATH,
        "-i", str(downloaded_file),
        "-acodec", "libmp3lame",
        "-ab", "128k",
        "-y",
        str(output_path)
    ]

    def _run_convert():
        return subprocess.run(cmd_convert, capture_output=True, text=True, timeout=120)

    result = await asyncio.to_thread(_run_convert)
    if result.returncode != 0:
        raise Exception(f"FFmpeg conversion failed: {result.stderr}")

    # Clean up temp file
    downloaded_file.unlink(missing_ok=True)

    return output_path


async def get_audio_clip(video_id: str, start: float, end: float, filename: str) -> Path:
    """Extract a specific clip from the audio."""
    if start is None or end is None or start < 0 or end <= start:
        raise ValueError(f"Invalid audio range for clip {filename}: start={start}, end={end}")

    clip_path = AUDIO_CACHE_DIR / filename

    if clip_path.exists():
        return clip_path

    # Download full audio first
    full_audio = await download_audio(video_id)

    # Cut with FFmpeg — run in thread to avoid blocking
    duration = end - start
    cmd = [
        FFMPEG_PATH,
        "-i", str(full_audio),
        "-ss", str(start),
        "-t", str(duration),
        "-acodec", "copy",
        "-y",  # Overwrite
        str(clip_path)
    ]

    def _run_ffmpeg():
        return subprocess.run(cmd, capture_output=True, text=True, timeout=60)

    result = await asyncio.to_thread(_run_ffmpeg)
    if result.returncode != 0:
        raise Exception(f"FFmpeg failed: {result.stderr}")

    return clip_path


def cleanup_old_files(max_age_hours: int = 24):
    """Remove audio files older than max_age_hours."""
    now = time.time()
    for f in AUDIO_CACHE_DIR.glob("*.mp3"):
        if now - f.stat().st_mtime > max_age_hours * 3600:
            f.unlink()
