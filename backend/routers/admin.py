"""
Superadmin panel router.
2FA required on every request — TOTP-based with fallback to static code.
"""
import logging
from datetime import datetime, timedelta
from typing import Optional

import redis.asyncio as aioredis
from fastapi import APIRouter, HTTPException, status, Depends, Header, Request
from bson import ObjectId
from pydantic import BaseModel

from database import get_db
from utils.auth import (
    require_superadmin,
    generate_totp_secret,
    verify_totp,
    get_totp_uri,
)
from utils.rate_limit import limiter
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()
router = APIRouter(prefix="/api/admin", tags=["admin"])

# Redis keys
REDIS_ATTEMPTS = "admin:2fa:{user_id}:attempts"
REDIS_LOCKED = "admin:2fa:{user_id}:locked_until"
REDIS_SESSION = "admin:2fa:{user_id}:session"

MAX_ATTEMPTS = 5
LOCKOUT_SECONDS = 900  # 15 minutes
SESSION_TTL = 1800  # 30 minutes


def _get_redis() -> aioredis.Redis:
    return aioredis.from_url(settings.redis_url, decode_responses=True)


# ── Request / Response models ──────────────────────────────────────

class TwoFAVerifyRequest(BaseModel):
    code: str


class TwoFASetupResponse(BaseModel):
    secret: str
    uri: str
    message: str


class TwoFAStatusResponse(BaseModel):
    totp_enabled: bool
    totp_configured: bool


# ── Audit logging ──────────────────────────────────────────────────

async def _audit_log(
    user_id: str,
    action: str,
    target: str = "",
    ip: str = "",
    details: Optional[dict] = None,
) -> None:
    db = get_db()
    await db.admin_audit_log.insert_one({
        "user_id": user_id,
        "action": action,
        "target": target,
        "ip": ip,
        "details": details or {},
        "timestamp": datetime.utcnow(),
    })


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()
    return request.client.host if request.client else ""


# ── 2FA dependency ─────────────────────────────────────────────────

async def verify_2fa(
    request: Request,
    superadmin: dict = Depends(require_superadmin),
    x_2fa_code: Optional[str] = Header(None, alias="X-2FA-Code"),
) -> dict:
    """
    Verify 2FA on every superadmin request.
    - If TOTP is enabled → verify TOTP code with rate limiting.
    - Else → fallback to static 2FA code from env.
    Also enforces session timeout (30 min).
    """
    user_id = superadmin["sub"]
    r = _get_redis()

    # ── Session timeout ────────────────────────────────────────
    session_key = REDIS_SESSION.format(user_id=user_id)
    existing_session = await r.get(session_key)
    if existing_session is None:
        # First call or expired — create session, require 2FA
        needs_2fa = True
    else:
        # Session valid — check 2FA only if not already verified this session
        needs_2fa = existing_session == "pending"

    # Refresh session TTL
    await r.setex(session_key, SESSION_TTL, "pending")

    if not x_2fa_code:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Se requiere código 2FA para acceder al panel de administración",
        )

    # ── Check lockout ──────────────────────────────────────────
    locked_key = REDIS_LOCKED.format(user_id=user_id)
    locked_until = await r.get(locked_key)
    if locked_until:
        remaining = int(locked_until) - int(datetime.utcnow().timestamp())
        if remaining > 0:
            minutes = (remaining + 59) // 60
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Cuenta bloqueada temporalmente. Intenta de nuevo en {minutes} minuto(s).",
            )
        else:
            await r.delete(locked_key)
            await r.delete(REDIS_ATTEMPTS.format(user_id=user_id))

    # ── Determine verification method ──────────────────────────
    db = get_db()
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    totp_enabled = user_doc.get("totp_enabled", False) if user_doc else False

    if totp_enabled:
        totp_secret = user_doc.get("totp_secret", "")
        valid = verify_totp(totp_secret, x_2fa_code)
    else:
        # Fallback to static code
        valid = x_2fa_code == settings.superadmin_2fa_code

    if not valid:
        # Increment attempts
        attempts_key = REDIS_ATTEMPTS.format(user_id=user_id)
        attempts = await r.incr(attempts_key)
        await r.expire(attempts_key, LOCKOUT_SECONDS)

        if attempts >= MAX_ATTEMPTS:
            lock_until = int(datetime.utcnow().timestamp()) + LOCKOUT_SECONDS
            await r.setex(locked_key, LOCKOUT_SECONDS, str(lock_until))
            logger.warning(f"Admin 2FA lockout: user {user_id} after {attempts} attempts")
            await _audit_log(user_id, "2fa_lockout", ip=_client_ip(request))

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Código 2FA incorrecto",
        )

    # ── Success — clear attempts, mark session verified ────────
    await r.delete(REDIS_ATTEMPTS.format(user_id=user_id))
    await r.setex(session_key, SESSION_TTL, "verified")

    return superadmin


