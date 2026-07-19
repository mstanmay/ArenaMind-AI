"""Celery task module for background notification dispatching."""

import asyncio
from app.workers.celery_app import celery_app
from app.core.database import async_session_factory
from app.models.notification import Notification
from app.repositories.notification import NotificationRepository
from app.core.logging import get_logger

logger = get_logger("worker_notifications")


@celery_app.task(name="app.workers.tasks.notification_dispatch.send_alert_notification")
def send_alert_notification(title: str, message: str, priority: str = "medium") -> str:
    """Create and persist a system alert notification, making it available on user dashboard telemetry feeds."""
    logger.info("dispatching_alert_task", title=title, priority=priority)

    # Resolve async loop for SQLAlchemy operations inside synchronous Celery worker thread
    loop = asyncio.get_event_loop()
    if loop.is_closed():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    result = loop.run_until_complete(
        persist_notification(title, message, priority)
    )
    return result


async def persist_notification(title: str, message: str, priority: str) -> str:
    """Persist notification to database."""
    async with async_session_factory() as db:
        repo = NotificationRepository(db)
        notif = Notification(
            title=title,
            message=message,
            notification_type="alert" if priority in ["high", "critical"] else "info",
            priority=priority,
            is_read=False
        )
        await repo.create(notif)
        logger.info("notification_persisted", id=notif.id)
        return notif.id
