import asyncio
import json
import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Depends, Request, Response
from fastapi.responses import FileResponse, StreamingResponse
from bson import ObjectId

from database import get_db
from models.deck import GenerateRequest, GenerateResponse, DeckPreviewResponse, AddCardRequest, Card
from services.ai_router import generate_cards
from services.card_pipeline import CardPipeline
from services.anki_service import generate_apkg
from services.audio_service import get_audio_clip
from utils.auth import get_current_user, require_auth
from utils.freemium import has_exceeded_daily_limit, get_max_cards_for_role, update_generation_counter
from utils.rate_limit import limiter
from config import get_settings

settings = get_settings()

from services.youtube_real import get_transcript, transcript_to_text, match_cards_to_transcript

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/decks", tags=["decks"])


def _verify_deck_ownership(
    deck: dict,
    user_id: Optional[str],
    anonymous_session_id: Optional[str],
) -> bool:
    """Check if the current user owns the deck."""
    deck_user_id = str(deck.get("user_id")) if deck.get("user_id") else None
    deck_anon_id = deck.get("anonymous_session_id")

    return (
        (user_id and deck_user_id and deck_user_id == user_id)
        or (anonymous_session_id and deck_anon_id and deck_anon_id == anonymous_session_id)
        or (not deck_user_id and not deck_anon_id)
    )


@router.post("/generate", response_model=GenerateResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def generate_deck(
    request: Request,
    payload: GenerateRequest,
    current_user: Optional[dict] = Depends(get_current_user),
):
    db = get_db()

    user_role = "user"
    user_id = None
    user_doc = None

    if current_user:
        user_id = current_user["sub"]
        user_role = current_user.get("role", "user")
        user_doc = await db.users.find_one({"_id": ObjectId(user_id), "deleted_at": None})

        if user_doc and has_exceeded_daily_limit(user_doc):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Ya generaste tu mazo del día. Vuelve mañana o mejora tu plan para generar sin límites.",
            )

    # Step 1: Get transcript
    try:
        transcript_data = get_transcript(payload.youtube_url, payload.context)
    except Exception as e:
        logger.error(f"Transcript extraction failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No pudimos procesar ese video. Verifica que la URL sea válida y el video tenga subtítulos.",
        )

    transcript_text = transcript_to_text(transcript_data["transcript"])

    if not transcript_text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Este video no tiene subtítulos disponibles.",
        )

    # Step 2: Generate cards via CardPipeline
    max_cards = get_max_cards_for_role(user_role)

    try:
        pipeline = CardPipeline()
        cards, model_used = await pipeline.run(
            transcript=transcript_data["transcript"],
            transcript_text=transcript_text,
            level=payload.level,
            context=payload.context,
            user_role=user_role,
            max_cards=max_cards,
        )
    except RuntimeError as e:
        logger.error(f"AI generation failed for all providers: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="El servicio de IA no está disponible en este momento. Intenta de nuevo en unos minutos.",
        )

    if not cards:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No se pudieron generar tarjetas para este video. Intenta con otro nivel o video.",
        )

    # Step 2.5: Assign real timestamps from transcript
    cards = match_cards_to_transcript(cards, transcript_data["transcript"])

    # Step 3: Save deck to MongoDB with pre-generated ObjectId and audio clips
    deck_id_obj = ObjectId()
    deck_id = str(deck_id_obj)

    # Download and slice audio for each card (parallelized)
    async def _generate_clip(idx: int, card):
        filename = f"deck_{deck_id}_card_{idx}_{int(card.timestamp_start)}_{int(card.timestamp_end)}.mp3"
        card.audio_filename = filename
        try:
            await get_audio_clip(
                transcript_data["video_id"],
                card.timestamp_start,
                card.timestamp_end,
                filename
            )
        except Exception as ae:
            logger.error(f"Failed to generate audio clip for card {idx} in generate_deck: {ae}")
            card.audio_filename = ""

    await asyncio.gather(*[_generate_clip(idx, card) for idx, card in enumerate(cards)])

    deck_doc = {
        "_id": deck_id_obj,
        "user_id": user_id,
        "anonymous_session_id": payload.anonymous_session_id if not user_id else None,
        "video_id": transcript_data["video_id"],
        "video_title": transcript_data["title"],
        "video_thumbnail": transcript_data["thumbnail"],
        "level": payload.level,
        "context": payload.context,
        "cards": [card.model_dump() for card in cards],
        "model_used": model_used,
        "created_at": datetime.utcnow(),
        "deleted_at": None,
    }

    await db.decks.insert_one(deck_doc)

    # Step 4: Update freemium counters for authenticated free users
    if user_id and user_doc:
        await update_generation_counter(db, user_id, user_doc)

    logger.info(f"Deck generated: {deck_id} | model: {model_used} | cards: {len(cards)} | user: {user_id or 'anonymous'}")

    return GenerateResponse(
        deck_id=deck_id,
        video_title=transcript_data["title"],
        video_thumbnail=transcript_data["thumbnail"],
        video_id=transcript_data["video_id"],
        level=payload.level,
        context=payload.context,
        cards=cards,
        model_used=model_used,
        total_cards=len(cards),
    )


