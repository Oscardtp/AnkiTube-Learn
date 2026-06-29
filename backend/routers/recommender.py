from fastapi import APIRouter, Query
from typing import Optional

from database import get_db

router = APIRouter(prefix="/api/discover", tags=["discover"])


@router.get("/videos")
async def list_curated_videos(
    tag: Optional[str] = None,
    level: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
):
    """List curated videos, optionally filtered by tag and level."""
    db = get_db()

    query: dict = {"is_active": True}
    if tag:
        query["tags"] = {"$in": [tag]}
    if level:
        query["level"] = level

    skip = (page - 1) * limit
    total = await db.curated_videos.count_documents(query)

    cursor = db.curated_videos.find(query).sort("created_at", -1).skip(skip).limit(limit)

    videos = []
    async for video in cursor:
        videos.append({
            "id": str(video["_id"]),
            "video_id": video["video_id"],
            "title": video["title"],
            "thumbnail": video["thumbnail"],
            "channel": video["channel"],
            "duration_seconds": video["duration_seconds"],
            "tags": video["tags"],
            "level": video["level"],
            "description": video.get("description"),
        })

    return {"videos": videos, "total": total, "page": page, "limit": limit}


@router.get("/tags")
async def list_tags():
    """Get all available tags with counts."""
    db = get_db()

    pipeline = [
        {"$match": {"is_active": True}},
        {"$unwind": "$tags"},
        {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]

    tags = []
    async for doc in db.curated_videos.aggregate(pipeline):
        tags.append({"name": doc["_id"], "count": doc["count"]})

    return {"tags": tags}
