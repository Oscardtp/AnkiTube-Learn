import json
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from config import get_settings


async def seed():
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_db]

    with open("seed/curated_videos.json", encoding="utf-8") as f:
        videos = json.load(f)

    for video in videos:
        await db.curated_videos.update_one(
            {"video_id": video["video_id"]},
            {"$set": video},
            upsert=True,
        )

    print(f"Seeded {len(videos)} curated videos")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
