import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId

from database import get_db
from models.feedback import FeedbackCreate, FeedbackResponse
from utils.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/feedback", tags=["feedback"])

# Immediate response messages — rule: always respond to feedback
FEEDBACK_RESPONSES = {
    "🔥": "¡Qué bueno! Eso nos motiva a seguir mejorando 🎯",
    "Buenísimas": "¡Qué bueno! Eso nos motiva a seguir mejorando 🎯",
    "Bien": "Gracias por contarnos. Seguimos mejorando 💪",
    "Más o menos": "Anotado. Lo tenemos en cuenta para la próxima versión.",
    "No era lo que esperaba": "Anotado. Lo revisamos esta semana.",
    "Sí, varias": "¡Perfecto! Así funciona el aprendizaje en contexto 🎯",
    "Algunas": "Gracias. Seguimos afinando la selección de frases.",
    "Ninguna": "Anotado. Lo revisamos para mejorar la relevancia.",
    "Sí, reportarla": "Tarjeta marcada para revisión. Gracias por ayudarnos a mejorar.",
    "default_report": "Anotado. Lo revisamos esta semana.",
    "default_suggestion": "Buena idea. La tenemos en el radar.",
    "default_praise": "¡Gracias! Eso nos alegra mucho.",
    "default_nps": "Gracias por la honestidad. Eso nos ayuda mucho.",
    "default": "Gracias por contarnos. Lo tenemos en cuenta.",
}


def _get_response_message(feedback: FeedbackCreate) -> str:
    """Determine the immediate response message for the user."""
    if feedback.quick_answer in FEEDBACK_RESPONSES:
        return FEEDBACK_RESPONSES[feedback.quick_answer]

    if feedback.intent == "report":
        return FEEDBACK_RESPONSES["default_report"]
    if feedback.intent == "suggestion":
        return FEEDBACK_RESPONSES["default_suggestion"]
    if feedback.intent == "praise":
        return FEEDBACK_RESPONSES["default_praise"]
    if feedback.moment == "nps":
        return FEEDBACK_RESPONSES["default_nps"]

    return FEEDBACK_RESPONSES["default"]


@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def submit_feedback(
    payload: FeedbackCreate,
    current_user: Optional[dict] = Depends(get_current_user),
):
    """
    Submit feedback for any of the 5 moments.
    Public — anonymous users submit with anonymous_session_id.
    Anonymous feedback is the most valuable (shows what made users NOT register).
    """
    db = get_db()

    user_id = current_user["sub"] if current_user else None

    if payload.deck_id:
        try:
            ObjectId(payload.deck_id)
        except Exception:
            raise HTTPException(status_code=400, detail="deck_id inválido")

    feedback_doc = {
        "user_id": user_id,
        "deck_id": payload.deck_id,
        "card_id": payload.card_id,
        "moment": payload.moment,
        "section": payload.section,
        "intent": payload.intent,
        "quick_answer": payload.quick_answer,
        "follow_up": payload.follow_up,
        "text": payload.text,
        "anonymous_session_id": payload.anonymous_session_id if not user_id else None,
        "created_at": datetime.utcnow(),
    }

    result = await db.feedback.insert_one(feedback_doc)
    feedback_id = str(result.inserted_id)

    # If card was reported (Momento 3), flag it for superadmin review
    if payload.moment == "card_report" and payload.deck_id and payload.card_id:
        await _flag_card_for_review(db, payload.deck_id, payload.card_id)

    message = _get_response_message(payload)
    logger.info(f"Feedback received: {payload.moment} | user: {user_id or 'anonymous'}")

    return FeedbackResponse(id=feedback_id, message=message)


async def _flag_card_for_review(db, deck_id: str, card_id: str) -> None:
    """Mark a reported card for superadmin review."""
    try:
        await db.decks.update_one(
            {
                "_id": ObjectId(deck_id),
                "cards.keyword": card_id,
            },
            {"$set": {"cards.$.flagged_for_review": True}},
        )
    except Exception as e:
        logger.warning(f"Could not flag card for review: {e}")