# ── 2FA management endpoints ───────────────────────────────────────

@router.post("/2fa/setup", response_model=TwoFASetupResponse)
async def setup_2fa(
    superadmin: dict = Depends(require_superadmin),
    request: Request = None,
):
    """Generate a new TOTP secret and return the provisioning URI."""
    user_id = superadmin["sub"]
    db = get_db()

    secret = generate_totp_secret()
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    email = user_doc.get("email", "admin@ankitube.com") if user_doc else "admin@ankitube.com"

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"totp_secret": secret, "totp_enabled": False}},
    )

    uri = get_totp_uri(secret, email)

    logger.info(f"TOTP secret generated for user {user_id}")
    await _audit_log(user_id, "2fa_setup", ip=_client_ip(request) if request else "")

    return TwoFASetupResponse(
        secret=secret,
        uri=uri,
        message="Escanea el código QR con tu aplicación de autenticación y verifica con /2fa/verify",
    )


@router.post("/2fa/verify")
async def verify_2fa_setup(
    body: TwoFAVerifyRequest,
    superadmin: dict = Depends(require_superadmin),
    request: Request = None,
):
    """Verify first TOTP code and enable 2FA."""
    user_id = superadmin["sub"]
    db = get_db()

    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    secret = user_doc.get("totp_secret")
    if not secret:
        raise HTTPException(
            status_code=400,
            detail="No hay un secreto TOTP configurado. Usa /2fa/setup primero.",
        )

    if not verify_totp(secret, body.code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Código TOTP inválido. Intenta de nuevo.",
        )

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"totp_enabled": True}},
    )

    logger.info(f"TOTP 2FA enabled for user {user_id}")
    await _audit_log(user_id, "2fa_enabled", ip=_client_ip(request) if request else "")

    return {"message": "2FA habilitado correctamente"}


@router.post("/2fa/rotate")
async def rotate_2fa(
    superadmin: dict = Depends(require_superadmin),
    request: Request = None,
):
    """Generate a new secret, invalidating the old one. Requires current TOTP."""
    user_id = superadmin["sub"]
    db = get_db()

    new_secret = generate_totp_secret()
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"totp_secret": new_secret, "totp_enabled": False}},
    )

    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    email = user_doc.get("email", "admin@ankitube.com") if user_doc else "admin@ankitube.com"
    uri = get_totp_uri(new_secret, email)

    logger.info(f"TOTP secret rotated for user {user_id}")
    await _audit_log(user_id, "2fa_rotate", ip=_client_ip(request) if request else "")

    return {
        "secret": new_secret,
        "uri": uri,
        "message": "Secreto rotado. Debes verificar con /2fa/verify para reactivar 2FA.",
    }


@router.get("/2fa/status", response_model=TwoFAStatusResponse)
async def get_2fa_status(
    superadmin: dict = Depends(require_superadmin),
):
    """Return whether 2FA is configured and enabled."""
    user_id = superadmin["sub"]
    db = get_db()

    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    totp_enabled = user_doc.get("totp_enabled", False) if user_doc else False
    totp_configured = bool(user_doc.get("totp_secret")) if user_doc else False

    return TwoFAStatusResponse(
        totp_enabled=totp_enabled,
        totp_configured=totp_configured,
    )


# ── Admin endpoints ────────────────────────────────────────────────

@router.get("/metrics")
async def get_metrics(
    superadmin: dict = Depends(verify_2fa),
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

    await _audit_log(superadmin["sub"], "view_metrics")

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
    superadmin: dict = Depends(verify_2fa),
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
    superadmin: dict = Depends(verify_2fa),
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
    superadmin: dict = Depends(verify_2fa),
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
    superadmin: dict = Depends(verify_2fa),
    request: Request = None,
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
    await _audit_log(
        superadmin["sub"],
        "update_role",
        target=user_id,
        ip=_client_ip(request) if request else "",
        details={"new_role": role},
    )

    return {"message": f"Rol actualizado a '{role}'", "user_id": user_id}
