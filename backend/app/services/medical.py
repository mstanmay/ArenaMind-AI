"""Medical dispatch service layer."""

from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.core.constants import EventType
from app.models.medical import MedicalIncident
from app.repositories.medical import MedicalIncidentRepository

logger = get_logger("service_medical")


class MedicalService:
    """Business logic for first-aid dispatches and triage teams routing."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = MedicalIncidentRepository(db)

    async def get_all_incidents(self) -> list[MedicalIncident]:
        """Fetch all medical incidents."""
        results = await self.repo.get_all()
        return list(results)

    async def create_incident(self, data: dict[str, Any]) -> MedicalIncident:
        """Create a medical incident and publish dispatcher notifications."""
        logger.info("creating_medical_incident", type=data.get("incident_type"))

        incident = MedicalIncident(
            incident_type=data["incident_type"],
            severity=data.get("severity", "medium"),
            status=data.get("status", "reported"),
            zone=data["zone"],
            section=data.get("section"),
            patient_count=int(data.get("patient_count", 1)),
            description=data.get("description"),
            response_team=data.get("response_team")
        )
        
        await self.repo.create(incident)

        # Publish medical dispatch event
        try:
            from app.events.bus import get_event_bus
            bus = await get_event_bus()
            await bus.publish(
                EventType.MEDICAL_DISPATCH,
                {
                    "incident_id": incident.id,
                    "incident_type": incident.incident_type,
                    "zone": incident.zone,
                    "severity": incident.severity,
                    "patient_count": incident.patient_count
                }
            )
        except Exception as e:
            logger.error("failed_to_publish_medical_event", error=str(e))

        return incident

    async def update_incident(self, incident_id: str, values: dict[str, Any]) -> MedicalIncident | None:
        """Update a medical incident's details."""
        return await self.repo.update(incident_id, values)
