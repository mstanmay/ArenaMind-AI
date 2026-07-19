"""Notification model."""

from sqlalchemy import String, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    notification_type: Mapped[str] = mapped_column(String(50), nullable=False, default="info")
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="medium")
    target_role: Mapped[str | None] = mapped_column(String(50), nullable=True)
    target_user_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    source_agent: Mapped[str | None] = mapped_column(String(50), nullable=True)
    action_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
