"""Audit log repository implementation."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog
from app.repositories.base import BaseRepository


class AuditLogRepository(BaseRepository[AuditLog]):
    """Data access repository for AuditLog entities."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(AuditLog, db)

    async def get_by_entity(self, entity_type: str, entity_id: str) -> list[AuditLog]:
        """Fetch all audit trail entries referencing a specific entity ID."""
        stmt = select(AuditLog).where(
            AuditLog.entity_type == entity_type,
            AuditLog.entity_id == entity_id,
            AuditLog.deleted_at.is_(None)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
