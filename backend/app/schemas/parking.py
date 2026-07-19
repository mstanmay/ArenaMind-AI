"""Parking lot and snapshot schemas."""

from datetime import datetime
from pydantic import BaseModel, Field


class ParkingSnapshotBase(BaseModel):
    occupancy: int = Field(..., ge=0)
    entries_last_hour: int = 0
    exits_last_hour: int = 0
    predicted_full_time: str | None = None


class ParkingSnapshotCreate(ParkingSnapshotBase):
    lot_id: str


class ParkingSnapshotResponse(ParkingSnapshotBase):
    id: str
    lot_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class ParkingLotBase(BaseModel):
    name: str
    zone: str
    total_capacity: int = Field(..., gt=0)
    current_occupancy: int = Field(0, ge=0)
    vip_spots: int = 0
    disabled_spots: int = 0
    ev_charging_spots: int = 0
    hourly_rate: float = 0.0
    status: str = "open"


class ParkingLotCreate(ParkingLotBase):
    pass


class ParkingLotUpdate(BaseModel):
    name: str | None = None
    zone: str | None = None
    total_capacity: int | None = None
    current_occupancy: int | None = None
    vip_spots: int | None = None
    disabled_spots: int | None = None
    ev_charging_spots: int | None = None
    hourly_rate: float | None = None
    status: str | None = None


class ParkingLotResponse(ParkingLotBase):
    id: str
    created_at: datetime
    updated_at: datetime
    occupancy_percent: float

    class Config:
        from_attributes = True
