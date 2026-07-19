"""LangGraph State definition for the multi-agent system."""

from typing import Annotated, Any, Sequence, TypedDict
from langchain_core.messages import BaseMessage
from langgraph.prebuilt import InjectedState


def merge_dicts(left: dict[str, Any], right: dict[str, Any]) -> dict[str, Any]:
    """Reducer function to merge updates into a state dictionary."""
    return {**left, **right}


class AgentState(TypedDict):
    """Shared state representation passed between supervisor and specialist agents."""

    # Chat history conversation messages
    messages: Sequence[BaseMessage]

    # The current active agent executing
    current_agent: str

    # Global context variables (e.g. current_time, active_match_id)
    context: Annotated[dict[str, Any], merge_dicts]

    # Shared decision payload populated by specialist agents
    decisions: Annotated[dict[str, Any], merge_dicts]

    # History of agent path traversal
    routing_history: Annotated[list[str], lambda left, right: left + right]

    # Explainability details populated by specialists
    explainability: Annotated[dict[str, Any], merge_dicts]
