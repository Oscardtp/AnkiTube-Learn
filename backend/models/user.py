from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Literal
from datetime import datetime
import re


class WizardAnswers(BaseModel):
    level: str
    goal: str
    daily_minutes: int
    content_type: str
    cards_per_day: int


class UserInDB(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    email: EmailStr
    password: str  # bcrypt hash
    role: Literal["user", "premium", "tester", "superadmin"] = "user"
    tester_expires_at: Optional[datetime] = None
    last_generation_date: Optional[datetime] = None
    generations_today: int = 0
    setup_wizard_completed: bool = False
    wizard_answers: Optional[WizardAnswers] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Validate password has at least one lowercase, one uppercase, and one digit."""
        if not re.search(r"[a-z]", v):
            raise ValueError("La contraseña debe contener al menos una letra minúscula")
        if not re.search(r"[A-Z]", v):
            raise ValueError("La contraseña debe contener al menos una letra mayúscula")
        if not re.search(r"\d", v):
            raise ValueError("La contraseña debe contener al menos un número")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    setup_wizard_completed: bool
    generations_today: int


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse