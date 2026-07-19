"""Security incident model."""

from sqlalchemy import String, Text, Integer, Float, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SecurityIncident(Base):
    __tablename__ = "security_incidents"

    incident_type: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False, default="medium")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="open")
    zone: Mapped[str] = mapped_column(String(100), nullable=False)
    camera_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    threat_level: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    assigned_team: Mapped[str | None] = mapped_column(String(100), nullable=True)
    persons_involved: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    resolution_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    __table_args__ = (
        Index("ix_security_severity_status", "severity", "status"),
    )
