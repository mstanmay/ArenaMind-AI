"""Crowd density snapshot schemas."""

from datetime import datetime
from pydantic import BaseModel, Field


class CrowdSnapshotBase(BaseModel):
    zone: str
    zone_type: str
    density_percent: float = Field(..., ge=0.0, le=100.0)
    headcount: int = Field(..., ge=0)
    capacity: int = Field(..., gt=0)
    flow_rate: float = 0.0
    risk_level: str = "low"
    source: str = "sensor"


class CrowdSnapshotCreate(CrowdSnapshotBase):
    pass


class CrowdSnapshotResponse(CrowdSnapshotBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
