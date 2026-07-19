"""Stadium events and matches validation schemas."""

from datetime import datetime
from pydantic import BaseModel, Field


class StadiumEventBase(BaseModel):
    name: str
    event_type: str = "match"
    status: str = "scheduled"
    home_team: str | None = None
    away_team: str | None = None
    venue: str = "Main Stadium"
    expected_attendance: int = 0
    actual_attendance: int = 0
    start_time: datetime | None = None
    end_time: datetime | None = None
    description: str | None = None


class StadiumEventCreate(StadiumEventBase):
    pass


class StadiumEventUpdate(BaseModel):
    name: str | None = None
    event_type: str | None = None
    status: str | None = None
    home_team: str | None = None
    away_team: str | None = None
    venue: str | None = None
    expected_attendance: int | None = None
    actual_attendance: int | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    description: str | None = None


class StadiumEventResponse(StadiumEventBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
