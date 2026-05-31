from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends, Request
from bson import ObjectId

from database import get_db
from models.user import UserCreate, UserLogin, TokenResponse, UserResponse
from utils.auth import hash_password, verify_password, create_access_token, require_auth
from utils.rate_limit import limiter

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, payload: UserCreate):
    db = get_db()

    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una cuenta con este correo",
        )

    user_doc = {
        "email": payload.email.lower(),
        "password": hash_password(payload.password),
        "role": "user",
        "tester_expires_at": None,
        "last_generation_date": None,
        "generations_today": 0,
        "setup_wizard_completed": False,
        "wizard_answers": None,
        "created_at": datetime.utcnow(),
        "deleted_at": None,
    }

    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    token = create_access_token(user_id, payload.email.lower(), "user")

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=payload.email.lower(),
            role="user",
            setup_wizard_completed=False,
            generations_today=0,
        ),
    )


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, payload: UserLogin):
    db = get_db()

    user = await db.users.find_one({"email": payload.email.lower(), "deleted_at": None})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
        )

    if not verify_password(payload.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
        )

    # Auto-downgrade expired tester licenses
    role = user["role"]
    if role == "tester" and user.get("tester_expires_at"):
        if datetime.utcnow() > user["tester_expires_at"]:
            role = "user"
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"role": "user", "tester_expires_at": None}},
            )

    user_id = str(user["_id"])
    token = create_access_token(user_id, user["email"], role)

    # Count user's decks and total cards
    total_decks = await db.decks.count_documents({"user_id": user_id, "deleted_at": None})
    pipeline = [
        {"$match": {"user_id": user_id, "deleted_at": None}},
        {"$project": {"card_count": {"$size": {"$ifNull": ["$cards", []]}}}},
        {"$group": {"_id": None, "total": {"$sum": "$card_count"}}},
    ]
    total_cards_result = await db.decks.aggregate(pipeline).to_list(1)
    total_cards = total_cards_result[0]["total"] if total_cards_result else 0

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=user["email"],
            role=role,
            setup_wizard_completed=user.get("setup_wizard_completed", False),
            generations_today=user.get("generations_today", 0),
            total_decks=total_decks,
            total_cards=total_cards,
            custom_name=user.get("custom_name"),
        ),
    )


@router.get("/me", response_model=UserResponse)
async def me(current_user: dict = Depends(require_auth)):
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(current_user["sub"]), "deleted_at": None})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Count user's decks and total cards
    total_decks = await db.decks.count_documents({"user_id": current_user["sub"], "deleted_at": None})

    # Aggregate total cards across all user decks
    pipeline = [
        {"$match": {"user_id": current_user["sub"], "deleted_at": None}},
        {"$project": {"card_count": {"$size": {"$ifNull": ["$cards", []]}}}},
        {"$group": {"_id": None, "total": {"$sum": "$card_count"}}},
    ]
    total_cards_result = await db.decks.aggregate(pipeline).to_list(1)
    total_cards = total_cards_result[0]["total"] if total_cards_result else 0

    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        role=user["role"],
        setup_wizard_completed=user.get("setup_wizard_completed", False),
        generations_today=user.get("generations_today", 0),
        total_decks=total_decks,
        total_cards=total_cards,
        custom_name=user.get("custom_name"),
    )