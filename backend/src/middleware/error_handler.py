"""Global exception handlers for consistent error responses."""

import traceback
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from src.utils.logger import get_logger

logger = get_logger("error_handler")


def _error_response(
    status_code: int,
    error: str,
    message: str,
    details: Any = None,
    request_id: str | None = None,
) -> JSONResponse:
    body: dict[str, Any] = {"error": error, "message": message}
    if details is not None:
        body["details"] = details
    if request_id:
        body["request_id"] = request_id
    return JSONResponse(status_code=status_code, content=body)


def register_exception_handlers(app: FastAPI) -> None:
    """Attach all global exception handlers to *app*."""

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        request_id = getattr(request.state, "request_id", None)
        return _error_response(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error="validation_error",
            message="Request validation failed.",
            details=[
                {
                    "field": ".".join(str(loc) for loc in e["loc"]),
                    "message": e["msg"],
                    "type": e["type"],
                }
                for e in exc.errors()
            ],
            request_id=request_id,
        )

    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
        request_id = getattr(request.state, "request_id", None)
        return _error_response(
            status_code=status.HTTP_400_BAD_REQUEST,
            error="bad_request",
            message=str(exc),
            request_id=request_id,
        )

    @app.exception_handler(PermissionError)
    async def permission_error_handler(request: Request, exc: PermissionError) -> JSONResponse:
        request_id = getattr(request.state, "request_id", None)
        return _error_response(
            status_code=status.HTTP_403_FORBIDDEN,
            error="forbidden",
            message="You do not have permission to perform this action.",
            request_id=request_id,
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        request_id = getattr(request.state, "request_id", None)
        logger.error(
            "Unhandled exception on %s %s | request_id=%s\n%s",
            request.method,
            request.url.path,
            request_id,
            traceback.format_exc(),
        )
        return _error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error="internal_server_error",
            message="An unexpected error occurred. Please try again later.",
            request_id=request_id,
        )
