"""Simple in-memory rate limiter middleware (upgradeable to Redis-backed)."""

import time
from collections import defaultdict, deque
from typing import Deque

from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Sliding-window rate limiter.
    Default: 100 requests per minute per IP.
    Auth endpoints have a stricter limit (10 rpm).
    """

    def __init__(
        self,
        app: object,
        default_rpm: int = 100,
        auth_rpm: int = 10,
    ) -> None:
        super().__init__(app)  # type: ignore[arg-type]
        self._default_rpm = default_rpm
        self._auth_rpm = auth_rpm
        self._windows: dict[str, Deque[float]] = defaultdict(deque)

    def _get_client_key(self, request: Request) -> str:
        forwarded_for = request.headers.get("X-Forwarded-For")
        ip = (
            forwarded_for.split(",")[0].strip()
            if forwarded_for
            else (request.client.host if request.client else "unknown")
        )
        return f"{ip}:{request.url.path}"

    def _is_allowed(self, key: str, limit: int) -> bool:
        now = time.time()
        window = self._windows[key]

        # Drop timestamps older than 60 s
        while window and window[0] < now - 60:
            window.popleft()

        if len(window) >= limit:
            return False

        window.append(now)
        return True

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        path = request.url.path
        is_auth_path = path.startswith("/api/v1/auth")
        limit = self._auth_rpm if is_auth_path else self._default_rpm
        key = self._get_client_key(request)

        if not self._is_allowed(key, limit):
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "rate_limit_exceeded",
                    "message": "Too many requests. Please slow down.",
                },
                headers={"Retry-After": "60"},
            )

        return await call_next(request)
