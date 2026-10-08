"""
Application settings with Pydantic BaseSettings.
All values are validated at startup — missing required vars raise an error immediately.
"""

from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator, model_validator
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
    require_real_infrastructure: bool = False

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
    # Z-Sentinel — Inference
    # ------------------------------------------------------------------
    inference_provider: Literal["local", "ibmz"] = "local"
    worker_batch_size: int = Field(default=1, ge=1)
    model_artefacts_path: str = "models"

    # ------------------------------------------------------------------
    # Z-Sentinel — Risk weights (must sum to 1.0, validated below)
    # ------------------------------------------------------------------
    risk_weight_ml: float = Field(default=0.50, ge=0.0, le=1.0)
    risk_weight_anomaly: float = Field(default=0.30, ge=0.0, le=1.0)
    risk_weight_rules: float = Field(default=0.20, ge=0.0, le=1.0)

    # ------------------------------------------------------------------
    # Z-Sentinel — Policy thresholds
    # ------------------------------------------------------------------
    decision_low_threshold: float = Field(default=0.30, ge=0.0, le=1.0)
    decision_medium_threshold: float = Field(default=0.60, ge=0.0, le=1.0)
    decision_high_threshold: float = Field(default=0.80, ge=0.0, le=1.0)

    # ------------------------------------------------------------------
    # Z-Sentinel — Explanation mode
    # ------------------------------------------------------------------
    explanation_mode: Literal["gemini", "deterministic"] = "gemini"

    # ------------------------------------------------------------------
    # Z-Sentinel — IBM Z settings (optional, only needed for ibmz provider)
    # ------------------------------------------------------------------
    ibm_z_host: str = ""
    ibm_z_port: int = 443
    ibm_z_username: str = ""
    ibm_z_password: str = ""
    ibm_z_model_name: str = ""

    # ------------------------------------------------------------------
    # Z-Sentinel — Decision Impact Simulator cost parameters
    # ------------------------------------------------------------------
    step_up_friction_cost: float = Field(default=1.00, ge=0.0)
    customer_friction_value: float = Field(default=5.00, ge=0.0)

    # ------------------------------------------------------------------
    # Z-Sentinel — Sensitive log fields (never log these values)
    # ------------------------------------------------------------------
    sensitive_log_fields: list[str] = ["ibm_z_password", "gemini_api_key", "device_fingerprint"]

    @model_validator(mode="after")
    def _validate_z_sentinel(self) -> "Settings":
        # 1. Risk weights must sum to 1.0 within floating-point tolerance
        weight_sum = self.risk_weight_ml + self.risk_weight_anomaly + self.risk_weight_rules
        if abs(weight_sum - 1.0) > 1e-9:
            raise ValueError("RISK_WEIGHT_* values must sum to 1.0")

        # 2. When using IBM Z provider, all five connection fields must be non-empty
        if self.inference_provider == "ibmz":
            ibm_z_fields = {
                "ibm_z_host": self.ibm_z_host,
                "ibm_z_username": self.ibm_z_username,
                "ibm_z_password": self.ibm_z_password,
                "ibm_z_model_name": self.ibm_z_model_name,
            }
            missing = [name for name, value in ibm_z_fields.items() if not value]
            # ibm_z_port is an int with a sensible default (443), so only check the string fields
            if missing:
                raise ValueError(
                    f"inference_provider is 'ibmz' but the following required fields are empty: "
                    f"{', '.join(missing)}"
                )

        return self

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
