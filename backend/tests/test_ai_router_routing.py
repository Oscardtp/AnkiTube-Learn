from config import get_settings
from services.ai_router import _get_fallback_order, _get_safe_openrouter_request_settings


def test_openrouter_defaults_prioritize_gemini_flash_lite_and_cap_tokens():
    settings = get_settings()

    assert settings.openrouter_free_model == "google/gemini-2.5-flash-lite"
    assert settings.openrouter_free_secondary_model == "openrouter/auto"
    assert settings.openrouter_free_max_tokens == 3000


def test_openrouter_safe_settings_cap_free_mode_tokens_to_3000():
    max_tokens, max_cards = _get_safe_openrouter_request_settings(
        max_tokens=5000,
        max_cards=12,
        user_role="user",
        provider="openrouter",
    )

    assert max_tokens == 3000
    assert max_cards == 8


def test_fallback_order_keeps_openrouter_chain_first():
    order = _get_fallback_order("openrouter")

    assert order[:3] == ["openrouter", "openrouter_secondary", "openrouter_tertiary"]
