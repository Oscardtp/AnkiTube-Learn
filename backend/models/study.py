from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class StudyResult(BaseModel):
    card_id: str
    quality: int  # 0=Again, 2=Hard, 4=Good, 5=Easy
    reviewed_at: datetime = Field(default_factory=datetime.utcnow)


class StudySessionRequest(BaseModel):
    deck_id: str
    results: list[StudyResult]
    session_duration_seconds: int


class SM2Data(BaseModel):
    interval: float = 0  # days until next review
    easiness: float = 2.5  # easiness factor
    reps: int = 0  # consecutive correct reps
    due_date: Optional[datetime] = None
    last_reviewed: Optional[datetime] = None


class StudyCardResponse(BaseModel):
    card_index: int
    front: str
    back: str
    keyword: str
    grammar_note: str
    context_note: str
    colombian_note: str
    timestamp_start: float
    timestamp_end: float
    audio_filename: str = ""
    card_type: str
    sm2_data: Optional[dict] = None


class StudyStatusResponse(BaseModel):
    deck_id: str
    video_title: str
    video_id: str = ""
    total_cards: int
    due_cards: int
    new_cards: int
    review_cards: int
    streak_days: int
    last_studied: Optional[datetime] = None
    cards: list[StudyCardResponse]


class StudySessionStats(BaseModel):
    total_reviewed: int
    again_count: int
    hard_count: int
    good_count: int
    easy_count: int
    avg_quality: float
    session_duration_seconds: int
    streak_days: int
