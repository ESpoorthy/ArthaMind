"""
Application settings with Pydantic BaseSettings.
All values are validated at startup — missing required vars raise an error immediately.
"""

from functools import lru_cache
from typing import Literal

from pydantic import AnyHttpUrl, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralised, type-safe application configuration."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ------------------------------------------------------------------
    # Application
    # ------------------------------------------------------------------
    environment: Literal["development", "staging", "production", "test"] = "development"
    app_name: str = "ArthaMind"
    app_version: str = "1.0.0"
    debug: bool = False
    log_level: Literal["debug", "info", "warning", "error", "critical"] = "info"

    # ------------------------------------------------------------------
    # Backend server
    # ------------------------------------------------------------------
    backend_host: str = "0.0.0.0"
    backend_port: int = Field(default=8000, ge=1, le=65535)
    allowed_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    # ------------------------------------------------------------------
    # Database
    # ------------------------------------------------------------------
    database_url: str = Field(
        default="postgresql+asyncpg://arthamind:arthamind_secret@localhost:5432/arthamind"
    )
    database_url_sync: str = ""  # populated in model_post_init

    def model_post_init(self, __context: object) -> None:
        # Provide a sync URL for Alembic migrations (uses psycopg2)
        if not self.database_url_sync:
            object.__setattr__(
                self,
                "database_url_sync",
                self.database_url.replace("+asyncpg", ""),
            )

    # ------------------------------------------------------------------
    # Redis
    # ------------------------------------------------------------------
    redis_url: str = "redis://localhost:6379/0"
    redis_ttl_seconds: int = 3600

    # ------------------------------------------------------------------
    # ChromaDB
    # ------------------------------------------------------------------
    chromadb_host: str = "localhost"
    chromadb_port: int = 8001
    chromadb_collection_name: str = "arthamind_banking_kb"

    @property
    def chromadb_url(self) -> str:
        return f"http://{self.chromadb_host}:{self.chromadb_port}"

    # ------------------------------------------------------------------
    # JWT / Authentication
    # ------------------------------------------------------------------
    secret_key: str = Field(min_length=32)
    refresh_secret_key: str = Field(min_length=32)
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # ------------------------------------------------------------------
    # Security
    # ------------------------------------------------------------------
    encryption_key: str = ""
    max_login_attempts: int = 5
    account_lockout_minutes: int = 30
    bcrypt_rounds: int = 12

    # ------------------------------------------------------------------
    # Google Gemini AI
    # ------------------------------------------------------------------
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    gemini_max_tokens: int = 8192
    gemini_temperature: float = Field(default=0.2, ge=0.0, le=2.0)

    # ------------------------------------------------------------------
    # OCR
    # ------------------------------------------------------------------
    tesseract_cmd: str = "/usr/bin/tesseract"
    ocr_confidence_threshold: float = Field(default=0.7, ge=0.0, le=1.0)
    max_upload_size_mb: int = 10
    allowed_upload_types: list[str] = ["image/jpeg", "image/png", "application/pdf"]

    @field_validator("allowed_upload_types", mode="before")
    @classmethod
    def parse_upload_types(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return [t.strip() for t in v.split(",")]
        return v

    # ------------------------------------------------------------------
    # Demo / Simulator
    # ------------------------------------------------------------------
    demo_customer_password: str = "Demo@12345"
    seed_database: bool = True

    # ------------------------------------------------------------------
    # Derived helpers
    # ------------------------------------------------------------------
    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def is_test(self) -> bool:
        return self.environment == "test"

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    """Return a cached singleton Settings instance."""
    return Settings()
