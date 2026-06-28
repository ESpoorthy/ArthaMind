"""Unit tests for application settings (Task 1.7)."""
import os
import pytest
from src.config.settings import Settings


def test_settings_defaults():
    """Settings loads with required keys set."""
    s = Settings(
        secret_key="a_secret_key_that_is_long_enough_32c",
        refresh_secret_key="a_refresh_key_that_is_long_enough_32",
    )
    assert s.app_name == "ArthaMind"
    assert s.environment == "development"
    assert s.backend_port == 8000
    assert s.algorithm == "HS256"


def test_settings_environment_validation():
    """Settings rejects invalid environment values."""
    with pytest.raises(Exception):
        Settings(
            secret_key="a_secret_key_that_is_long_enough_32c",
            refresh_secret_key="a_refresh_key_that_is_long_enough_32",
            environment="invalid_env",  # type: ignore
        )


def test_settings_is_production():
    s = Settings(
        secret_key="a_secret_key_that_is_long_enough_32c",
        refresh_secret_key="a_refresh_key_that_is_long_enough_32",
        environment="production",
    )
    assert s.is_production is True
    assert s.is_test is False


def test_settings_is_test():
    s = Settings(
        secret_key="a_secret_key_that_is_long_enough_32c",
        refresh_secret_key="a_refresh_key_that_is_long_enough_32",
        environment="test",
    )
    assert s.is_test is True


def test_settings_database_url_sync_derived():
    """Sync DB URL is automatically derived from async URL."""
    s = Settings(
        secret_key="a_secret_key_that_is_long_enough_32c",
        refresh_secret_key="a_refresh_key_that_is_long_enough_32",
        database_url="postgresql+asyncpg://user:pass@localhost:5432/db",
    )
    assert "+asyncpg" not in s.database_url_sync
    assert "postgresql://user:pass@localhost:5432/db" == s.database_url_sync


def test_settings_max_upload_bytes():
    s = Settings(
        secret_key="a_secret_key_that_is_long_enough_32c",
        refresh_secret_key="a_refresh_key_that_is_long_enough_32",
        max_upload_size_mb=5,
    )
    assert s.max_upload_size_bytes == 5 * 1024 * 1024


def test_allowed_origins_parsed_from_string():
    s = Settings(
        secret_key="a_secret_key_that_is_long_enough_32c",
        refresh_secret_key="a_refresh_key_that_is_long_enough_32",
        allowed_origins="http://localhost:5173,http://localhost:3000",
    )
    assert len(s.allowed_origins) == 2
    assert "http://localhost:5173" in s.allowed_origins
