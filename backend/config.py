from pydantic import Field
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

    # OpenRouter free mode (MVP-safe)
    openrouter_free_model: str = "google/gemini-2.5-flash-lite"
    openrouter_free_secondary_model: str = "openrouter/auto"
    openrouter_free_tertiary_model: str = "openrouter/auto"
    openrouter_free_max_tokens: int = 3000
    openrouter_free_max_cards: int = 8

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
    llm_model_openrouter_free_secondary: str = "openrouter/auto"  # MVP: auto-routing (models change frequently)
    llm_model_openrouter_free_tertiary: str = "openrouter/auto"  # MVP: auto-routing (models change frequently)

    # AI — Nvidia NIM (Primary for dual-role routing)
    nvidia_api_key: str = ""
    nvidia_base_url: str = "https://integrate.api.nvidia.com/v1"
    nvidia_model_curator_primary: str = "meta/llama-3.3-70b-instruct"
    nvidia_model_curator_secondary: str = "meta/llama-3.1-70b-instruct"
    nvidia_model_designer_primary: str = "meta/llama-3.3-70b-instruct"
    nvidia_model_designer_secondary: str = "nvidia/nemotron-ultra-253b"
    nvidia_model_designer_tertiary: str = "qwen/qwen3-next-80b-a3b-instruct"
    nvidia_max_tokens: int = 4000

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
    temp_nvidia: float = 0.3

    # AI circuit breaker
    circuit_breaker_threshold: int = 3
    circuit_breaker_cooldown_seconds: int = 300  # 5 min

    # Role-based fallback chains (comma-separated for env var compatibility)
    curator_fallback_chain: str = "nvidia_curator_primary,nvidia_curator_secondary,openrouter,flash"
    designer_fallback_chain: str = "nvidia_designer_primary,nvidia_designer_secondary,nvidia_designer_tertiary,openrouter,flash"

    # Superadmin 2FA (DEPRECATED — use TOTP instead)
    superadmin_2fa_code: str = ""

    # Admin IP whitelist (comma-separated, empty = no restriction)
    admin_allowed_ips: str = ""

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