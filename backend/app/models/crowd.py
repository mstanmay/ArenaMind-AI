"""Crowd density snapshot model."""

from sqlalchemy import String, Float, Integer, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class CrowdSnapshot(Base):
    __tablename__ = "crowd_snapshots"

    zone: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    zone_type: Mapped[str] = mapped_column(String(50), nullable=False)
    density_percent: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    headcount: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=1000)
    flow_rate: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False, default="low")
    source: Mapped[str] = mapped_column(String(50), nullable=False, default="sensor")

    __table_args__ = (
        Index("ix_crowd_zone_created", "zone", "created_at"),
    )
