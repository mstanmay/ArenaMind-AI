"""AI Decision repository implementation."""

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_decision import AIDecision
from app.repositories.base import BaseRepository


class AIDecisionRepository(BaseRepository[AIDecision]):
    """Data access repository for AIDecision entities."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(AIDecision, db)

    async def get_recent_decisions(self, limit: int = 20) -> list[AIDecision]:
        """Fetch the most recently recorded decisions."""
        stmt = (
            select(AIDecision)
            .where(AIDecision.deleted_at.is_(None))
            .order_by(desc(AIDecision.created_at))
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_agent(self, agent_type: str, limit: int = 20) -> list[AIDecision]:
        """Fetch decisions made by a specific specialist agent."""
        stmt = (
            select(AIDecision)
            .where(
                AIDecision.agent_type == agent_type,
                AIDecision.deleted_at.is_(None)
            )
            .order_by(desc(AIDecision.created_at))
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
