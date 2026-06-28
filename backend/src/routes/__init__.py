"""Route registration for ArthaMind API v1."""

from fastapi import APIRouter

from src.routes.health import router as health_router

# Phase 1: only health endpoints.
# Additional routers (auth, accounts, cards, loans, ai, etc.) are wired in later phases.
api_router = APIRouter()
api_router.include_router(health_router)
