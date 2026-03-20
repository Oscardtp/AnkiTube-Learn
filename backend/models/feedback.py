from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class FeedbackCreate(BaseModel):
    deck_id: Optional[str] = None
    card_id: Optional[str] = None
    moment: Literal["post_generation", "post_study", "card_report", "general", "nps"]
    section: Optional[Literal["generator", "cards", "study", "pricing", "other"]] = None
    intent: Optional[Literal["report", "suggestion", "praise"]] = None
    quick_answer: str
    follow_up: Optional[str] = None
    text: Optional[str] = None
    anonymous_session_id: Optional[str] = None


class FeedbackInDB(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: Optional[str] = None
    deck_id: Optional[str] = None
    card_id: Optional[str] = None
    moment: str
    section: Optional[str] = None
    intent: Optional[str] = None
    quick_answer: str
    follow_up: Optional[str] = None
    text: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class FeedbackResponse(BaseModel):
    id: str
    message: str  # immediate response to the user