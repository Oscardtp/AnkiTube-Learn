from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }

    # App
    app_name: str = "AnkiTube Learn API"
    app_debug: bool = False
    frontend_url: str = "http://localhost:3000"

    # MongoDB
    mongodb_url: str
    mongodb_db: str = "ankitube_learn"

    # Redis
    redis_url: str = "redis://localhost:6379"

    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080  # 7 days

    # AI — OpenRouter
    openrouter_api_key: str = "dummy-for-local-dev"
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    llm_model_openrouter: str = "meta-llama/llama-3.2-3b-instruct:free"  # Primary free
    llm_model_openrouter_free_secondary: str = "deepseek/deepseek-chat-v3-0324:free"  # Better quality fallback
    llm_model_openrouter_free_tertiary: str = "google/gemini-3-flash-preview:free"  # Google latest free

    # AI — Gemini
    google_api_key: str
    llm_model_free: str = "gemini-2.0-flash"
    llm_model_fluente: str = "gemini-1.5-pro-002"

    # AI — Anthropic
    anthropic_api_key: str
    llm_model_nativo: str = "claude-sonnet-4-20250514"

    # AI temperatures
    temp_flash: float = 0.3
    temp_pro: float = 0.4
    temp_claude: float = 0.2
    temp_openrouter: float = 0.3

    # AI circuit breaker
    circuit_breaker_threshold: int = 3
    circuit_breaker_cooldown_seconds: int = 300  # 5 min

    # Superadmin 2FA
    superadmin_2fa_code: str

    # Rate limiting
    rate_limit_generate_per_minute: int = 10

    # Freemium limits
    free_max_cards: int = 15
    free_max_decks_per_day: int = 1

    # Colombia timezone
    timezone: str = "America/Bogota"

    # Development mode
    use_mock_ai: bool = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()