"""
Rate limiting using slowapi (wraps limits library).
Applied to POST /api/generate — 10 requests/minute per IP.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)