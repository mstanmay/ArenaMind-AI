"""Stadium event repository implementation."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import StadiumEvent
from app.repositories.base import BaseRepository


class StadiumEventRepository(BaseRepository[StadiumEvent]):
    """Data access repository for StadiumEvent entities."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(StadiumEvent, db)

    async def get_active_events(self) -> list[StadiumEvent]:
        """Fetch all currently active events."""
        stmt = select(StadiumEvent).where(
            StadiumEvent.status == "live",
            StadiumEvent.deleted_at.is_(None)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
