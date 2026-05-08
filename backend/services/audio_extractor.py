"""
YouTube audio extraction service.
Extracts audio segments from YouTube videos using yt-dlp and ffmpeg.
Phase 1: Uses mock transcripts with timestamps.
Phase 2: Real YouTube transcript + audio extraction.
"""

import os
import tempfile
import subprocess
import logging
from typing import Optional
from pathlib import Path

logger = logging.getLogger(__name__)


def extract_audio_segment(
    youtube_url: str,
    start_time: float,
    end_time: float,
    output_filename: str,
    output_dir: Optional[str] = None,
) -> str:
    """
    Extract an audio segment from a YouTube video.

    Args:
        youtube_url: YouTube video URL
        start_time: Start time in seconds
        end_time: End time in seconds
        output_filename: Name for the output audio file (e.g., 'card_abc123.mp3')
        output_dir: Directory to save the audio file (default: temp directory)

    Returns:
        Full path to the extracted audio file
    """
    if output_dir is None:
        output_dir = tempfile.mkdtemp(prefix="ankitube_audio_")

    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, output_filename)

    # Calculate duration
    duration = end_time - start_time

    # yt-dlp command to download and extract audio segment
    # Using --download-sections for efficient partial download (Phase 2 feature)
    cmd = [
        "yt-dlp",
        "--extract-audio",
        "--audio-format", "mp3",
        "--postprocessor-args", f"ffmpeg:-ss {start_time} -t {duration}",
        "--output", output_path.replace(".mp3", ""),
        "--force-overwrites",
        "--no-playlist",
        youtube_url,
    ]

    try:
        logger.info(f"Extracting audio segment: {start_time}s - {end_time}s from {youtube_url}")
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=60,
        )

        if result.returncode != 0:
            logger.error(f"yt-dlp failed: {result.stderr}")
            raise RuntimeError(f"Failed to extract audio: {result.stderr}")

        # yt-dlp may add .mp3 extension automatically
        if not output_path.endswith(".mp3"):
            output_path += ".mp3"

        if os.path.exists(output_path):
            logger.info(f"Audio extracted successfully: {output_path}")
            return output_path
        else:
            # Try to find the file with .mp3 extension
            mp3_path = output_path.replace(".mp3", "") + ".mp3"
            if os.path.exists(mp3_path):
                logger.info(f"Audio extracted successfully: {mp3_path}")
                return mp3_path
            raise FileNotFoundError(f"Audio file not found at {output_path}")

    except subprocess.TimeoutExpired:
        logger.error(f"Timeout extracting audio segment")
        raise RuntimeError("Timeout extracting audio segment")
    except FileNotFoundError as e:
        logger.error(f"File not found: {e}")
        raise
    except Exception as e:
        logger.error(f"Error extracting audio: {e}")
        raise RuntimeError(f"Error extracting audio: {e}")


def extract_audio_segments_batch(
    youtube_url: str,
    segments: list[dict],
    output_dir: Optional[str] = None,
) -> dict[str, str]:
    """
    Extract multiple audio segments from a single YouTube video.

    Args:
        youtube_url: YouTube video URL
        segments: List of dicts with keys:
            - 'id': Card ID or identifier
            - 'start': Start time in seconds
            - 'end': End time in seconds
            - 'filename': Output filename (optional, will be generated if not provided)
        output_dir: Directory to save audio files

    Returns:
        Dict mapping segment_id to audio file path
    """
    if output_dir is None:
        output_dir = tempfile.mkdtemp(prefix="ankitube_audio_")

    os.makedirs(output_dir, exist_ok=True)

    audio_files = {}
    failed_extractions = []

    # First, download the full audio once (more efficient)
    full_audio_path = download_full_audio(youtube_url, output_dir)

    for i, segment in enumerate(segments):
        segment_id = segment.get("id", f"segment_{i}")
        start_time = segment["start"]
        end_time = segment["end"]
        filename = segment.get("filename", f"card_{segment_id}.mp3")

        try:
            output_path = extract_audio_segment_from_file(
                full_audio_path,
                start_time,
                end_time,
                filename,
                output_dir,
            )
            audio_files[segment_id] = output_path
            logger.info(f"Extracted segment {segment_id}: {filename}")
        except Exception as e:
            logger.warning(f"Failed to extract segment {segment_id}: {e}")
            failed_extractions.append(segment_id)

    if failed_extractions:
        logger.warning(f"Failed to extract {len(failed_extractions)} segments")

    return audio_files


