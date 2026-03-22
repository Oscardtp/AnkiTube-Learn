"""
JWT auth utilities and FastAPI dependencies.
"""

from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext

from config import get_settings

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)
bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.utcnow() + timedelta(minutes=settings.jwt_expire_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        ) from e


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Optional[dict]:
    """Returns current user dict or None if no valid token."""
    if not credentials:
        return None
    try:
        return decode_token(credentials.credentials)
    except HTTPException:
        return None


async def require_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> dict:
    """Requires valid JWT. Raises 401 if not authenticated."""
    user = await get_current_user(credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Debes iniciar sesión para realizar esta acción",
        )
    return user


async def require_superadmin(
    user: dict = Depends(require_auth),
) -> dict:
    """Requires superadmin role. Raises 403 if not superadmin."""
    if user.get("role") != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado",
        )
    return user