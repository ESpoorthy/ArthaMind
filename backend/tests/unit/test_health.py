"""Integration-style test for health endpoints (Task 1.7)."""
import os

os.environ.setdefault("SECRET_KEY", "test_secret_key_minimum_32_chars_long_xx")
os.environ.setdefault("REFRESH_SECRET_KEY", "test_refresh_key_min_32_chars_long_xx")

import pytest
from fastapi.testclient import TestClient

from src.main import app

client = TestClient(app)


def test_health_returns_200():
    response = client.get("/api/v1/health")
    assert response.status_code == 200


def test_health_response_structure():
    response = client.get("/api/v1/health")
    data = response.json()
    assert data["status"] == "healthy"
    assert "app" in data
    assert "version" in data
    assert "uptime_seconds" in data


def test_readiness_returns_200():
    response = client.get("/api/v1/ready")
    assert response.status_code == 200


def test_readiness_structure():
    response = client.get("/api/v1/ready")
    data = response.json()
    assert "status" in data
    assert "checks" in data
    assert data["checks"]["api"] == "ok"


def test_root_redirect():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "docs" in data
    assert "health" in data


def test_unknown_route_404():
    response = client.get("/api/v1/nonexistent")
    assert response.status_code == 404
