"""Audit log model — immutable record of every significant system action with cryptographic verification."""

from sqlalchemy import String, Boolean, Text, JSON, event
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    actor_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    actor_type: Mapped[str] = mapped_column(String(20), nullable=False, default="user")
    changes: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    details: Mapped[str | None] = mapped_column(Text, nullable=True)
    signature: Mapped[str | None] = mapped_column(String(64), nullable=True)


@event.listens_for(AuditLog, "before_insert")
def set_audit_log_signature(mapper, connection, target: AuditLog) -> None:
    """Automatically sign the AuditLog record before inserting."""
    from app.security.integrity import compute_audit_log_signature
    target.signature = compute_audit_log_signature(target)


