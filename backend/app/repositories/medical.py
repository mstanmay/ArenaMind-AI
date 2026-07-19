"""Medical incident repository implementation."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.medical import MedicalIncident
from app.repositories.base import BaseRepository


class MedicalIncidentRepository(BaseRepository[MedicalIncident]):
    """Data access repository for MedicalIncident entities."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(MedicalIncident, db)

    async def get_active_incidents(self) -> list[MedicalIncident]:
        """Fetch all active (unresolved) medical incidents."""
        stmt = select(MedicalIncident).where(
            MedicalIncident.status != "resolved",
            MedicalIncident.deleted_at.is_(None)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
