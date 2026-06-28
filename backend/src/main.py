"""
ArthaMind AI Banking Simulator — FastAPI Application Entry Point
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from src.config.settings import get_settings
from src.middleware.error_handler import register_exception_handlers
from src.middleware.rate_limit import RateLimitMiddleware
from src.middleware.request_id import RequestIDMiddleware
from src.routes import api_router
from src.utils.logger import get_logger

logger = get_logger("main")
settings = get_settings()


# ---------------------------------------------------------------------------
# Application lifespan (startup / shutdown)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Run startup and shutdown logic."""
    logger.info(
        "Starting %s v%s [%s]",
        settings.app_name,
        settings.app_version,
        settings.environment,
    )
    # Phase 2+ will initialise DB pool, Redis, ChromaDB here
    yield
    logger.info("Shutting down %s", settings.app_name)


# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------
def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="ArthaMind API",
        description=(
            "ArthaMind AI Banking Simulator — Agentic AI Banking Platform "
            "built for SBI Hackathon 2026. Powered by Gemini 2.5 Flash and LangGraph."
        ),
        version=settings.app_version,
        docs_url="/api/docs" if not settings.is_production else None,
        redoc_url="/api/redoc" if not settings.is_production else None,
        openapi_url="/api/openapi.json" if not settings.is_production else None,
        lifespan=lifespan,
    )

    # ------------------------------------------------------------------
    # Middleware (order matters — first registered = outermost layer)
    # ------------------------------------------------------------------

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID"],
    )

    # Gzip compression for responses > 1 KB
    app.add_middleware(GZipMiddleware, minimum_size=1024)

    # Rate limiting
    app.add_middleware(RateLimitMiddleware, default_rpm=100, auth_rpm=10)

    # Unique request-ID on every request/response
    app.add_middleware(RequestIDMiddleware)

    # ------------------------------------------------------------------
    # Exception handlers
    # ------------------------------------------------------------------
    register_exception_handlers(app)

    # ------------------------------------------------------------------
    # Routers
    # ------------------------------------------------------------------
    app.include_router(api_router, prefix="/api/v1")

    # Root redirect to docs
    @app.get("/", include_in_schema=False)
    async def root() -> JSONResponse:
        return JSONResponse(
            content={
                "app": settings.app_name,
                "version": settings.app_version,
                "docs": "/api/docs",
                "health": "/api/v1/health",
            }
        )

    logger.info("Application configured successfully.")
    return app


# ---------------------------------------------------------------------------
# ASGI application instance (used by uvicorn)
# ---------------------------------------------------------------------------
app = create_app()