@router.post("/generate-stream", status_code=status.HTTP_200_OK)
@limiter.limit("10/minute")
async def generate_deck_stream(
    request: Request,
    payload: GenerateRequest,
    current_user: Optional[dict] = Depends(get_current_user),
):
    """
    SSE endpoint for deck generation with real-time progress events.
    Returns a stream of Server-Sent Events as the generation progresses.
    """
    db = get_db()

    user_role = "user"
    user_id = None
    user_doc = None

    if current_user:
        user_id = current_user["sub"]
        user_role = current_user.get("role", "user")
        user_doc = await db.users.find_one({"_id": ObjectId(user_id), "deleted_at": None})

        if user_doc and has_exceeded_daily_limit(user_doc):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Ya generaste tu mazo del día. Vuelve mañana o mejora tu plan para generar sin límites.",
            )

    async def event_generator():
        def sse_event(event_name: str, data: dict) -> str:
            return f"event: {event_name}\ndata: {json.dumps(data)}\n\n"

        # Step 1: Transcript extraction
        yield sse_event("transcript_started", {"phase": "transcript", "status": "started"})

        try:
            loop = asyncio.get_event_loop()
            transcript_data = await loop.run_in_executor(
                None, lambda: get_transcript(payload.youtube_url, payload.context)
            )
        except Exception as e:
            logger.error(f"Transcript extraction failed: {e}")
            yield sse_event("generation_error", {
                "phase": "transcript",
                "status": "error",
                "detail": "No pudimos procesar ese video. Verifica que la URL sea válida y el video tenga subtítulos.",
            })
            return

        transcript_text = transcript_to_text(transcript_data["transcript"])

        if not transcript_text.strip():
            yield sse_event("generation_error", {
                "phase": "transcript",
                "status": "error",
                "detail": "Este video no tiene subtítulos disponibles.",
            })
            return

        yield sse_event("transcript_complete", {
            "phase": "transcript",
            "status": "complete",
            "video_title": transcript_data["title"],
            "video_id": transcript_data["video_id"],
            "video_thumbnail": transcript_data["thumbnail"],
            "transcript_entries": len(transcript_data["transcript"]),
        })

        # Step 2: AI generation with SSE callback
        max_cards = get_max_cards_for_role(user_role)
        ai_events = []

        async def on_ai_event(event_name, event_data):
            ai_events.append((event_name, event_data))

        try:
            pipeline = CardPipeline()
            cards, model_used = await pipeline.run(
                transcript=transcript_data["transcript"],
                transcript_text=transcript_text,
                level=payload.level,
                context=payload.context,
                user_role=user_role,
                max_cards=max_cards,
                on_event=on_ai_event,
            )
        except RuntimeError as e:
            logger.error(f"AI generation failed for all providers: {e}")
            yield sse_event("generation_error", {
                "phase": "ai",
                "status": "error",
                "detail": "El servicio de IA no está disponible en este momento. Intenta de nuevo en unos minutos.",
            })
            return

        if not cards:
            yield sse_event("generation_error", {
                "phase": "ai",
                "status": "error",
                "detail": "No se pudieron generar tarjetas para este video. Intenta con otro nivel o video.",
            })
            return

        # Emit buffered AI events
        for event_name, event_data in ai_events:
            yield sse_event(event_name, event_data)

        # Step 2.5: Assign real timestamps from transcript
        cards = match_cards_to_transcript(cards, transcript_data["transcript"])

        # Step 3: Save deck to MongoDB
        yield sse_event("deck_saving", {"phase": "save", "status": "started"})

        deck_id_obj = ObjectId()
        deck_id = str(deck_id_obj)

        # Download and slice audio for each card (parallelized)
        async def _generate_clip_stream(idx: int, card):
            filename = f"deck_{deck_id}_card_{idx}_{int(card.timestamp_start)}_{int(card.timestamp_end)}.mp3"
            card.audio_filename = filename
            try:
                await get_audio_clip(
                    transcript_data["video_id"],
                    card.timestamp_start,
                    card.timestamp_end,
                    filename
                )
            except Exception as ae:
                logger.error(f"Failed to generate audio clip for card {idx} in generate_deck_stream: {ae}")
                card.audio_filename = ""

        await asyncio.gather(*[_generate_clip_stream(idx, card) for idx, card in enumerate(cards)])

        deck_doc = {
            "_id": deck_id_obj,
            "user_id": user_id,
            "anonymous_session_id": payload.anonymous_session_id if not user_id else None,
            "video_id": transcript_data["video_id"],
            "video_title": transcript_data["title"],
            "video_thumbnail": transcript_data["thumbnail"],
            "level": payload.level,
            "context": payload.context,
            "cards": [card.model_dump() for card in cards],
            "model_used": model_used,
            "created_at": datetime.utcnow(),
            "deleted_at": None,
        }

        await db.decks.insert_one(deck_doc)

        yield sse_event("deck_saved", {"phase": "save", "status": "complete", "deck_id": deck_id})

        # Step 4: Update freemium counters
        if user_id and user_doc:
            await update_generation_counter(db, user_id, user_doc)

        logger.info(f"Deck generated: {deck_id} | model: {model_used} | cards: {len(cards)} | user: {user_id or 'anonymous'}")

        # Final event with full payload
        yield sse_event("generation_complete", {
            "phase": "complete",
            "status": "done",
            "deck_id": deck_id,
            "video_title": transcript_data["title"],
            "video_thumbnail": transcript_data["thumbnail"],
            "video_id": transcript_data["video_id"],
            "level": payload.level,
            "context": payload.context,
            "cards": [card.model_dump() for card in cards],
            "model_used": model_used,
            "total_cards": len(cards),
        })

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/user/my-decks")
async def my_decks(current_user: dict = Depends(require_auth)):
    db = get_db()

    cursor = db.decks.find(
        {"user_id": current_user["sub"], "deleted_at": None},
        {"cards": 0},
    ).sort("created_at", -1)

    decks = []
    async for deck in cursor:
        decks.append({
            "deck_id": str(deck["_id"]),
            "video_title": deck["video_title"],
            "video_thumbnail": deck["video_thumbnail"],
            "video_id": deck["video_id"],
            "level": deck["level"],
            "context": deck["context"],
            "total_cards": len(deck.get("cards", [])),
            "model_used": deck["model_used"],
            "created_at": deck["created_at"].isoformat(),
        })

    return {"decks": decks, "total": len(decks)}


