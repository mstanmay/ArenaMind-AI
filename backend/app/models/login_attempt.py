"""Login attempt model — tracks authentication attempts for security audit and lockout."""

from sqlalchemy import String, Boolean, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class LoginAttempt(Base):
    __tablename__ = "login_attempts"

    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    success: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    failure_reason: Mapped[str | None] = mapped_column(String(255), nullable=True)

    __table_args__ = (
        Index("ix_login_attempts_email_time", "email", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<LoginAttempt email={self.email} success={self.success}>"
