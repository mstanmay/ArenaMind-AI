"""Security incident repository implementation."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.security_incident import SecurityIncident
from app.repositories.base import BaseRepository


class SecurityIncidentRepository(BaseRepository[SecurityIncident]):
    """Data access repository for SecurityIncident entities."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(SecurityIncident, db)

    async def get_active_incidents(self) -> list[SecurityIncident]:
        """Fetch all active (unresolved) security incidents."""
        stmt = select(SecurityIncident).where(
            SecurityIncident.status != "resolved",
            SecurityIncident.deleted_at.is_(None)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
