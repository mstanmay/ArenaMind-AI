"""LangGraph Supervisor Agent node definition."""

from typing import Any
from langchain_core.messages import AIMessage, HumanMessage

from app.core.logging import get_logger
from app.langgraph.state import AgentState
from app.langgraph.prompts.agents_prompts import SUPERVISOR_PROMPT
from app.langgraph.agents.specialists import get_agent_llm

logger = get_logger("supervisor")


class SupervisorMockLLM:
    """Mock LLM specific to Supervisor intent classification."""

    async def ainvoke(self, messages: list[Any]) -> AIMessage:
        # Determine the user's latest query
        user_query = ""
        for m in reversed(messages):
            if isinstance(m, HumanMessage) or (isinstance(m, dict) and m.get("type") == "human"):
                user_query = m.content if hasattr(m, "content") else str(m.get("content", ""))
                break

        query_lower = user_query.lower()
        
        # Route to specialists based on simple keywords
        if "crowd" in query_lower or "concourse" in query_lower or "turnstile" in query_lower or "headcount" in query_lower:
            next_agent = "crowd"
        elif "parking" in query_lower or "lot" in query_lower or "spots" in query_lower:
            next_agent = "parking"
        elif "traffic" in query_lower or "road" in query_lower or "ingress" in query_lower:
            next_agent = "traffic"
        elif "security" in query_lower or "sensor" in query_lower or "cctv" in query_lower or "breach" in query_lower:
            next_agent = "security"
        elif "medical" in query_lower or "injury" in query_lower or "medic" in query_lower or "heart" in query_lower or "hurt" in query_lower:
            next_agent = "medical"
        elif "food" in query_lower or "vendor" in query_lower or "booth" in query_lower or "stock" in query_lower or "sales" in query_lower:
            next_agent = "vendor"
        elif "weather" in query_lower or "rain" in query_lower or "lightning" in query_lower or "roof" in query_lower:
            next_agent = "weather"
        elif "match" in query_lower or "tournament" in query_lower or "game" in query_lower or "referee" in query_lower:
            next_agent = "tournament"
        elif "energy" in query_lower or "power" in query_lower or "battery" in query_lower or "solar" in query_lower:
            next_agent = "energy"
        elif "evacuate" in query_lower or "evacuation" in query_lower or "emergency" in query_lower:
            next_agent = "emergency"
        elif "route" in query_lower or "navigation" in query_lower or "path" in query_lower:
            next_agent = "navigation"
        elif "voice" in query_lower or "radio" in query_lower or "transcribe" in query_lower:
            next_agent = "voice"
        elif "vip" in query_lower or "suite" in query_lower:
            next_agent = "vip"
        elif "analytics" in query_lower or "trend" in query_lower or "report" in query_lower:
            next_agent = "analytics"
        else:
            # Fallback to crowd agent or end
            next_agent = "crowd"

        logger.info("supervisor_mock_routing", query=user_query[:50], routed_to=next_agent)
        return AIMessage(content=next_agent)


async def supervisor_node(state: AgentState) -> dict[str, Any]:
    """Execute the supervisor classifier to route the query to the correct specialist."""
    logger.info("executing_supervisor_node")
    
    from app.core.config import get_settings
    settings = get_settings()

    if settings.llm_provider == "mock":
        llm = SupervisorMockLLM()
    else:
        llm = get_agent_llm(SUPERVISOR_PROMPT)

    last_message = state["messages"][-1]
    
    # Prompt context
    messages = [
        AIMessage(content=SUPERVISOR_PROMPT),
        HumanMessage(content=str(last_message.content))
    ]

    try:
        response = await llm.ainvoke(messages)
        next_agent = str(response.content).strip().lower()
    except Exception as e:
        logger.error("supervisor_node_llm_failed", error=str(e))
        next_agent = "crowd"  # Default fallback

    # Validate next_agent value is an expected specialist agent
    expected_agents = [
        "crowd", "parking", "traffic", "security", "medical", 
        "vendor", "weather", "tournament", "energy", 
        "emergency", "navigation", "voice", "vip", "analytics"
    ]
    if next_agent not in expected_agents:
        next_agent = "crowd"

    return {
        "current_agent": "supervisor",
        "routing_history": ["supervisor"],
        "context": {
            "routed_agent": next_agent
        }
    }
