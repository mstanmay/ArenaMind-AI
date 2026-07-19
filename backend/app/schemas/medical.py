"""Medical incident schemas."""

from datetime import datetime
from pydantic import BaseModel, Field


class MedicalIncidentBase(BaseModel):
    incident_type: str
    severity: str = "medium"
    status: str = "reported"
    zone: str
    section: str | None = None
    patient_count: int = 1
    description: str | None = None
    response_team: str | None = None
    response_time_seconds: int | None = None
    resolution_notes: str | None = None


class MedicalIncidentCreate(MedicalIncidentBase):
    pass


class MedicalIncidentUpdate(BaseModel):
    incident_type: str | None = None
    severity: str | None = None
    status: str | None = None
    zone: str | None = None
    section: str | None = None
    patient_count: int | None = None
    description: str | None = None
    response_team: str | None = None
    response_time_seconds: int | None = None
    resolution_notes: str | None = None


class MedicalIncidentResponse(MedicalIncidentBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
