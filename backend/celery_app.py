from celery import Celery
from config import get_settings

settings = get_settings()

celery_app = Celery(
    "ankitube",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=[
        "tasks.daily_review",
        "tasks.whatsapp_phrase",
        "tasks.license_check",
        "tasks.monthly_report",
        "tasks.audio_cleanup",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Bogota",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 min max por tarea
    task_soft_time_limit=240,
    worker_max_tasks_per_child=100,
    worker_prefetch_multiplier=1,
)

celery_app.conf.beat_schedule = None  # Definido en beat_schedule.py
