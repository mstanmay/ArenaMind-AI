"""Redis-backed sliding window rate limiter middleware/dependency."""

import time
from fastapi import Request

from app.core.config import get_settings
from app.core.redis import get_redis_pool
from app.core.exceptions import RateLimitExceededError
from app.core.logging import get_logger

logger = get_logger("rate_limiter")


class RateLimiter:
    """FastAPI dependency for Redis-backed sliding window rate limiting.

    Tracks request counts per IP or user ID in a given window using a sorted set.
    """

    def __init__(
        self,
        requests_limit: int | None = None,
        window_seconds: int | None = None,
    ) -> None:
        settings = get_settings()
        self.requests_limit = requests_limit or settings.rate_limit_requests
        self.window_seconds = window_seconds or settings.rate_limit_window_seconds

    async def __call__(self, request: Request) -> None:
        settings = get_settings()
        if settings.app_env == "development" and not settings.is_production:
            return  # Skip rate limiting in development mode if desired

        # Identify client (by authorization sub if authenticated, else IP)
        client_key = "rate_limit:ip:" + (request.client.host if request.client else "unknown")
        
        # Check if auth token exists to scope to user
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            try:
                from app.security.jwt import verify_token
                token = auth_header.split(" ")[1]
                payload = verify_token(token)
                client_key = "rate_limit:user:" + str(payload.get("sub", "unknown"))
            except Exception:
                pass # Fallback to IP limit if token invalid

        try:
            redis = await get_redis_pool()
            current_time = time.time()
            window_start = current_time - self.window_seconds

            # Pipeline Redis calls to ensure atomic check
            async with redis.pipeline(transaction=True) as pipe:
                # Remove timestamps older than window
                pipe.zremrangebyscore(client_key, 0, window_start)
                # Count remaining items
                pipe.zcard(client_key)
                # Add current request timestamp
                pipe.zadd(client_key, {str(current_time): current_time})
                # Set TTL on set to clear empty sets automatically
                pipe.expire(client_key, self.window_seconds + 5)
                
                results = await pipe.execute()
                request_count = results[1]

            if request_count >= self.requests_limit:
                logger.warning("rate_limit_tripped", client=client_key, count=request_count)
                raise RateLimitExceededError()

        except RateLimitExceededError:
            raise
        except Exception as e:
            # Fail open if Redis is down, but log warning
            logger.error("rate_limiter_error", error=str(e))
            return
