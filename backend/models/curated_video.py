from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CuratedVideo(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    video_id: str
    title: str
    thumbnail: str
    channel: str
    duration_seconds: int
    tags: list[str]
    level: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

    class Config:
        populate_by_name = True
        protected_namespaces = ()
