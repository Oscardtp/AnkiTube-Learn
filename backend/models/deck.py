from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class Card(BaseModel):
    front: str
    back: str
    keyword: str
    grammar_note: str
    context_note: str
    colombian_note: str  # REQUIRED — real Colombian equivalent
    timestamp_start: float
    timestamp_end: float
    audio_filename: str = ""
    card_type: Literal["vocabulary", "phrase", "idiom", "grammar_pattern"]


class DeckInDB(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: Optional[str] = None  # null if anonymous
    anonymous_session_id: Optional[str] = None
    video_id: str
    video_title: str
    video_thumbnail: str
    level: str  # CEFR: A1, A2, B1, B2, C1, C2
    context: str  # general, bpo, developers, etc.
    cards: list[Card] = []
    model_used: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None

    class Config:
        populate_by_name = True


class GenerateRequest(BaseModel):
    youtube_url: str
    level: Literal["A1", "A2", "B1", "B2", "C1", "C2"]
    context: str = "general"
    anonymous_session_id: Optional[str] = None


class GenerateResponse(BaseModel):
    deck_id: str
    video_title: str
    video_thumbnail: str
    video_id: str
    cards: list[Card]
    model_used: str
    total_cards: int


class DeckPreviewResponse(BaseModel):
    deck_id: str
    video_id: str
    video_title: str
    video_thumbnail: str
    level: str
    context: str
    cards: list[Card]
    model_used: str
    total_cards: int


class AddCardRequest(BaseModel):
    phrase: Optional[str] = None
    timestamp: Optional[str] = None  # format "2:34"