import logging
from celery import shared_task
from services.audio_service import cleanup_old_files

logger = logging.getLogger(__name__)


@shared_task(name="tasks.audio_cleanup.cleanup_audio_cache")
def cleanup_audio_cache():
    """Called by Celery beat to clean old audio files."""
    logger.info("Starting audio cache cleanup")
    cleanup_old_files(max_age_hours=24)
    logger.info("Audio cache cleanup completed")
