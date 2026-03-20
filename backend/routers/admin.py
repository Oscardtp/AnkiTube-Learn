"""
Superadmin panel router.
2FA required on EVERY request — not just at login.
"""
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Depends, Header
from bson import ObjectId

from database import get_db
from utils.auth import require_superadmin
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()
router = APIRouter(prefix="/api/admin", tags=["admin"])


def verify_2fa(x_2fa_code: Optional[str] = Header(None, alias="X-2FA-Code")) -> None:
    """
    Verify 2FA code on every superadmin request.
    Passed as HTTP header: X-2FA-Code: <code>
    """
    if not x_2fa_code:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Se requiere código 2FA para acceder al panel de administración",
        )
    if x_2fa_code != settings.superadmin_2fa_code:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Código 2FA incorrecto",
        )


@router.get("/metrics")
async def get_metrics(
    superadmin: dict = Depends(require_superadmin),
    _: None = Depends(verify_2fa),
):
    db = get_db()

    total_users = await db.users.count_documents({"deleted_at": None})
    total_decks = await db.decks.count_documents({"deleted_at": None})
    total_feedback = await db.feedback.count_documents({})

    role_pipeline = [
        {"$match": {"deleted_at": None}},
        {"$group": {"_id": "$role", "count": {"$sum": 1}}},
    ]
    role_cursor = db.users.aggregate(role_pipeline)
    users_by_role = {doc["_id"]: doc["count"] async for doc in role_cursor}

    model_pipeline = [
        {"$match": {"deleted_at": None}},
        {"$group": {"_id": "$model_used", "count": {"$sum": 1}}},
    ]
    model_cursor = db.decks.aggregate(model_pipeline)
    decks_by_model = {doc["_id"]: doc["count"] async for doc in model_cursor}

    license_stats = {}
    for s in ["pending", "active", "expired", "revoked"]:
        license_stats[s] = await db.licenses.count_documents({"status": s})

    feedback_pipeline = [
        {"$group": {"_id": "$moment", "count": {"$sum": 1}}},
    ]
    feedback_cursor = db.feedback.aggregate(feedback_pipeline)
    feedback_by_moment = {doc["_id"]: doc["count"] async for doc in feedback_cursor}

    return {
        "total_users": total_users,
        "total_decks": total_decks,
        "total_feedback": total_feedback,
        "users_by_role": users_by_role,
        "decks_by_model": decks_by_model,
        "licenses": license_stats,
        "feedback_by_moment": feedback_by_moment,
    }


@router.get("/users")
async def list_users(
    superadmin: dict = Depends(require_superadmin),
    _: None = Depends(verify_2fa),
    page: int = 1,
    limit: int = 20,
    role: Optional[str] = None,
):
    db = get_db()

    query = {"deleted_at": None}
    if role:
        query["role"] = role

    skip = (page - 1) * limit
    total = await db.users.count_documents(query)

    cursor = db.users.find(
        query,
        {"password": 0},  # Never return hashed passwords
    ).sort("created_at", -1).skip(skip).limit(limit)

    users = []
    async for user in cursor:
        users.append({
            "id": str(user["_id"]),
            "email": user["email"],
            "role": user["role"],
            "generations_today": user.get("generations_today", 0),
            "tester_expires_at": user.get("tester_expires_at"),
            "created_at": user["created_at"].isoformat(),
        })

    return {"users": users, "total": total, "page": page, "limit": limit}


@router.get("/feedback")
async def list_feedback(
    superadmin: dict = Depends(require_superadmin),
    _: None = Depends(verify_2fa),
    moment: Optional[str] = None,
    intent: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
):
    db = get_db()

    query = {}
    if moment:
        query["moment"] = moment
    if intent:
        query["intent"] = intent

    skip = (page - 1) * limit
    total = await db.feedback.count_documents(query)

    cursor = db.feedback.find(query).sort("created_at", -1).skip(skip).limit(limit)

    items = []
    async for fb in cursor:
        items.append({
            "id": str(fb["_id"]),
            "user_id": fb.get("user_id"),
            "deck_id": fb.get("deck_id"),
            "moment": fb["moment"],
            "section": fb.get("section"),
            "intent": fb.get("intent"),
            "quick_answer": fb["quick_answer"],
            "follow_up": fb.get("follow_up"),
            "text": fb.get("text"),
            "created_at": fb["created_at"].isoformat(),
        })

    return {"feedback": items, "total": total, "page": page, "limit": limit}


@router.get("/flagged-cards")
async def get_flagged_cards(
    superadmin: dict = Depends(require_superadmin),
    _: None = Depends(verify_2fa),
):
    db = get_db()

    pipeline = [
        {"$match": {"deleted_at": None, "cards.flagged_for_review": True}},
        {"$unwind": "$cards"},
        {"$match": {"cards.flagged_for_review": True}},
        {
            "$project": {
                "deck_id": {"$toString": "$_id"},
                "video_title": 1,
                "level": 1,
                "card": "$cards",
            }
        },
    ]

    flagged = []
    async for doc in db.decks.aggregate(pipeline):
        flagged.append({
            "deck_id": doc["deck_id"],
            "video_title": doc["video_title"],
            "level": doc["level"],
            "card_front": doc["card"]["front"],
            "card_back": doc["card"]["back"],
            "keyword": doc["card"]["keyword"],
        })

    return {"flagged_cards": flagged, "total": len(flagged)}


@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str,
    superadmin: dict = Depends(require_superadmin),
    _: None = Depends(verify_2fa),
):
    db = get_db()

    valid_roles = ["user", "premium", "tester", "superadmin"]
    if role not in valid_roles:
        raise HTTPException(
            status_code=400,
            detail=f"Rol inválido. Opciones: {valid_roles}"
        )

    try:
        obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="user_id inválido")

    result = await db.users.update_one(
        {"_id": obj_id, "deleted_at": None},
        {"$set": {"role": role}},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    logger.info(f"Role updated: user {user_id} → {role} by superadmin {superadmin['sub']}")
    return {"message": f"Rol actualizado a '{role}'", "user_id": user_id}