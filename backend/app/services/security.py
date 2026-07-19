"""Security center service layer."""

from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.core.constants import EventType
from app.models.security_incident import SecurityIncident
from app.repositories.security import SecurityIncidentRepository

logger = get_logger("service_security")


class SecurityService:
    """Business logic for security incident alerts and CCTV monitorings."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = SecurityIncidentRepository(db)

    async def get_all_incidents(self) -> list[SecurityIncident]:
        """Fetch all security incidents."""
        results = await self.repo.get_all()
        return list(results)

    async def create_incident(self, data: dict[str, Any]) -> SecurityIncident:
        """Create a security incident and publish an emergency trigger event if critical."""
        logger.info("creating_security_incident", type=data.get("incident_type"))

        incident = SecurityIncident(
            incident_type=data["incident_type"],
            severity=data.get("severity", "medium"),
            status=data.get("status", "open"),
            zone=data["zone"],
            camera_id=data.get("camera_id"),
            description=data.get("description"),
            threat_level=float(data.get("threat_level", 0.0)),
            assigned_team=data.get("assigned_team"),
            persons_involved=int(data.get("persons_involved", 0))
        )
        
        await self.repo.create(incident)

        # Publish security alert event
        try:
            from app.events.bus import get_event_bus
            bus = await get_event_bus()
            
            # Publish emergency trigger if critical severity
            if incident.severity == "critical":
                await bus.publish(
                    EventType.EMERGENCY_TRIGGERED,
                    {
                        "incident_id": incident.id,
                        "incident_type": incident.incident_type,
                        "zone": incident.zone,
                        "severity": incident.severity
                    }
                )
            else:
                await bus.publish(
                    EventType.SECURITY_ALERT,
                    {
                        "incident_id": incident.id,
                        "incident_type": incident.incident_type,
                        "zone": incident.zone,
                        "severity": incident.severity,
                        "threat_level": incident.threat_level
                    }
                )
        except Exception as e:
            logger.error("failed_to_publish_security_event", error=str(e))

        return incident

    async def update_incident_status(self, incident_id: str, values: dict[str, Any]) -> SecurityIncident | None:
        """Update a security incident's state details."""
        return await self.repo.update(incident_id, values)
