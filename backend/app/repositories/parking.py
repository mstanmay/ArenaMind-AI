"""Parking lot and snapshot repository implementation."""

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.parking import ParkingLot, ParkingSnapshot
from app.repositories.base import BaseRepository


class ParkingLotRepository(BaseRepository[ParkingLot]):
    """Data access repository for ParkingLot entities."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(ParkingLot, db)

    async def get_by_name(self, name: str) -> ParkingLot | None:
        """Fetch a parking lot by its unique name."""
        stmt = select(ParkingLot).where(
            ParkingLot.name == name,
            ParkingLot.deleted_at.is_(None)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()


class ParkingSnapshotRepository(BaseRepository[ParkingSnapshot]):
    """Data access repository for ParkingSnapshot entities."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(ParkingSnapshot, db)

    async def get_latest_by_lot(self, lot_id: str) -> ParkingSnapshot | None:
        """Fetch the most recent parking occupancy snapshot for a specific lot."""
        stmt = (
            select(ParkingSnapshot)
            .where(
                ParkingSnapshot.lot_id == lot_id,
                ParkingSnapshot.deleted_at.is_(None)
            )
            .order_by(desc(ParkingSnapshot.created_at))
            .limit(1)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
