import logging
from datetime import datetime, timezone
from celery import shared_task
from motor.motor_asyncio import AsyncIOMotorClient
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


@shared_task(name="tasks.license_check.check_expired_licenses", bind=True, max_retries=3)
def check_expired_licenses(self):
    """Verifica y desactiva licencias expiradas."""
    import asyncio
    return asyncio.run(_check_licenses())


async def _check_licenses():
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_db]

    try:
        now = datetime.now(timezone.utc)

        # Buscar licencias activas expiradas
        expired = await db.licenses.find(
            {
                "expires_at": {"$lt": now},
                "status": "active",
                "deleted_at": None,
            }
        ).to_list(length=None)

        if not expired:
            logger.info("No hay licencias expiradas")
            return {"expired_count": 0}

        count = 0
        for license in expired:
            user_id = license.get("user_id")

            # Cambiar estado de licencia a expirada
            await db.licenses.update_one(
                {"_id": license["_id"]},
                {"$set": {"status": "expired", "updated_at": now}},
            )

            # Degradar rol del usuario a "user"
            if user_id:
                await db.users.update_one(
                    {"_id": user_id},
                    {"$set": {"role": "user", "updated_at": now}},
                )

            count += 1
            logger.info(f"Licencia expirada: {license.get('code')} usuario {user_id}")

        logger.info(f"Licencias expiradas procesadas: {count}")
        return {"expired_count": count}

    except Exception as e:
        logger.error(f"Error verificando licencias: {e}")
        raise
    finally:
        client.close()
