"""AI Decision Engine service for formatting, persisting, and publishing agent decisions."""

from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.core.constants import EventType
from app.models.ai_decision import AIDecision
from app.repositories.decision import AIDecisionRepository
from app.langgraph.memory.vector_memory import VectorMemory

logger = get_logger("decision_engine")


class DecisionEngineService:
    """The central brain for processing and validating AI decisions.

    Persists decisions in both relational PostgreSQL/SQLite DB and Qdrant vector memory,
    then dispatches events to the Redis Pub/Sub layer.
    """

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = AIDecisionRepository(db)
        self.vector_memory = VectorMemory()

    async def create_decision_record(
        self,
        agent_type: str,
        query: str,
        decision_data: dict[str, Any]
    ) -> AIDecision:
        """Process, validate, format and persist an AI decision output."""
        logger.info("processing_ai_decision", agent_type=agent_type, query=query[:50])

        # Prepare database ORM entity
        decision = AIDecision(
            agent_type=agent_type,
            query=query,
            reason=decision_data.get("reason", "No reason provided."),
            confidence=float(decision_data.get("confidence", 1.0)),
            evidence=decision_data.get("evidence", {}),
            recommended_actions=decision_data.get("recommended_actions", []),
            affected_entities=decision_data.get("affected_entities", []),
            priority=decision_data.get("priority", "medium"),
            estimated_impact=decision_data.get("estimated_impact", "None"),
            status="approved" if float(decision_data.get("confidence", 1.0)) >= 0.75 else "pending"
        )

        # Save to SQL DB
        await self.repo.create(decision)

        # ── Database Audit Log Anchor ──────────────────────
        try:
            from app.models.audit_log import AuditLog
            audit_log = AuditLog(
                action="ai_decision_made",
                entity_type="ai_decision",
                entity_id=decision.id,
                actor_id=decision.executed_by,
                actor_type="system",
                ip_address=None,
                user_agent="decision_engine",
                details=f"AI Copilot made decision for agent {decision.agent_type} with confidence {decision.confidence}."
            )
            self.db.add(audit_log)
            await self.db.flush()
            logger.info("ai_decision_audit_logged", decision_id=decision.id)
        except Exception as e:
            logger.error("ai_decision_audit_logging_failed", decision_id=decision.id, error=str(e))
        
        # Save to Qdrant vector memory asynchronously for past similarity context checks
        await self.vector_memory.store_decision(
            decision_id=decision.id,
            query=query,
            reasoning=decision.reason,
            metadata={
                "agent_type": agent_type,
                "priority": decision.priority,
                "confidence": decision.confidence
            }
        )

        # Dispatch real-time event to Redis Pub/Sub
        await self._publish_decision_event(decision)

        return decision

    async def _publish_decision_event(self, decision: AIDecision) -> None:
        """Publish the decision event payload to Redis Pub/Sub."""
        try:
            from app.events.bus import get_event_bus
            bus = await get_event_bus()
            
            payload = {
                "decision_id": decision.id,
                "agent_type": decision.agent_type,
                "query": decision.query,
                "reason": decision.reason,
                "priority": decision.priority,
                "recommended_actions": decision.recommended_actions,
            }
            
            await bus.publish(EventType.AI_DECISION_MADE, payload)
            logger.info("decision_event_published", decision_id=decision.id)
        except Exception as e:
            # Fall open but log warning if event bus is unavailable
            logger.error("failed_to_publish_decision_event", error=str(e))
