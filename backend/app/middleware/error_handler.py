"""Global exception handler — maps domain exceptions to structured HTTP error responses."""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.exceptions import (
    ArenaMindError,
    AuthenticationError,
    AuthorizationError,
    ConflictError,
    NotFoundError,
    RateLimitExceededError,
    ValidationError,
    AIGuardrailError,
    PromptInjectionError,
)
from app.core.logging import get_logger

logger = get_logger("error_handler")

# Map exception types to HTTP status codes
_STATUS_MAP: dict[type[ArenaMindError], int] = {
    AuthenticationError: 401,
    AuthorizationError: 403,
    NotFoundError: 404,
    ConflictError: 409,
    ValidationError: 422,
    RateLimitExceededError: 429,
    AIGuardrailError: 451,  # Unavailable For Legal Reasons — fitting for guardrails
    PromptInjectionError: 400,
}


def register_exception_handlers(app: FastAPI) -> None:
    """Register all custom exception handlers on the FastAPI app."""

    @app.exception_handler(ArenaMindError)
    async def arenamind_error_handler(request: Request, exc: ArenaMindError) -> JSONResponse:
        status_code = 500
        for exc_type, code in _STATUS_MAP.items():
            if isinstance(exc, exc_type):
                status_code = code
                break

        request_id = getattr(request.state, "request_id", "unknown")

        logger.error(
            "domain_error",
            error_code=exc.code,
            message=exc.message,
            status_code=status_code,
            request_id=request_id,
            path=str(request.url.path),
        )

        return JSONResponse(
            status_code=status_code,
            content={
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                    "request_id": request_id,
                }
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
        request_id = getattr(request.state, "request_id", "unknown")

        logger.exception(
            "unhandled_error",
            error_type=type(exc).__name__,
            message=str(exc),
            request_id=request_id,
            path=str(request.url.path),
        )

        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "An unexpected error occurred",
                    "request_id": request_id,
                }
            },
        )
