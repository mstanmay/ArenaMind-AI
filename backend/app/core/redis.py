"""Async Redis connection pool singleton."""

from redis.asyncio import Redis, ConnectionPool

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)

_pool: ConnectionPool | None = None
_redis: Redis | None = None


async def get_redis_pool() -> Redis:
    """Get or create the Redis connection pool singleton."""
    global _pool, _redis
    if _redis is None:
        settings = get_settings()
        _pool = ConnectionPool.from_url(
            settings.redis_url,
            max_connections=20,
            decode_responses=True,
        )
        _redis = Redis(connection_pool=_pool)
        logger.info("redis_connected", url=settings.redis_url)
    return _redis


async def close_redis() -> None:
    """Gracefully close the Redis connection pool."""
    global _pool, _redis
    if _redis is not None:
        await _redis.close()
        _redis = None
    if _pool is not None:
        await _pool.disconnect()
        _pool = None
        logger.info("redis_disconnected")


async def get_redis() -> Redis:
    """Dependency injection helper — yields an active Redis client."""
    return await get_redis_pool()
