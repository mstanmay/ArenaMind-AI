"""Application configuration via Pydantic Settings — single source of truth for all env vars."""

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralized configuration loaded from environment variables and .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────
    app_name: str = "ArenaMind AI"
    app_env: Literal["development", "staging", "production"] = "development"
    app_debug: bool = True
    app_version: str = "1.0.0"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    allowed_origins: str = "http://localhost:3000,http://localhost:8000"

    # ── Database ─────────────────────────────────────────
    database_url: str = "sqlite+aiosqlite:///./arenamind.db"

    # ── Redis ────────────────────────────────────────────
    redis_url: str = "redis://localhost:6379/0"

    # ── JWT ──────────────────────────────────────────────
    jwt_secret_key: str = "CHANGE_ME_TO_A_RANDOM_SECRET_AT_LEAST_32_CHARS"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7

    # ── AI / LLM ────────────────────────────────────────
    llm_provider: Literal["openai", "gemini", "mock"] = "mock"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    google_api_key: str = ""
    google_model: str = "gemini-2.0-flash"

    # ── Vector DB ────────────────────────────────────────
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str = ""
    qdrant_collection: str = "arenamind_memory"

    # ── Celery ───────────────────────────────────────────
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    # ── Rate Limiting ────────────────────────────────────
    rate_limit_requests: int = 100
    rate_limit_window_seconds: int = 60

    # ── MFA ──────────────────────────────────────────────
    mfa_issuer_name: str = "ArenaMind AI"
    mfa_encryption_key: str = "CHANGE_ME_TO_A_FERNET_KEY_BASE64_ENCODED"

    # ── Account Lockout ──────────────────────────────────
    account_lockout_threshold: int = 5
    account_lockout_duration_minutes: int = 30

    # ── Password Policy ──────────────────────────────────
    password_min_length: int = 12

    # ── Device Trust ─────────────────────────────────────
    trusted_device_ttl_days: int = 90

    # ── Logging ──────────────────────────────────────────
    log_level: str = "INFO"
    log_format: Literal["json", "console"] = "json"

    @property
    def cors_origins(self) -> list[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton — call this everywhere instead of instantiating."""
    return Settings()
