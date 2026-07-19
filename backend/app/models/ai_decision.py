"""AI Decision audit log — records every AI decision with full explainability and blockchain verification."""

from sqlalchemy import String, Float, Boolean, Text, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AIDecision(Base):
    __tablename__ = "ai_decisions"

    agent_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    query: Mapped[str] = mapped_column(Text, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    evidence: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    recommended_actions: Mapped[list | None] = mapped_column(JSON, nullable=True)
    affected_entities: Mapped[list | None] = mapped_column(JSON, nullable=True)
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="medium")
    estimated_impact: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")
    executed_by: Mapped[str | None] = mapped_column(String(36), nullable=True)
    execution_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    raw_llm_response: Mapped[str | None] = mapped_column(Text, nullable=True)
    tokens_used: Mapped[int | None] = mapped_column(nullable=True)
    latency_ms: Mapped[float | None] = mapped_column(Float, nullable=True)

    __table_args__ = (
        Index("ix_ai_decisions_agent_status", "agent_type", "status"),
        Index("ix_ai_decisions_priority", "priority"),
    )
