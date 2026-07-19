"""Parking lot and parking snapshot models."""

from sqlalchemy import String, Integer, Float, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ParkingLot(Base):
    __tablename__ = "parking_lots"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    zone: Mapped[str] = mapped_column(String(100), nullable=False)
    total_capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=500)
    current_occupancy: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    vip_spots: Mapped[int] = mapped_column(Integer, nullable=False, default=50)
    disabled_spots: Mapped[int] = mapped_column(Integer, nullable=False, default=20)
    ev_charging_spots: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    hourly_rate: Mapped[float] = mapped_column(Float, nullable=False, default=10.0)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="open")

    snapshots = relationship("ParkingSnapshot", back_populates="lot", lazy="selectin")

    @property
    def occupancy_percent(self) -> float:
        if self.total_capacity == 0:
            return 0.0
        return round((self.current_occupancy / self.total_capacity) * 100, 1)


class ParkingSnapshot(Base):
    __tablename__ = "parking_snapshots"

    lot_id: Mapped[str] = mapped_column(String(36), ForeignKey("parking_lots.id"), nullable=False)
    occupancy: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    entries_last_hour: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    exits_last_hour: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    predicted_full_time: Mapped[str | None] = mapped_column(String(50), nullable=True)

    lot = relationship("ParkingLot", back_populates="snapshots")

    __table_args__ = (
        Index("ix_parking_snap_lot_created", "lot_id", "created_at"),
    )
