"""Individual specialist agent node definitions for the LangGraph workflow."""

import json
from typing import Any
from langchain_core.messages import AIMessage, HumanMessage

from app.core.config import get_settings
from app.core.logging import get_logger
from app.langgraph.state import AgentState
from app.langgraph.prompts.agents_prompts import (
    CROWD_PROMPT,
    PARKING_PROMPT,
    TRAFFIC_PROMPT,
    SECURITY_PROMPT,
    MEDICAL_PROMPT,
    VENDOR_PROMPT,
    WEATHER_PROMPT,
    TOURNAMENT_PROMPT,
    ENERGY_PROMPT,
    EMERGENCY_PROMPT,
    NAVIGATION_PROMPT,
    VOICE_PROMPT,
    VIP_PROMPT,
    ANALYTICS_PROMPT
)

logger = get_logger("specialist_agents")


class MockChatModel:
    """Mock LLM chat provider for lightweight execution without API keys."""

    def __init__(self, system_prompt: str) -> None:
        self.system_prompt = system_prompt

    async def ainvoke(self, messages: list[Any]) -> AIMessage:
        # Generate smart mockup responses based on the specialist agent's system prompt
        content = "Understood. Analyzing telemetry..."
        
        # Determine the user's latest query
        user_query = ""
        for m in reversed(messages):
            if isinstance(m, HumanMessage) or (isinstance(m, dict) and m.get("type") == "human"):
                user_query = m.content if hasattr(m, "content") else str(m.get("content", ""))
                break

        # Generate custom mock output according to specialist domains
        if "crowd" in self.system_prompt.lower():
            content = json.dumps({
                "reason": "Elevated density levels detected near entrance gates.",
                "confidence": 0.94,
                "evidence": {"gate_4_occupancy": "92%", "turnstile_flow_rate": "12 fans/min"},
                "recommended_actions": ["Divert arrival flows from Gate 4 to Gate 2.", "Open overflow turnstiles 8-12."],
                "affected_entities": ["Gate 4 concourse", "North Stand tickets"],
                "priority": "high",
                "estimated_impact": "Reduces ticket queue wait times to less than 4 minutes within 10 minutes of execution."
            })
        elif "parking" in self.system_prompt.lower():
            content = json.dumps({
                "reason": "Lot B capacity has breached the 90% utilization threshold.",
                "confidence": 0.89,
                "evidence": {"lot_b_capacity": "95% (475/500 spots filled)"},
                "recommended_actions": ["Activate Lot C overflow boards.", "Redirect incoming VIPs to Lot A reserved spots."],
                "affected_entities": ["Parking Lot B", "Access Road 1"],
                "priority": "medium",
                "estimated_impact": "Prevents traffic backups on adjacent public lanes."
            })
        elif "security" in self.system_prompt.lower():
            content = json.dumps({
                "reason": "Unscheduled sensor activity triggered in zone Exit 2.",
                "confidence": 0.91,
                "evidence": {"sensor_id": "SEC_DOOR_E2", "camera_feed": "CCTV_42_LINE_CROSS"},
                "recommended_actions": ["Dispatch security response unit 3 to inspect Exit 2 door locking mechanism.", "Increase camera resolution focus on sector E2."],
                "affected_entities": ["Sector E2 concourse"],
                "priority": "high",
                "estimated_impact": "Ensures immediate threat mitigation and zone containment verification."
            })
        elif "medical" in self.system_prompt.lower():
            content = json.dumps({
                "reason": "First-aid dispatch request for respiratory distress report.",
                "confidence": 0.95,
                "evidence": {"location": "Section 108", "reports_received": 2},
                "recommended_actions": ["Dispatch Medical Response Team 1 with standard kit.", "Notify Medical Bay A of incoming patient triage."],
                "affected_entities": ["Section 108 Stand", "Medics Team 1"],
                "priority": "critical",
                "estimated_impact": "Team arrival within 180 seconds, ensuring immediate clinical evaluation."
            })
        elif "emergency" in self.system_prompt.lower():
            content = json.dumps({
                "reason": "Critical threat validation requiring emergency protocol deployment.",
                "confidence": 0.99,
                "evidence": {"system_triggers": ["manual_override"], "alert_level": "life_safety"},
                "recommended_actions": ["Initiate partial evacuation protocol for North Concourse.", "Broadcast emergency audio instructions.", "Dispatch first responders to zone exits."],
                "affected_entities": ["Stadium North Sector"],
                "priority": "critical",
                "estimated_impact": "Secures immediate safety evacuation of impacted individuals."
            })
        else:
            # Fallback mock decision engine response
            content = json.dumps({
                "reason": "Telemetry processing completed.",
                "confidence": 0.85,
                "evidence": {"status": "normal"},
                "recommended_actions": ["Maintain normal monitoring patterns."],
                "affected_entities": ["All sectors"],
                "priority": "low",
                "estimated_impact": "None"
            })

        return AIMessage(content=content)


