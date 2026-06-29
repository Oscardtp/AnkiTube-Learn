import logging
from datetime import datetime, timezone
from celery import shared_task
from motor.motor_asyncio import AsyncIOMotorClient
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


@shared_task(name="tasks.daily_review.generate_daily_review_deck", bind=True, max_retries=3)
def generate_daily_review_deck(self):
    """Genera mazos de repaso diario para usuarios con streak activo."""
    import asyncio
    return asyncio.run(_generate_daily_review())


async def _generate_daily_review():
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_db]

    try:
        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

        # Buscar usuarios con streak activo
        users = await db.users.find(
            {"streak_count": {"$gt": 0}, "deleted_at": None}
        ).to_list(length=None)

        total_decks = 0

        for user in users:
            user_id = user["_id"]

            # Buscar tarjetas que necesitan repaso
            due_cards = await db.cards.find(
                {
                    "user_id": user_id,
                    "sm2_due_date": {"$lte": today},
                    "deleted_at": None,
                }
            ).to_list(length=15)  # max 15 por repaso

            if not due_cards:
                continue

            # Almacenar en cache Redis para acceso rápido
            from celery_app import celery_app
            cache_key = f"daily_review:{user_id}:{today.isoformat()}"

            import json
            celery_app.backend.set(
                cache_key,
                json.dumps(
                    [
                        {
                            "card_id": str(card["_id"]),
                            "front": card.get("front", ""),
                            "back": card.get("back", ""),
                        }
                        for card in due_cards
                    ]
                ),
                ex=86400,  # expira en 24h
            )

            total_decks += 1
            logger.info(f"Mazo generado para usuario {user_id}: {len(due_cards)} tarjetas")

        logger.info(f"Repasos diarios completados: {total_decks} mazos generados")
        return {"decks_generated": total_decks}

    except Exception as e:
        logger.error(f"Error generando repasos diarios: {e}")
        raise
    finally:
        client.close()
