"""Domain constants, enumerations, and magic-string elimination."""

from enum import StrEnum


class UserRole(StrEnum):
    """Role-based access control tiers — hierarchical from highest to lowest privilege."""

    SUPER_ADMIN = "super_admin"
    STADIUM_ADMIN = "stadium_admin"
    SECURITY_MANAGER = "security_manager"
    MEDICAL_MANAGER = "medical_manager"
    EVENT_MANAGER = "event_manager"
    VENDOR_MANAGER = "vendor_manager"
    AI_OPERATOR = "ai_operator"
    # Legacy aliases kept for backward compatibility
    ADMIN = "admin"
    OPERATOR = "operator"
    VIEWER = "viewer"
    AI_AGENT = "ai_agent"


# Hierarchical role precedence (index 0 = highest privilege)
ROLE_HIERARCHY: list[str] = [
    UserRole.SUPER_ADMIN,
    UserRole.STADIUM_ADMIN,
    UserRole.ADMIN,  # legacy alias maps to stadium-level
    UserRole.SECURITY_MANAGER,
    UserRole.MEDICAL_MANAGER,
    UserRole.EVENT_MANAGER,
    UserRole.VENDOR_MANAGER,
    UserRole.AI_OPERATOR,
    UserRole.OPERATOR,
    UserRole.AI_AGENT,
    UserRole.VIEWER,
]


def role_has_access(user_role: str, required_role: str) -> bool:
    """Check if user_role is at or above required_role in the hierarchy."""
    try:
        user_idx = ROLE_HIERARCHY.index(user_role)
        required_idx = ROLE_HIERARCHY.index(required_role)
        return user_idx <= required_idx
    except ValueError:
        return False



class MFAStatus(StrEnum):
    """Multi-Factor Authentication lifecycle states."""

    DISABLED = "disabled"
    PENDING_SETUP = "pending_setup"
    ENABLED = "enabled"


class AgentType(StrEnum):
    """All available AI agent types in the multi-agent system."""

    SUPERVISOR = "supervisor"
    CROWD = "crowd"
    PARKING = "parking"
    SECURITY = "security"
    MEDICAL = "medical"
    VENDOR = "vendor"
    TRAFFIC = "traffic"
    WEATHER = "weather"
    TOURNAMENT = "tournament"
    ENERGY = "energy"
    EMERGENCY = "emergency"
    NAVIGATION = "navigation"
    VOICE = "voice"
    VIP = "vip"
    ANALYTICS = "analytics"


class EventPriority(StrEnum):
    """Priority levels for system events and incidents."""

    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class DecisionStatus(StrEnum):
    """Lifecycle status of an AI decision."""

    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXECUTED = "executed"
    EXPIRED = "expired"


class IncidentType(StrEnum):
    """Categories of incidents for the security and medical domains."""

    CROWD_SURGE = "crowd_surge"
    MEDICAL_EMERGENCY = "medical_emergency"
    SECURITY_BREACH = "security_breach"
    FIRE_ALARM = "fire_alarm"
    WEATHER_ALERT = "weather_alert"
    POWER_OUTAGE = "power_outage"
    VIP_ARRIVAL = "vip_arrival"
    FOOD_SHORTAGE = "food_shortage"
    PARKING_FULL = "parking_full"
    EVACUATION = "evacuation"


class EventType(StrEnum):
    """Redis Pub/Sub event types for the event-driven architecture."""

    CROWD_DENSITY_UPDATED = "crowd.density.updated"
    PARKING_STATUS_CHANGED = "parking.status.changed"
    EMERGENCY_TRIGGERED = "emergency.triggered"
    WEATHER_ALERT = "weather.alert"
    VIP_ARRIVAL = "vip.arrival"
    FOOD_SHORTAGE = "vendor.food.shortage"
    POWER_HIGH = "energy.power.high"
    MEDICAL_DISPATCH = "medical.dispatch"
    SECURITY_ALERT = "security.alert"
    AI_DECISION_MADE = "ai.decision.made"
    MATCH_EVENT = "tournament.match.event"
    NOTIFICATION_SENT = "notification.sent"


class ZoneType(StrEnum):
    """Stadium zone classifications."""

    GATE = "gate"
    STAND = "stand"
    CONCOURSE = "concourse"
    PARKING = "parking"
    VIP_LOUNGE = "vip_lounge"
    PITCH = "pitch"
    MEDIA_CENTER = "media_center"
    MEDICAL_BAY = "medical_bay"
    VENDOR_AREA = "vendor_area"
    EXIT = "exit"
