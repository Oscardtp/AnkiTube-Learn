import logging
from datetime import datetime, timezone
from celery import shared_task
from motor.motor_asyncio import AsyncIOMotorClient
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


@shared_task(name="tasks.monthly_report.generate_monthly_report", bind=True, max_retries=3)
def generate_monthly_report(self):
    """Genera reporte mensual de actividad por usuario."""
    import asyncio
    return asyncio.run(_generate_report())


async def _generate_report():
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_db]

    try:
        now = datetime.now(timezone.utc)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        users = await db.users.find(
            {"deleted_at": None}
        ).to_list(length=None)

        reports_created = 0

        for user in users:
            user_id = user["_id"]

            # Tarjetas estudiadas este mes
            cards_studied = await db.cards.count_documents(
                {
                    "user_id": user_id,
                    "last_reviewed_at": {"$gte": month_start},
                    "deleted_at": None,
                }
            )

            # Mazos creados este mes
            decks_created = await db.decks.count_documents(
                {
                    "user_id": user_id,
                    "created_at": {"$gte": month_start},
                    "deleted_at": None,
                }
            )

            # Streak actual
            streak = user.get("streak_count", 0)

            # Palabras aprendidas (tarjetas con sm2_interval > 21)
            words_learned = await db.cards.count_documents(
                {
                    "user_id": user_id,
                    "sm2_interval": {"$gt": 21},
                    "deleted_at": None,
                }
            )

            report = {
                "user_id": user_id,
                "month": month_start.strftime("%Y-%m"),
                "cards_studied": cards_studied,
                "decks_created": decks_created,
                "words_learned": words_learned,
                "current_streak": streak,
                "generated_at": now,
            }

            # Upsert: reemplazar si ya existe reporte del mismo mes
            await db.monthly_reports.update_one(
                {"user_id": user_id, "month": month_start.strftime("%Y-%m")},
                {"$set": report},
                upsert=True,
            )

            reports_created += 1
            logger.info(
                f"Reporte generado para {user_id}: "
                f"{cards_studied} tarjetas, {words_learned} palabras"
            )

        logger.info(f"Reportes mensuales completados: {reports_created}")
        return {"reports_generated": reports_created}

    except Exception as e:
        logger.error(f"Error generando reportes mensuales: {e}")
        raise
    finally:
        client.close()
