"""Report repository implementation."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.report import Report
from app.repositories.base import BaseRepository


class ReportRepository(BaseRepository[Report]):
    """Data access repository for Report entities."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(Report, db)

    async def get_by_type(self, report_type: str) -> list[Report]:
        """Fetch all reports of a specific type."""
        stmt = select(Report).where(
            Report.report_type == report_type,
            Report.deleted_at.is_(None)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
