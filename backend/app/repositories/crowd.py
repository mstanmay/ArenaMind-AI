"""Crowd density snapshot repository implementation."""

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.crowd import CrowdSnapshot
from app.repositories.base import BaseRepository


class CrowdSnapshotRepository(BaseRepository[CrowdSnapshot]):
    """Data access repository for CrowdSnapshot entities."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(CrowdSnapshot, db)

    async def get_latest_by_zone(self, zone: str) -> CrowdSnapshot | None:
        """Fetch the most recent crowd density snapshot for a specific zone."""
        stmt = (
            select(CrowdSnapshot)
            .where(
                CrowdSnapshot.zone == zone,
                CrowdSnapshot.deleted_at.is_(None)
            )
            .order_by(desc(CrowdSnapshot.created_at))
            .limit(1)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_latest_for_all_zones(self) -> list[CrowdSnapshot]:
        """Fetch the most recent snapshot for all distinct zones."""
        # Find distinct zones first
        zone_stmt = select(CrowdSnapshot.zone).distinct().where(CrowdSnapshot.deleted_at.is_(None))
        zone_result = await self.db.execute(zone_stmt)
        zones = zone_result.scalars().all()

        snapshots = []
        for zone in zones:
            snap = await self.get_latest_by_zone(zone)
            if snap:
                snapshots.append(snap)
        return snapshots
