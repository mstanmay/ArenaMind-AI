"""Medical incident model."""

from sqlalchemy import String, Text, Integer, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class MedicalIncident(Base):
    __tablename__ = "medical_incidents"

    incident_type: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False, default="medium")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="reported")
    zone: Mapped[str] = mapped_column(String(100), nullable=False)
    section: Mapped[str | None] = mapped_column(String(50), nullable=True)
    patient_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    response_team: Mapped[str | None] = mapped_column(String(100), nullable=True)
    response_time_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    resolution_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    __table_args__ = (
        Index("ix_medical_severity_status", "severity", "status"),
    )
