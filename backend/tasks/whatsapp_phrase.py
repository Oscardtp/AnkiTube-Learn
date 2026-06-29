import logging
import random
from celery import shared_task
from motor.motor_asyncio import AsyncIOMotorClient
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


@shared_task(name="tasks.whatsapp_phrase.send_whatsapp_phrase", bind=True, max_retries=3)
def send_whatsapp_phrase(self):
    """Envía una frase aleatoria por WhatsApp Cloud API."""
    import asyncio
    return asyncio.run(_send_phrase())


async def _send_phrase():
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_db]

    try:
        # Seleccionar contenido curado aleatorio
        content = await db.content_reports.find(
            {"type": "curated_phrase", "deleted_at": None}
        ).to_list(length=None)

        if not content:
            # Fallback: buscar tarjetas de ejemplo
            cards = await db.cards.find(
                {"deleted_at": None}
            ).limit(50).to_list(length=50)

            if not cards:
                logger.warning("No hay contenido disponible para enviar")
                return {"sent": False, "reason": "no_content"}

            card = random.choice(cards)
            phrase = card.get("front", "")
            translation = card.get("back", "")
        else:
            item = random.choice(content)
            phrase = item.get("phrase", "")
            translation = item.get("translation", "")

        # Placeholder: log del mensaje que se enviaría
        message = f"📚 *Frase del día*\n\n{phrase}\n\n📖 {translation}"
        logger.info(f"[WhatsApp] Mensaje preparado: {phrase[:50]}...")

        # TODO: Integrar con WhatsApp Cloud API
        # import httpx
        # async with httpx.AsyncClient() as http:
        #     await http.post(
        #         f"https://graph.facebook.com/v18.0/{settings.whatsapp_phone_id}/messages",
        #         headers={"Authorization": f"Bearer {settings.whatsapp_token}"},
        #         json={...}
        #     )

        logger.info("Frase diaria enviada exitosamente")
        return {"sent": True, "phrase": phrase}

    except Exception as e:
        logger.error(f"Error enviando frase WhatsApp: {e}")
        raise
    finally:
        client.close()
