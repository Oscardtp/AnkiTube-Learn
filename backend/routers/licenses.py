import logging
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId

from database import get_db
from models.license import LicenseCreate, LicenseActivate, LicenseResponse, generate_license_code
from utils.auth import require_auth, require_superadmin

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/licenses", tags=["licenses"])


@router.post("/activate")
async def activate_license(
    payload: LicenseActivate,
    current_user: dict = Depends(require_auth),
):
    db = get_db()

    code = payload.code.upper().strip()
    license_doc = await db.licenses.find_one({"code": code})

    if not license_doc:
        raise HTTPException(
            status_code=404,
            detail="Código no válido. Verifica que lo escribiste correctamente.",
        )

    if license_doc["status"] == "revoked":
        raise HTTPException(
            status_code=410,
            detail="Este código fue revocado.",
        )

    if license_doc["status"] == "expired":
        raise HTTPException(
            status_code=410,
            detail="Este código ya expiró.",
        )

    if license_doc["status"] == "active":
        raise HTTPException(
            status_code=409,
            detail="Este código ya fue activado.",
        )

    expires_at = datetime.utcnow() + timedelta(days=license_doc["duration_days"])

    await db.licenses.update_one(
        {"_id": license_doc["_id"]},
        {
            "$set": {
                "status": "active",
                "activated_by": current_user["sub"],
                "expires_at": expires_at,
            }
        },
    )

    await db.users.update_one(
        {"_id": ObjectId(current_user["sub"])},
        {
            "$set": {
                "role": "tester",
                "tester_expires_at": expires_at,
            }
        },
    )

    logger.info(f"License activated: {code} by user {current_user['sub']} | expires: {expires_at}")

    return {
        "message": f"¡Código activado! Tienes acceso Tester por {license_doc['duration_days']} días.",
        "expires_at": expires_at.isoformat(),
        "role": "tester",
    }


@router.post("/admin", response_model=LicenseResponse, status_code=status.HTTP_201_CREATED)
async def create_license(
    payload: LicenseCreate,
    superadmin: dict = Depends(require_superadmin),
):
    db = get_db()

    max_attempts = 10
    for _ in range(max_attempts):
        code = generate_license_code()
        existing = await db.licenses.find_one({"code": code})
        if not existing:
            break
    else:
        raise HTTPException(
            status_code=500,
            detail="No se pudo generar un código único. Intenta de nuevo."
        )

    license_doc = {
        "code": code,
        "email": payload.email,
        "duration_days": payload.duration_days,
        "created_by": superadmin["sub"],
        "activated_by": None,
        "expires_at": None,
        "status": "pending",
        "internal_note": payload.internal_note,
        "created_at": datetime.utcnow(),
    }

    await db.licenses.insert_one(license_doc)
    logger.info(f"License created: {code} | duration: {payload.duration_days}d | by: {superadmin['sub']}")

    return LicenseResponse(
        code=code,
        status="pending",
        duration_days=payload.duration_days,
        expires_at=None,
        email=payload.email,
        internal_note=payload.internal_note,
    )


@router.get("/admin", response_model=list[LicenseResponse])
async def list_licenses(
    superadmin: dict = Depends(require_superadmin),
    status_filter: Optional[str] = None,
):
    db = get_db()

    query = {}
    if status_filter:
        query["status"] = status_filter

    cursor = db.licenses.find(query).sort("created_at", -1)
    licenses = []
    async for lic in cursor:
        licenses.append(LicenseResponse(
            code=lic["code"],
            status=lic["status"],
            duration_days=lic["duration_days"],
            expires_at=lic.get("expires_at"),
            email=lic.get("email"),
            internal_note=lic.get("internal_note"),
        ))

    return licenses


@router.delete("/admin/{code}")
async def revoke_license(
    code: str,
    superadmin: dict = Depends(require_superadmin),
):
    db = get_db()

    code = code.upper().strip()
    license_doc = await db.licenses.find_one({"code": code})

    if not license_doc:
        raise HTTPException(status_code=404, detail="Código no encontrado")

    if license_doc["status"] == "revoked":
        raise HTTPException(status_code=409, detail="Este código ya está revocado")

    await db.licenses.update_one(
        {"code": code},
        {"$set": {"status": "revoked"}},
    )

    if license_doc.get("activated_by"):
        await db.users.update_one(
            {"_id": ObjectId(license_doc["activated_by"]), "role": "tester"},
            {"$set": {"role": "user", "tester_expires_at": None}},
        )

    logger.info(f"License revoked: {code} by superadmin {superadmin['sub']}")
    return {"message": f"Licencia {code} revocada exitosamente"}