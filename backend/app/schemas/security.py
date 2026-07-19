"""Security incident schemas."""

from datetime import datetime
from pydantic import BaseModel, Field


class SecurityIncidentBase(BaseModel):
    incident_type: str
    severity: str = "medium"
    status: str = "open"
    zone: str
    camera_id: str | None = None
    description: str | None = None
    threat_level: float = 0.0
    assigned_team: str | None = None
    persons_involved: int = 0
    resolution_notes: str | None = None


class SecurityIncidentCreate(SecurityIncidentBase):
    pass


class SecurityIncidentUpdate(BaseModel):
    incident_type: str | None = None
    severity: str | None = None
    status: str | None = None
    zone: str | None = None
    camera_id: str | None = None
    description: str | None = None
    threat_level: float | None = None
    assigned_team: str | None = None
    persons_involved: int | None = None
    resolution_notes: str | None = None


class SecurityIncidentResponse(SecurityIncidentBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
