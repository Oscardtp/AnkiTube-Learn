import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Depends, Request, Response
from bson import ObjectId

from database import get_db
from models.deck import GenerateRequest, GenerateResponse, DeckPreviewResponse, AddCardRequest, Card
from services.youtube_mock import get_transcript, transcript_to_text, is_english_content
from services.ai_router import generate_cards
from services.anki_service import generate_apkg
from services.audio_extractor import extract_audio_segments_batch, check_dependencies
from utils.auth import get_current_user, require_auth
from utils.freemium import has_exceeded_daily_limit, get_max_cards_for_role
from utils.rate_limit import limiter
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(prefix="/api/decks", tags=["decks"])


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

    # Step 1.5: Verify video is primarily in English
    is_english, detected_lang = is_english_content(transcript_data["transcript"])
    
    if not is_english:
        language_names = {
            "en": "Inglés",
            "es": "Español",
            "fr": "Francés",
            "de": "Alemán",
            "it": "Italiano",
            "pt": "Portugués",
            "ru": "Ruso",
            "ja": "Japonés",
            "ko": "Coreano",
            "zh": "Chino",
            "ar": "Árabe",
            "hi": "Hindi",
        }
        lang_name = language_names.get(detected_lang, detected_lang.upper())
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El video debe ser principalmente en inglés. Detectamos que este video está en {lang_name}.",
        )

    # Step 2: Generate cards via AI Router
    max_cards = get_max_cards_for_role(user_role)

    try:
        cards, model_used = await generate_cards(
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

    # Step 3: Extract audio segments for each card (Phase 1.5 feature)
    audio_files = {}
    try:
        # Check if yt-dlp and ffmpeg are available
        deps = check_dependencies()
        if deps.get("yt-dlp") and deps.get("ffmpeg"):
            # Prepare segments for batch extraction
            segments = []
            for i, card in enumerate(cards):
                segment_id = f"card_{i}"
                segments.append({
                    "id": segment_id,
                    "start": card.timestamp_start,
                    "end": card.timestamp_end,
                    "filename": f"card_{deck_id}_{i}.mp3",
                })

            # Extract all audio segments
            audio_paths = extract_audio_segments_batch(
                youtube_url=payload.youtube_url,
                segments=segments,
            )

            # Map audio files to cards and update audio_filename
            for i, card in enumerate(cards):
                segment_id = f"card_{i}"
                if segment_id in audio_paths:
                    card.audio_filename = f"card_{deck_id}_{i}.mp3"
                    audio_files[card.audio_filename] = audio_paths[segment_id]

            logger.info(f"Extracted {len(audio_files)} audio segments for deck {deck_id}")
        else:
            missing = [k for k, v in deps.items() if not v]
            logger.warning(f"Audio extraction skipped: missing dependencies: {missing}")
    except Exception as e:
        logger.warning(f"Audio extraction failed for deck {deck_id}: {e}")
        # Continue without audio - cards will still work

    # Step 4: Save deck to MongoDB
    deck_doc = {
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

    result = await db.decks.insert_one(deck_doc)
    deck_id = str(result.inserted_id)

    # Step 5: Update freemium counters for authenticated free users
    if user_id and user_doc:
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {"last_generation_date": datetime.utcnow()},
                "$inc": {"generations_today": 1},
            },
        )

    logger.info(f"Deck generated: {deck_id} | model: {model_used} | cards: {len(cards)} | user: {user_id or 'anonymous'} | audio: {len(audio_files)} files")

    return GenerateResponse(
        deck_id=deck_id,
        video_title=transcript_data["title"],
        video_thumbnail=transcript_data["thumbnail"],
        video_id=transcript_data["video_id"],
        cards=cards,
        model_used=model_used,
        total_cards=len(cards),
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
    deck_user_id = str(deck.get("user_id")) if deck.get("user_id") else None
    deck_anon_id = deck.get("anonymous_session_id")

    is_owner = (
        (user_id and deck_user_id and deck_user_id == user_id)
        or (anonymous_session_id and deck_anon_id and deck_anon_id == anonymous_session_id)
        or (not deck_user_id and not deck_anon_id)
    )

    if not is_owner:
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

    # Extract audio files if not already extracted (for decks created before audio feature)
    audio_files = {}
    cards_with_audio = False
    for card in cards:
        if card.audio_filename:
            cards_with_audio = True
            break

    # If no audio filenames, try to extract audio now
    if not cards_with_audio and deck.get("video_id"):
        try:
            deps = check_dependencies()
            if deps.get("yt-dlp") and deps.get("ffmpeg"):
                # Reconstruct YouTube URL from video_id (mock fallback)
                youtube_url = f"https://www.youtube.com/watch?v={deck['video_id']}"
                
                segments = []
                for i, card in enumerate(cards):
                    segment_id = f"card_{i}"
                    segments.append({
                        "id": segment_id,
                        "start": card.timestamp_start,
                        "end": card.timestamp_end,
                        "filename": f"card_{deck_id}_{i}.mp3",
                    })

                audio_paths = extract_audio_segments_batch(
                    youtube_url=youtube_url,
                    segments=segments,
                )

                for i, card in enumerate(cards):
                    segment_id = f"card_{i}"
                    if segment_id in audio_paths:
                        card.audio_filename = f"card_{deck_id}_{i}.mp3"
                        audio_files[card.audio_filename] = audio_paths[segment_id]

                logger.info(f"Extracted {len(audio_files)} audio segments for download: {deck_id}")
        except Exception as e:
            logger.warning(f"Audio extraction failed during download for deck {deck_id}: {e}")
            # Continue without audio

    try:
        apkg_bytes = generate_apkg(
            deck_id=deck_id,
            video_title=deck["video_title"],
            cards=cards,
            audio_files=audio_files if audio_files else None,
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