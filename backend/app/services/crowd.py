"""Crowd intelligence service layer."""

from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.core.constants import EventType
from app.models.crowd import CrowdSnapshot
from app.repositories.crowd import CrowdSnapshotRepository

logger = get_logger("service_crowd")


class CrowdService:
    """Business logic for monitoring concourse wait times and gate headcounts."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = CrowdSnapshotRepository(db)

    async def get_all_snapshots(self, skip: int = 0, limit: int = 100) -> list[CrowdSnapshot]:
        """Fetch all crowd snapshots paginated."""
        results = await self.repo.get_all(skip=skip, limit=limit)
        return list(results)

    async def get_zone_telemetry(self, zone: str) -> CrowdSnapshot | None:
        """Fetch the latest telemetry snapshot for a specific zone."""
        return await self.repo.get_latest_by_zone(zone)

    async def create_snapshot(self, snapshot_data: dict[str, Any]) -> CrowdSnapshot:
        """Create a new crowd density snapshot and publish an event to the EventBus."""
        logger.info("creating_crowd_snapshot", zone=snapshot_data.get("zone"))
        
        snap = CrowdSnapshot(
            zone=snapshot_data["zone"],
            zone_type=snapshot_data["zone_type"],
            density_percent=float(snapshot_data["density_percent"]),
            headcount=int(snapshot_data["headcount"]),
            capacity=int(snapshot_data["capacity"]),
            flow_rate=float(snapshot_data.get("flow_rate", 0.0)),
            risk_level=snapshot_data.get("risk_level", "low"),
            source=snapshot_data.get("source", "sensor")
        )
        
        await self.repo.create(snap)

        # Publish the event to the EventBus
        try:
            from app.events.bus import get_event_bus
            bus = await get_event_bus()
            await bus.publish(
                EventType.CROWD_DENSITY_UPDATED,
                {
                    "snapshot_id": snap.id,
                    "zone": snap.zone,
                    "density_percent": snap.density_percent,
                    "headcount": snap.headcount
                }
            )
        except Exception as e:
            logger.error("failed_to_publish_crowd_event", error=str(e))

        return snap
