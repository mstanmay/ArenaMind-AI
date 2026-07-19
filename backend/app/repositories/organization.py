"""Organization repository implementation."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.organization import Organization
from app.repositories.base import BaseRepository


class OrganizationRepository(BaseRepository[Organization]):
    """Data access repository for Organization entities."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(Organization, db)

    async def get_by_slug(self, slug: str) -> Organization | None:
        """Fetch an organization by slug."""
        stmt = select(Organization).where(
            Organization.slug == slug.lower().strip(),
            Organization.deleted_at.is_(None)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