def download_full_audio(
    youtube_url: str,
    output_dir: str,
) -> str:
    """
    Download full audio from YouTube video once (for batch processing).

    Args:
        youtube_url: YouTube video URL
        output_dir: Directory to save the audio file

    Returns:
        Path to the downloaded audio file
    """
    os.makedirs(output_dir, exist_ok=True)
    output_template = os.path.join(output_dir, "full_audio")

    cmd = [
        "yt-dlp",
        "--extract-audio",
        "--audio-format", "mp3",
        "--output", output_template,
        "--force-overwrites",
        "--no-playlist",
        youtube_url,
    ]

    try:
        logger.info(f"Downloading full audio from {youtube_url}")
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300,  # 5 minutes for full download
        )

        if result.returncode != 0:
            logger.error(f"yt-dlp failed: {result.stderr}")
            raise RuntimeError(f"Failed to download audio: {result.stderr}")

        # Find the downloaded file
        audio_path = output_template + ".mp3"
        if os.path.exists(audio_path):
            logger.info(f"Full audio downloaded: {audio_path}")
            return audio_path
        else:
            raise FileNotFoundError(f"Audio file not found at {audio_path}")

    except subprocess.TimeoutExpired:
        logger.error("Timeout downloading full audio")
        raise RuntimeError("Timeout downloading full audio")
    except Exception as e:
        logger.error(f"Error downloading full audio: {e}")
        raise


def extract_audio_segment_from_file(
    input_audio_path: str,
    start_time: float,
    end_time: float,
    output_filename: str,
    output_dir: str,
) -> str:
    """
    Extract an audio segment from an already downloaded audio file.

    Args:
        input_audio_path: Path to the full audio file
        start_time: Start time in seconds
        end_time: End time in seconds
        output_filename: Output filename
        output_dir: Output directory

    Returns:
        Path to the extracted audio segment
    """
    output_path = os.path.join(output_dir, output_filename)
    duration = end_time - start_time

    # Use ffmpeg to extract segment
    cmd = [
        "ffmpeg",
        "-y",  # Overwrite output file
        "-i", input_audio_path,
        "-ss", str(start_time),
        "-t", str(duration),
        "-c:a", "libmp3lame",
        "-b:a", "128k",
        output_path,
    ]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30,
        )

        if result.returncode != 0:
            logger.error(f"ffmpeg failed: {result.stderr}")
            raise RuntimeError(f"Failed to extract audio segment: {result.stderr}")

        if os.path.exists(output_path):
            logger.info(f"Audio segment extracted: {output_path}")
            return output_path
        else:
            raise FileNotFoundError(f"Output file not created: {output_path}")

    except subprocess.TimeoutExpired:
        logger.error("Timeout extracting audio segment")
        raise RuntimeError("Timeout extracting audio segment")
    except Exception as e:
        logger.error(f"Error extracting audio segment: {e}")
        raise


def check_dependencies() -> dict[str, bool]:
    """
    Check if required dependencies are installed.

    Returns:
        Dict with dependency names and their availability status
    """
    dependencies = {}

    # Check yt-dlp
    try:
        result = subprocess.run(
            ["yt-dlp", "--version"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        dependencies["yt-dlp"] = result.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError):
        dependencies["yt-dlp"] = False

    # Check ffmpeg
    try:
        result = subprocess.run(
            ["ffmpeg", "-version"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        dependencies["ffmpeg"] = result.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError):
        dependencies["ffmpeg"] = False

    return dependencies
