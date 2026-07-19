"""Correlation ID middleware — generates and propagates X-Request-ID across the request lifecycle."""

import uuid

import structlog
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """Attach a unique correlation ID to every request.

    If the client sends an X-Request-ID header, it is reused;
    otherwise a new UUID v4 is generated. The ID is:
    - Injected into structlog context vars (for all log lines in this request)
    - Returned in the response X-Request-ID header
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))

        # Bind to structlog so every log in this request context carries the ID
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(request_id=request_id)

        # Store on request state for downstream access
        request.state.request_id = request_id

        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
