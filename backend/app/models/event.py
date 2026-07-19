"""Stadium Event / Match model."""

from sqlalchemy import String, Integer, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class StadiumEvent(Base):
    __tablename__ = "stadium_events"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False, default="match")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="scheduled")
    home_team: Mapped[str | None] = mapped_column(String(255), nullable=True)
    away_team: Mapped[str | None] = mapped_column(String(255), nullable=True)
    venue: Mapped[str] = mapped_column(String(255), nullable=False, default="Main Stadium")
    expected_attendance: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    actual_attendance: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    start_time: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    end_time: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
