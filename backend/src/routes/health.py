"""Health-check and readiness endpoints."""

import time

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from src.config.settings import Settings, get_settings

router = APIRouter(tags=["Health"])

_start_time = time.time()


class HealthResponse(BaseModel):
    status: str
    app: str
    version: str
    environment: str
    uptime_seconds: float


class ReadinessResponse(BaseModel):
    status: str
    checks: dict[str, str]


@router.get("/health", response_model=HealthResponse, summary="Liveness check")
async def health_check(settings: Settings = Depends(get_settings)) -> HealthResponse:
    """Returns 200 when the application is running."""
    return HealthResponse(
        status="healthy",
        app=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
        uptime_seconds=round(time.time() - _start_time, 2),
    )


@router.get("/ready", response_model=ReadinessResponse, summary="Readiness check")
async def readiness_check() -> ReadinessResponse:
    """
    Returns 200 when all downstream services are reachable.
    Phase 1 stub — database/Redis checks added in Phase 2.
    """
    checks: dict[str, str] = {
        "api": "ok",
    }
    overall = "ready" if all(v == "ok" for v in checks.values()) else "not_ready"
    return ReadinessResponse(status=overall, checks=checks)
