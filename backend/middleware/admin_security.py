"""
Admin IP whitelist middleware.
Checks request IP against ADMIN_ALLOWED_IPS for /api/admin/* routes.
"""

import logging
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class AdminIPWhitelistMiddleware(BaseHTTPMiddleware):
    """Restrict /api/admin/* routes to allowed IPs when configured."""

    def __init__(self, app, allowed_ips: str = ""):
        super().__init__(app)
        self.allowed_ips = self._parse_ips(allowed_ips)

    @staticmethod
    def _parse_ips(raw: str) -> set[str]:
        if not raw or not raw.strip():
            return set()
        return {ip.strip() for ip in raw.split(",") if ip.strip()}

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip.strip()
        return request.client.host if request.client else ""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if not self.allowed_ips:
            return await call_next(request)

        if not request.url.path.startswith("/api/admin"):
            return await call_next(request)

        client_ip = self._get_client_ip(request)
        if client_ip not in self.allowed_ips:
            logger.warning(f"Admin access denied from IP: {client_ip}")
            return JSONResponse(
                status_code=403,
                content={"detail": "Acceso denegado desde esta IP"},
            )

        return await call_next(request)
