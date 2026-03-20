from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
import secrets
import string


def generate_license_code() -> str:
    """Generate code in format ANKI-XXXX-XXXX"""
    chars = string.ascii_uppercase + string.digits
    part1 = "".join(secrets.choice(chars) for _ in range(4))
    part2 = "".join(secrets.choice(chars) for _ in range(4))
    return f"ANKI-{part1}-{part2}"


class LicenseInDB(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    code: str
    email: Optional[str] = None
    duration_days: Literal[7, 15, 30]
    created_by: str  # superadmin user_id
    activated_by: Optional[str] = None
    expires_at: Optional[datetime] = None
    status: Literal["pending", "active", "expired", "revoked"] = "pending"
    internal_note: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class LicenseCreate(BaseModel):
    email: Optional[str] = None
    duration_days: Literal[7, 15, 30]
    internal_note: Optional[str] = None


class LicenseActivate(BaseModel):
    code: str


class LicenseResponse(BaseModel):
    code: str
    status: str
    duration_days: int
    expires_at: Optional[datetime]
    email: Optional[str]
    internal_note: Optional[str]