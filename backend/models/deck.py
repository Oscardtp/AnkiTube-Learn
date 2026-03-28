from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import datetime
import re


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
    youtube_url: str = Field(..., max_length=500)
    level: Literal["A1", "A2", "B1", "B2", "C1", "C2"]
    context: str = Field(default="general", max_length=100)
    anonymous_session_id: Optional[str] = Field(None, max_length=100)

    @field_validator("youtube_url")
    @classmethod
    def validate_youtube_url(cls, v: str) -> str:
        """Validate that URL is a valid YouTube URL."""
        patterns = [
            r"(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)",
            r"youtube\.com\/shorts\/([^&\n?#]+)",
        ]
        if not any(re.search(pattern, v) for pattern in patterns):
            raise ValueError("URL debe ser un enlace válido de YouTube")
        return v


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