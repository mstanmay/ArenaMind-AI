"""Compiled LangGraph workflow configuration and node wiring."""

from typing import Any
from langgraph.graph import StateGraph, END

from app.langgraph.state import AgentState
from app.langgraph.supervisor import supervisor_node
from app.langgraph.agents.specialists import (
    crowd_agent_node,
    parking_agent_node,
    traffic_agent_node,
    security_agent_node,
    medical_agent_node,
    vendor_agent_node,
    weather_agent_node,
    tournament_agent_node,
    energy_agent_node,
    emergency_agent_node,
    navigation_agent_node,
    voice_agent_node,
    vip_agent_node,
    analytics_agent_node
)


def route_next_agent(state: AgentState) -> str:
    """Conditional router edge evaluating the supervisor's output context."""
    routed = state.get("context", {}).get("routed_agent")
    if routed in [
        "crowd", "parking", "traffic", "security", "medical", 
        "vendor", "weather", "tournament", "energy", 
        "emergency", "navigation", "voice", "vip", "analytics"
    ]:
        return str(routed)
    return END


# Define the workflow StateGraph
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("supervisor", supervisor_node)
workflow.add_node("crowd", crowd_agent_node)
workflow.add_node("parking", parking_agent_node)
workflow.add_node("traffic", traffic_agent_node)
workflow.add_node("security", security_agent_node)
workflow.add_node("medical", medical_agent_node)
workflow.add_node("vendor", vendor_agent_node)
workflow.add_node("weather", weather_agent_node)
workflow.add_node("tournament", tournament_agent_node)
workflow.add_node("energy", energy_agent_node)
workflow.add_node("emergency", emergency_agent_node)
workflow.add_node("navigation", navigation_agent_node)
workflow.add_node("voice", voice_agent_node)
workflow.add_node("vip", vip_agent_node)
workflow.add_node("analytics", analytics_agent_node)

# Set Entry Point
workflow.set_entry_point("supervisor")

# Configure Conditional Edges from Supervisor
workflow.add_conditional_edges(
    "supervisor",
    route_next_agent,
    {
        "crowd": "crowd",
        "parking": "parking",
        "traffic": "traffic",
        "security": "security",
        "medical": "medical",
        "vendor": "vendor",
        "weather": "weather",
        "tournament": "tournament",
        "energy": "energy",
        "emergency": "emergency",
        "navigation": "navigation",
        "voice": "voice",
        "vip": "vip",
        "analytics": "analytics"
    }
)

# Connect Specialist nodes to End (Single execution pass for smart response latency)
for specialist in [
    "crowd", "parking", "traffic", "security", "medical", 
    "vendor", "weather", "tournament", "energy", 
    "emergency", "navigation", "voice", "vip", "analytics"
]:
    workflow.add_edge(specialist, END)

# Compile the runnable workflow
agent_workflow = workflow.compile()
