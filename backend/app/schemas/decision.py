"""AI Decision explainability schemas."""

from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field


class AIDecisionCreate(BaseModel):
    agent_type: str
    query: str
    reason: str
    confidence: float
    evidence: dict[str, Any] | None = None
    recommended_actions: list[str] | None = None
    affected_entities: list[str] | None = None
    priority: str = "medium"
    estimated_impact: str | None = None
    status: str = "pending"
    raw_llm_response: str | None = None
    tokens_used: int | None = None
    latency_ms: float | None = None


class AIDecisionUpdate(BaseModel):
    status: str | None = None
    executed_by: str | None = None
    execution_notes: str | None = None


class AIDecisionResponse(BaseModel):
    id: str
    agent_type: str
    query: str
    reason: str
    confidence: float
    evidence: dict[str, Any] | None = None
    recommended_actions: list[str] | None = None
    affected_entities: list[str] | None = None
    priority: str
    estimated_impact: str | None = None
    status: str
    executed_by: str | None = None
    execution_notes: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