def get_agent_llm(system_prompt: str) -> Any:
    """Return the configured LLM client based on application configuration settings."""
    settings = get_settings()
    if settings.llm_provider == "openai" and settings.openai_api_key:
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=settings.openai_model,
            openai_api_key=settings.openai_api_key,
            temperature=0.1
        )
    elif settings.llm_provider == "gemini" and settings.google_api_key:
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model=settings.google_model,
            google_api_key=settings.google_api_key,
            temperature=0.1
        )
    else:
        return MockChatModel(system_prompt)


# Specialist Node implementation helper
async def run_specialist_node(
    state: AgentState,
    agent_name: str,
    system_prompt: str
) -> dict[str, Any]:
    """Execute a specialist agent node using the appropriate system prompt."""
    logger.info("executing_specialist_node", agent=agent_name)
    
    # Instantiate LLM
    llm = get_agent_llm(system_prompt)

    # Fetch last message
    last_message = state["messages"][-1]
    
    # Build prompt input
    messages = [
        AIMessage(content=f"System context: {system_prompt}"),
        HumanMessage(content=str(last_message.content))
    ]

    try:
        response = await llm.ainvoke(messages)
        parsed_decision = json.loads(str(response.content))
    except Exception as e:
        # Fallback if LLM output isn't JSON
        logger.error("agent_output_json_parsing_failed", agent=agent_name, error=str(e))
        parsed_decision = {
            "reason": f"Agent failed to construct structured output. Raw response: {getattr(response, 'content', str(e))}",
            "confidence": 0.5,
            "evidence": {},
            "recommended_actions": ["Inspect agent telemetry logs."],
            "affected_entities": [],
            "priority": "medium",
            "estimated_impact": "None"
        }

    # Verify output against guardrails
    from app.security.ai_guardrails import AIGuardrails
    try:
        AIGuardrails.validate_output(parsed_decision, parsed_decision.get("confidence", 1.0))
    except Exception as exc:
        parsed_decision = {
            "reason": f"AI security alert: Output blocked by guardrails ({str(exc)}).",
            "confidence": 0.1,
            "evidence": {},
            "recommended_actions": ["Follow standard operating procedure overrides."],
            "affected_entities": [],
            "priority": "critical",
            "estimated_impact": "None"
        }

    # Return state update updates
    return {
        "current_agent": agent_name,
        "decisions": parsed_decision,
        "routing_history": [agent_name],
        "explainability": {
            agent_name: {
                "reasoning": parsed_decision.get("reason"),
                "confidence": parsed_decision.get("confidence"),
                "evidence": parsed_decision.get("evidence")
            }
        }
    }


# Individual Specialist Agent Node Functions
async def crowd_agent_node(state: AgentState) -> dict[str, Any]:
    return await run_specialist_node(state, "crowd", CROWD_PROMPT)


async def parking_agent_node(state: AgentState) -> dict[str, Any]:
    return await run_specialist_node(state, "parking", PARKING_PROMPT)


async def traffic_agent_node(state: AgentState) -> dict[str, Any]:
    return await run_specialist_node(state, "traffic", TRAFFIC_PROMPT)


async def security_agent_node(state: AgentState) -> dict[str, Any]:
    return await run_specialist_node(state, "security", SECURITY_PROMPT)


async def medical_agent_node(state: AgentState) -> dict[str, Any]:
    return await run_specialist_node(state, "medical", MEDICAL_PROMPT)


async def vendor_agent_node(state: AgentState) -> dict[str, Any]:
    return await run_specialist_node(state, "vendor", VENDOR_PROMPT)


async def weather_agent_node(state: AgentState) -> dict[str, Any]:
    return await run_specialist_node(state, "weather", WEATHER_PROMPT)


async def tournament_agent_node(state: AgentState) -> dict[str, Any]:
    return await run_specialist_node(state, "tournament", TOURNAMENT_PROMPT)


async def energy_agent_node(state: AgentState) -> dict[str, Any]:
    return await run_specialist_node(state, "energy", ENERGY_PROMPT)


async def emergency_agent_node(state: AgentState) -> dict[str, Any]:
    return await run_specialist_node(state, "emergency", EMERGENCY_PROMPT)


async def navigation_agent_node(state: AgentState) -> dict[str, Any]:
    return await run_specialist_node(state, "navigation", NAVIGATION_PROMPT)


async def voice_agent_node(state: AgentState) -> dict[str, Any]:
    return await run_specialist_node(state, "voice", VOICE_PROMPT)


async def vip_agent_node(state: AgentState) -> dict[str, Any]:
    return await run_specialist_node(state, "vip", VIP_PROMPT)


async def analytics_agent_node(state: AgentState) -> dict[str, Any]:
    return await run_specialist_node(state, "analytics", ANALYTICS_PROMPT)