@router.get("/{deck_id}", response_model=DeckPreviewResponse)
async def get_deck(
    deck_id: str,
    current_user: Optional[dict] = Depends(get_current_user),
    anonymous_session_id: Optional[str] = None,
):
    db = get_db()

    try:
        obj_id = ObjectId(deck_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de mazo inválido")

    deck = await db.decks.find_one({"_id": obj_id, "deleted_at": None})

    if not deck:
        raise HTTPException(status_code=404, detail="Mazo no encontrado")

    user_id = current_user["sub"] if current_user else None
    if not _verify_deck_ownership(deck, user_id, anonymous_session_id):
        raise HTTPException(status_code=403, detail="No tienes acceso a este mazo")

    cards = [Card(**c) for c in deck.get("cards", [])]

    return DeckPreviewResponse(
        deck_id=deck_id,
        video_id=deck["video_id"],
        video_title=deck["video_title"],
        video_thumbnail=deck["video_thumbnail"],
        level=deck["level"],
        context=deck["context"],
        cards=cards,
        model_used=deck["model_used"],
        total_cards=len(cards),
    )


@router.get("/{deck_id}/download")
async def download_deck(
    deck_id: str,
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

    deck_user_id = str(deck.get("user_id")) if deck.get("user_id") else None
    if deck_user_id != current_user["sub"]:
        raise HTTPException(status_code=403, detail="No tienes acceso a este mazo")

    cards = [Card(**c) for c in deck.get("cards", [])]

    try:
        apkg_bytes = generate_apkg(
            deck_id=deck_id,
            video_title=deck["video_title"],
            cards=cards,
        )
    except Exception as e:
        logger.error(f"APKG generation failed for deck {deck_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error al generar el archivo Anki. Intenta de nuevo.",
        )

    safe_title = "".join(c for c in deck["video_title"] if c.isalnum() or c in " -_")[:40]
    filename = f"AnkiTube_{safe_title}.apkg"

    return Response(
        content=apkg_bytes,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{deck_id}/audio/{card_index}")
async def get_card_audio(
    deck_id: str,
    card_index: int,
    current_user: dict = Depends(require_auth),
):
    """Serve audio clip for a specific card."""
    db = get_db()

    try:
        obj_id = ObjectId(deck_id)
    except Exception:
        raise HTTPException(status_code=400, detail="deck_id inválido")

    deck = await db.decks.find_one({"_id": obj_id, "deleted_at": None})
    if not deck:
        raise HTTPException(status_code=404, detail="Mazo no encontrado")

    # Check ownership
    if deck.get("user_id") != current_user["sub"]:
        raise HTTPException(status_code=403, detail="No tienes acceso a este mazo")

    if card_index < 0 or card_index >= len(deck.get("cards", [])):
        raise HTTPException(status_code=400, detail="Índice de tarjeta inválido")

    card = deck["cards"][card_index]
    filename = card.get("audio_filename")
    if not filename:
        filename = f"deck_{deck_id}_card_{card_index}_{int(card['timestamp_start'])}_{int(card['timestamp_end'])}.mp3"

    try:
        clip_path = await get_audio_clip(
            deck["video_id"],
            card["timestamp_start"],
            card["timestamp_end"],
            filename
        )
        return FileResponse(
            path=str(clip_path),
            media_type="audio/mpeg",
            filename=filename
        )
    except Exception as e:
        logger.error(f"Audio extraction failed for deck {deck_id}, card {card_index}: {e}")
        raise HTTPException(status_code=500, detail="Error al extraer audio")


@router.post("/{deck_id}/cards/add", response_model=Card)
async def add_card(
    deck_id: str,
    payload: AddCardRequest,
    current_user: Optional[dict] = Depends(get_current_user),
    anonymous_session_id: Optional[str] = None,
):
    db = get_db()

    try:
        obj_id = ObjectId(deck_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de mazo inválido")

    deck = await db.decks.find_one({"_id": obj_id, "deleted_at": None})
    if not deck:
        raise HTTPException(status_code=404, detail="Mazo no encontrado")

    # Verify ownership
    user_id = current_user["sub"] if current_user else None
    if not _verify_deck_ownership(deck, user_id, anonymous_session_id):
        raise HTTPException(status_code=403, detail="No tienes acceso a este mazo")

    if not payload.phrase and not payload.timestamp:
        raise HTTPException(
            status_code=400,
            detail="Debes proporcionar la frase o el minuto del video",
        )

    user_role = current_user.get("role", "user") if current_user else "user"
    phrase_text = payload.phrase or f"[timestamp: {payload.timestamp}]"

    try:
        cards, model_used = await generate_cards(
            transcript_text=phrase_text,
            level=deck["level"],
            context=deck["context"],
            user_role=user_role,
            max_cards=1,
        )
    except RuntimeError as e:
        logger.error(f"Card add failed: {e}")
        raise HTTPException(
            status_code=503,
            detail="No se pudo generar la tarjeta. Intenta de nuevo.",
        )

    if not cards:
        raise HTTPException(
            status_code=422,
            detail="No se pudo generar una tarjeta para esa frase.",
        )

    new_card = cards[0]

    await db.decks.update_one(
        {"_id": obj_id},
        {"$push": {"cards": new_card.model_dump()}},
    )

    return new_card


@router.post("/{deck_id}/claim")
async def claim_deck(
    deck_id: str,
    current_user: dict = Depends(require_auth),
    anonymous_session_id: Optional[str] = None,
):
    db = get_db()

    try:
        obj_id = ObjectId(deck_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de mazo inválido")

    deck = await db.decks.find_one({"_id": obj_id, "deleted_at": None})
    if not deck:
        raise HTTPException(status_code=404, detail="Mazo no encontrado")

    if deck.get("user_id"):
        raise HTTPException(status_code=409, detail="Este mazo ya tiene dueño")

    if anonymous_session_id and deck.get("anonymous_session_id") != anonymous_session_id:
        raise HTTPException(status_code=403, detail="No tienes acceso a este mazo")

    await db.decks.update_one(
        {"_id": obj_id},
        {"$set": {"user_id": current_user["sub"], "anonymous_session_id": None}},
    )

    return {"message": "Mazo transferido exitosamente", "deck_id": deck_id}


@router.delete("/{deck_id}")
async def delete_deck(
    deck_id: str,
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

    await db.decks.update_one(
        {"_id": obj_id},
        {"$set": {"deleted_at": datetime.utcnow()}},
    )

    return {"message": "Mazo eliminado"}