"""Parking intelligence service layer."""

from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.core.constants import EventType
from app.models.parking import ParkingLot, ParkingSnapshot
from app.repositories.parking import ParkingLotRepository, ParkingSnapshotRepository

logger = get_logger("service_parking")


class ParkingService:
    """Business logic for managing stadium parking lot occupancy."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.lot_repo = ParkingLotRepository(db)
        self.snap_repo = ParkingSnapshotRepository(db)

    async def get_all_lots(self) -> list[ParkingLot]:
        """Fetch all parking lots."""
        results = await self.lot_repo.get_all()
        return list(results)

    async def get_lot_by_name(self, name: str) -> ParkingLot | None:
        """Fetch a lot by name."""
        return await self.lot_repo.get_by_name(name)

    async def create_parking_lot(self, data: dict[str, Any]) -> ParkingLot:
        """Create a new parking lot."""
        lot = ParkingLot(
            name=data["name"],
            zone=data["zone"],
            total_capacity=int(data["total_capacity"]),
            current_occupancy=int(data.get("current_occupancy", 0)),
            vip_spots=int(data.get("vip_spots", 0)),
            disabled_spots=int(data.get("disabled_spots", 0)),
            ev_charging_spots=int(data.get("ev_charging_spots", 0)),
            hourly_rate=float(data.get("hourly_rate", 10.0)),
            status=data.get("status", "open")
        )
        await self.lot_repo.create(lot)
        return lot

    async def update_occupancy(self, lot_id: str, new_occupancy: int) -> ParkingLot | None:
        """Update occupancy metrics and publish status update events."""
        lot = await self.lot_repo.get_by_id(lot_id)
        if not lot:
            return None

        await self.lot_repo.update(lot_id, {"current_occupancy": new_occupancy})
        
        # Publish event
        try:
            from app.events.bus import get_event_bus
            bus = await get_event_bus()
            await bus.publish(
                EventType.PARKING_STATUS_CHANGED,
                {
                    "lot_id": lot.id,
                    "lot_name": lot.name,
                    "current_occupancy": new_occupancy,
                    "occupancy_percent": lot.occupancy_percent
                }
            )
        except Exception as e:
            logger.error("failed_to_publish_parking_event", error=str(e))

        return lot
