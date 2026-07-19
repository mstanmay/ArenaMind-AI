"""Redis-backed Pub/Sub Event Bus for real-time operations."""

import json
from typing import Any, Callable, Coroutine
from app.core.logging import get_logger
from app.core.redis import get_redis_pool

logger = get_logger("event_bus")

# Type alias for event listeners
EventListener = Callable[[dict[str, Any]], Coroutine[Any, Any, None]]

_event_bus: "EventBus | None" = None


class EventBus:
    """Publish-Subscribe event bus mapping application events over Redis Pub/Sub channels."""

    def __init__(self) -> None:
        self.listeners: dict[str, list[EventListener]] = {}

    async def publish(self, event_type: str, payload: dict[str, Any]) -> None:
        """Broadcast an event payload to a Redis channel matching the event type."""
        try:
            redis = await get_redis_pool()
            message = json.dumps(payload)
            await redis.publish(event_type, message)
            logger.info("event_published", event=event_type)
        except Exception as e:
            logger.error("event_publish_failed", event=event_type, error=str(e))

    def subscribe(self, event_type: str, listener: EventListener) -> None:
        """Register a local listener callback function for an event type."""
        if event_type not in self.listeners:
            self.listeners[event_type] = []
        self.listeners[event_type].append(listener)
        logger.info("local_subscription_added", event=event_type)

    async def run_listener_loop(self) -> None:
        """Start the background Redis pubsub subscription listening loop."""
        try:
            redis = await get_redis_pool()
            pubsub = redis.pubsub()
            
            # Subscribe to all event channels
            channels = list(self.listeners.keys())
            if not channels:
                return

            await pubsub.subscribe(*channels)
            logger.info("redis_pubsub_listening", channels=channels)

            async for message in pubsub.listen():
                if message and message["type"] == "message":
                    channel = message["channel"]
                    data = message["data"]
                    
                    try:
                        payload = json.loads(data)
                        callbacks = self.listeners.get(channel, [])
                        for callback in callbacks:
                            await callback(payload)
                    except Exception as e:
                        logger.error("event_processing_error", channel=channel, error=str(e))
        except Exception as e:
            logger.error("pubsub_loop_error", error=str(e))


async def get_event_bus() -> EventBus:
    """Retrieve or initialize the EventBus singleton."""
    global _event_bus
    if _event_bus is None:
        _event_bus = EventBus()
    return _event_bus
