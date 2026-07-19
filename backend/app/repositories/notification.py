"""Notification repository implementation."""

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.repositories.base import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    """Data access repository for Notification entities."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(Notification, db)

    async def get_unread_for_user(self, user_id: str) -> list[Notification]:
        """Fetch all unread notifications targeted directly to a user."""
        stmt = select(Notification).where(
            Notification.target_user_id == user_id,
            Notification.is_read.is_(False),
            Notification.deleted_at.is_(None)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_unread_for_role(self, role: str) -> list[Notification]:
        """Fetch all unread notifications targeted directly to a security clearance role."""
        stmt = select(Notification).where(
            Notification.target_role == role,
            Notification.is_read.is_(False),
            Notification.deleted_at.is_(None)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def mark_all_read(self, user_id: str) -> None:
        """Mark all unread notifications for a user as read."""
        stmt = (
            update(Notification)
            .where(
                Notification.target_user_id == user_id,
                Notification.is_read.is_(False),
                Notification.deleted_at.is_(None)
            )
            .values(is_read=True)
        )
        await self.db.execute(stmt)
        await self.db.flush()
