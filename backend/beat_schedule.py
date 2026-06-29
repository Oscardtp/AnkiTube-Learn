from celery.schedules import crontab
from celery_app import celery_app

celery_app.conf.beat_schedule = {
    # Licencias: diario a las 2am Colombia
    "check-licenses-daily": {
        "task": "tasks.license_check.check_expired_licenses",
        "schedule": crontab(hour=2, minute=0),
    },
    # Frases WhatsApp: 8am, 2pm, 7pm Colombia
    "whatsapp-phrase-8am": {
        "task": "tasks.whatsapp_phrase.send_whatsapp_phrase",
        "schedule": crontab(hour=8, minute=0),
    },
    "whatsapp-phrase-2pm": {
        "task": "tasks.whatsapp_phrase.send_whatsapp_phrase",
        "schedule": crontab(hour=14, minute=0),
    },
    "whatsapp-phrase-7pm": {
        "task": "tasks.whatsapp_phrase.send_whatsapp_phrase",
        "schedule": crontab(hour=19, minute=0),
    },
    # Repasos diarios: 6am Colombia
    "daily-review-6am": {
        "task": "tasks.daily_review.generate_daily_review_deck",
        "schedule": crontab(hour=6, minute=0),
    },
    # Reportes mensuales: día 1 a las 3am
    "monthly-report": {
        "task": "tasks.monthly_report.generate_monthly_report",
        "schedule": crontab(hour=3, minute=0, day_of_month=1),
    },
    # Limpieza de cache de audio: 4am Colombia
    "cleanup-audio-daily": {
        "task": "tasks.audio_cleanup.cleanup_audio_cache",
        "schedule": crontab(hour=4, minute=0),
    },
}
