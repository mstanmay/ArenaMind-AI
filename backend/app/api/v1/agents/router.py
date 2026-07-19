"""AI Agents invocation and audit logs API router endpoints."""

from typing import Any
from fastapi import APIRouter, Depends, Security
from langchain_core.messages import HumanMessage
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.core.exceptions import ValidationError
from app.schemas.decision import AIDecisionResponse
from app.repositories.decision import AIDecisionRepository
from app.security.rbac import require_operator, require_viewer
from app.security.ai_guardrails import AIGuardrails
from app.langgraph.graph import agent_workflow

router = APIRouter(tags=["AI Multi-Agent System"])


@router.post("/invoke", response_model=AIDecisionResponse)
async def invoke_multi_agent_system(
    query: str,
    db: AsyncSession = Depends(get_db_session)
) -> dict[str, Any]:
    """Invoke the supervisor multi-agent system with a natural language command."""
    # Run prompt firewall check on query
    AIGuardrails.validate_prompt(query)

    # Initialize Graph State
    initial_state = {
        "messages": [HumanMessage(content=query)],
        "current_agent": "user",
        "context": {},
        "decisions": {},
        "routing_history": [],
        "explainability": {}
    }

    # Run LangGraph Agent Workflow execution
    try:
        final_state = await agent_workflow.ainvoke(initial_state)
    except Exception as e:
        from app.core.exceptions import AgentExecutionError
        raise AgentExecutionError("supervisor", f"Graph invocation failed: {str(e)}")

    # Extract decision outputs populated by specialist node
    decision_payload = final_state.get("decisions", {})
    agent_type = final_state.get("current_agent", "crowd")

    # Persist decision output trace to the audit database
    from app.services.decision_engine import DecisionEngineService
    decision_service = DecisionEngineService(db)
    
    decision_record = await decision_service.create_decision_record(
        agent_type=agent_type,
        query=query,
        decision_data=decision_payload
    )

    return decision_record


@router.get("/decisions", response_model=list[AIDecisionResponse])
async def get_decision_audit_logs(
    limit: int = 20,
    db: AsyncSession = Depends(get_db_session),
    current_user: Any = Security(require_viewer)
) -> list[Any]:
    """Retrieve historically recorded decisions (requires Operator/Viewer privileges)."""
    repo = AIDecisionRepository(db)
    records = await repo.get_recent_decisions(limit=limit)
    return list(records)
