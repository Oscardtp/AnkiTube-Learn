"""
Freemium limit enforcement — always server-side.
Verifies 1 deck/day limit for free users in Colombia timezone (UTC-5).
"""

from datetime import datetime
import pytz

from config import get_settings

settings = get_settings()
COLOMBIA_TZ = pytz.timezone(settings.timezone)


def get_colombia_today() -> datetime:
    """Returns today's date in Colombia timezone."""
    return datetime.now(COLOMBIA_TZ).replace(hour=0, minute=0, second=0, microsecond=0)


def has_exceeded_daily_limit(user_doc: dict) -> bool:
    """
    Returns True if a free user has already generated their 1 deck today.
    Always checked server-side regardless of frontend state.
    """
    role = user_doc.get("role", "user")

    # Premium users have no limit
    if role in ("premium", "tester", "superadmin"):
        return False

    last_gen = user_doc.get("last_generation_date")
    generations_today = user_doc.get("generations_today", 0)

    if last_gen is None:
        return False

    # Convert to Colombia timezone for comparison
    if last_gen.tzinfo is None:
        last_gen = pytz.utc.localize(last_gen)
    last_gen_colombia = last_gen.astimezone(COLOMBIA_TZ)
    today_colombia = get_colombia_today()

    # Same day in Colombia timezone
    if last_gen_colombia.date() == today_colombia.date():
        return generations_today >= settings.free_max_decks_per_day

    return False


def get_max_cards_for_role(role: str) -> int:
    """Returns max cards per deck based on user role."""
    if role == "user":
        return settings.free_max_cards
    return 25  # Premium and above get more cards