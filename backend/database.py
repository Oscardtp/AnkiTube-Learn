import pymongo
import pymongo.server_api
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from config import get_settings

settings = get_settings()

client: AsyncIOMotorClient = None
db: AsyncIOMotorDatabase = None


async def connect_db() -> None:
    global client, db
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_db]

    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.decks.create_index("user_id")
    await db.decks.create_index("anonymous_session_id")
    await db.licenses.create_index("code", unique=True)
    await db.content_reports.create_index("resource_id")
    await db.feedback.create_index([("deck_id", 1), ("moment", 1)])


async def disconnect_db() -> None:
    global client
    if client:
        client.close()


def get_db() -> AsyncIOMotorDatabase:
    if db is None:
        raise RuntimeError("Database not connected. Call connect_db() first.")
    return db