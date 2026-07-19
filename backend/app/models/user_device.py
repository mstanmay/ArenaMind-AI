"""User device model — trusted device management and fingerprinting."""

from datetime import datetime

from sqlalchemy import String, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class UserDevice(Base):
    __tablename__ = "user_devices"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    device_fingerprint: Mapped[str] = mapped_column(String(255), nullable=False)
    device_name: Mapped[str] = mapped_column(String(255), nullable=False, default="Unknown Device")
    is_trusted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    trusted_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)

    __table_args__ = (
        Index("ix_user_devices_user_fp", "user_id", "device_fingerprint", unique=True),
    )

    def __repr__(self) -> str:
        return f"<UserDevice user={self.user_id} name={self.device_name} trusted={self.is_trusted}>"
