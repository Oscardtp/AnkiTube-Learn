import logging
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId

from database import get_db
from models.study import (
    StudySessionRequest,
    StudyStatusResponse,
    StudySessionStats,
    StudyCardResponse,
)
from utils.auth import get_current_user, require_auth

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/decks", tags=["study"])


def calculate_sm2(card: dict, quality: int) -> dict:
    """
    SM-2 algorithm implementation.
    quality: 0=Again, 2=Hard, 4=Good, 5=Easy
    Returns updated sm2 data dict.
    """
    if quality < 0 or quality > 5:
        return card.get("sm2_data", {"interval": 0, "easiness": 2.5, "reps": 0})

    sm2 = card.get("sm2_data") or {"interval": 0, "easiness": 2.5, "reps": 0}

    if quality >= 3:  # correct
        if sm2["reps"] == 0:
            sm2["interval"] = 1
        elif sm2["reps"] == 1:
            sm2["interval"] = 6
        else:
            sm2["interval"] = sm2["interval"] * sm2["easiness"]
        sm2["reps"] += 1
    else:  # incorrect
        sm2["reps"] = 0
        sm2["interval"] = 0

    sm2["easiness"] = sm2["easiness"] + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if sm2["easiness"] < 1.3:
        sm2["easiness"] = 1.3

    sm2["due_date"] = datetime.utcnow() + timedelta(days=sm2["interval"])
    sm2["last_reviewed"] = datetime.utcnow()

    return sm2


def _is_due(card: dict) -> bool:
    """Check if a card is due for review."""
    sm2 = card.get("sm2_data")
    if not sm2:
        return True  # new card, always due
    due_date = sm2.get("due_date")
    if not due_date:
        return True
    if isinstance(due_date, str):
        due_date = datetime.fromisoformat(due_date)
    return due_date <= datetime.utcnow()


@router.patch("/{deck_id}/study-results")
async def submit_study_results(
    deck_id: str,
    payload: StudySessionRequest,
    current_user: dict = Depends(require_auth),
):
    db = get_db()

    try:
        obj_id = ObjectId(deck_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de mazo inválido")

    deck = await db.decks.find_one({"_id": obj_id, "deleted_at": None})
    if not deck:
        raise HTTPException(status_code=404, detail="Mazo no encontrado")

    if str(deck.get("user_id")) != current_user["sub"]:
        raise HTTPException(status_code=403, detail="No tienes acceso a este mazo")

    cards = deck.get("cards", [])
    result_map = {r.card_id: r.quality for r in payload.results}

    for i, card in enumerate(cards):
        card_key = str(i)
        if card_key in result_map:
            quality = result_map[card_key]
            cards[i]["sm2_data"] = calculate_sm2(card, quality)

    # Update streak
    today = datetime.utcnow().strftime("%Y-%m-%d")
    study_history = deck.get("study_history", [])
    today_entry = next((h for h in study_history if h.get("date") == today), None)

    if today_entry:
        today_entry["sessions"] = today_entry.get("sessions", 0) + 1
        today_entry["cards_reviewed"] = today_entry.get("cards_reviewed", 0) + len(payload.results)
    else:
        study_history.append({
            "date": today,
            "sessions": 1,
            "cards_reviewed": len(payload.results),
        })

    # Calculate streak
    streak = 0
    check_date = datetime.utcnow().date()
    history_dates = {h["date"] for h in study_history}

    while True:
        if check_date.strftime("%Y-%m-%d") in history_dates:
            streak += 1
            check_date -= timedelta(days=1)
        else:
            break

    await db.decks.update_one(
        {"_id": obj_id},
        {
            "$set": {
                "cards": cards,
                "study_history": study_history,
                "streak_days": streak,
                "last_studied": datetime.utcnow(),
            }
        },
    )

    return {"message": "Resultados guardados", "streak_days": streak}


@router.get("/{deck_id}/study-status", response_model=StudyStatusResponse)
async def get_study_status(
    deck_id: str,
    current_user: Optional[dict] = Depends(get_current_user),
):
    db = get_db()

    try:
        obj_id = ObjectId(deck_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de mazo inválido")

    deck = await db.decks.find_one({"_id": obj_id, "deleted_at": None})
    if not deck:
        raise HTTPException(status_code=404, detail="Mazo no encontrado")

    cards = deck.get("cards", [])
    due_cards = [i for i, c in enumerate(cards) if _is_due(c)]
    new_cards = sum(1 for c in cards if not c.get("sm2_data"))
    review_cards = len(due_cards) - new_cards if len(due_cards) > new_cards else 0

    study_cards = []
    for i in due_cards:
        c = cards[i]
        study_cards.append(StudyCardResponse(
            card_index=i,
            front=c["front"],
            back=c["back"],
            keyword=c["keyword"],
            grammar_note=c.get("grammar_note", ""),
            context_note=c.get("context_note", ""),
            colombian_note=c.get("colombian_note", ""),
            timestamp_start=c.get("timestamp_start", 0),
            timestamp_end=c.get("timestamp_end", 0),
            audio_filename=c.get("audio_filename", ""),
            card_type=c.get("card_type", "vocabulary"),
            sm2_data=c.get("sm2_data"),
        ))

    return StudyStatusResponse(
        deck_id=deck_id,
        video_title=deck.get("video_title", ""),
        video_id=deck.get("video_id", ""),
        total_cards=len(cards),
        due_cards=len(due_cards),
        new_cards=new_cards,
        review_cards=review_cards,
        streak_days=deck.get("streak_days", 0),
        last_studied=deck.get("last_studied"),
        cards=study_cards,
    )


@router.get("/{deck_id}/study-summary", response_model=StudySessionStats)
async def get_study_summary(
    deck_id: str,
    current_user: Optional[dict] = Depends(get_current_user),
):
    db = get_db()

    try:
        obj_id = ObjectId(deck_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de mazo inválido")

    deck = await db.decks.find_one({"_id": obj_id, "deleted_at": None})
    if not deck:
        raise HTTPException(status_code=404, detail="Mazo no encontrado")

    today = datetime.utcnow().strftime("%Y-%m-%d")
    study_history = deck.get("study_history", [])
    today_entry = next((h for h in study_history if h.get("date") == today), None)

    cards = deck.get("cards", [])
    recent_cards = [
        c for c in cards
        if c.get("sm2_data") and c["sm2_data"].get("last_reviewed")
    ]

    again_count = sum(1 for c in recent_cards if c.get("sm2_data", {}).get("reps", 0) == 0)
    total = len(recent_cards) or 1

    return StudySessionStats(
        total_reviewed=today_entry.get("cards_reviewed", 0) if today_entry else 0,
        again_count=again_count,
        hard_count=0,
        good_count=0,
        easy_count=0,
        avg_quality=0.0,
        session_duration_seconds=0,
        streak_days=deck.get("streak_days", 0),
    )
