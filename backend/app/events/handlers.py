"""Event handler callbacks registry."""

from typing import Any
from app.core.logging import get_logger
from app.core.constants import EventType

logger = get_logger("event_handlers")


async def on_crowd_density_updated(payload: dict[str, Any]) -> None:
    """Executes when crowd density levels are updated inside a zone."""
    zone = payload.get("zone", "unknown")
    density = payload.get("density_percent", 0.0)
    logger.info("handler_crowd_updated", zone=zone, density=density)

    # Trigger Celery background task if density breaches critical threshold
    if density >= 80.0:
        logger.warning("crowd_critical_threshold_breached", zone=zone, density=density)
        from app.workers.tasks.notification_dispatch import send_alert_notification
        # Dispatch notification task via Celery
        send_alert_notification.delay(
            title="Crowd Concourse Congestion",
            message=f"Zone {zone} occupancy has breached {density}%. High surge risk.",
            priority="high"
        )


async def on_parking_status_changed(payload: dict[str, Any]) -> None:
    """Executes when a parking lot occupancy level changes."""
    lot = payload.get("lot_name", "unknown")
    occupancy = payload.get("occupancy_percent", 0.0)
    logger.info("handler_parking_updated", lot=lot, occupancy=occupancy)


async def on_emergency_triggered(payload: dict[str, Any]) -> None:
    """Executes on critical stadium-wide emergency activations."""
    incident_type = payload.get("incident_type", "unknown")
    zone = payload.get("zone", "unknown")
    logger.error("handler_emergency_triggered", type=incident_type, zone=zone)
    
    # Broadcast to all emergency channels via worker
    from app.workers.tasks.notification_dispatch import send_alert_notification
    send_alert_notification.delay(
        title="EMERGENCY OVERRIDE",
        message=f"Critical {incident_type} reported in zone {zone}. Deploying evacuations.",
        priority="critical"
    )


async def on_ai_decision_made(payload: dict[str, Any]) -> None:
    """Executes when the Multi-Agent system issues a decision."""
    decision_id = payload.get("decision_id")
    agent = payload.get("agent_type")
    logger.info("handler_ai_decision_made", id=decision_id, agent=agent)


async def register_all_event_handlers() -> None:
    """Register all event handler listeners on the EventBus."""
    from app.events.bus import get_event_bus
    bus = await get_event_bus()

    bus.subscribe(EventType.CROWD_DENSITY_UPDATED, on_crowd_density_updated)
    bus.subscribe(EventType.PARKING_STATUS_CHANGED, on_parking_status_changed)
    bus.subscribe(EventType.EMERGENCY_TRIGGERED, on_emergency_triggered)
    bus.subscribe(EventType.AI_DECISION_MADE, on_ai_decision_made)
    
    logger.info("all_event_handlers_registered")
