"""Cryptographic verification helpers using HMAC-SHA256 for database row integrity."""

import hmac
import hashlib
from typing import TYPE_CHECKING

from app.core.config import get_settings

if TYPE_CHECKING:
    from app.models.audit_log import AuditLog
    from app.models.ai_decision import AIDecision


def compute_audit_log_signature(log: "AuditLog") -> str:
    """Compute standard SHA-256 HMAC signature for an AuditLog record."""
    parts = [
        log.action or "",
        log.entity_type or "",
        log.entity_id or "",
        log.actor_id or "",
        log.actor_type or "",
        log.details or ""
    ]
    payload = "|".join(parts)
    secret = get_settings().jwt_secret_key
    return hmac.new(secret.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()


def verify_audit_log_signature(log: "AuditLog") -> bool:
    """Verify that the stored signature on an AuditLog record matches the computed signature."""
    if not log.signature:
        return False
    expected = compute_audit_log_signature(log)
    return hmac.compare_digest(log.signature, expected)


def compute_ai_decision_signature(decision: "AIDecision") -> str:
    """Compute standard SHA-256 HMAC signature for an AIDecision record."""
    # Format float to fixed precision to avoid representation differences
    conf_val = f"{decision.confidence:.6f}" if decision.confidence is not None else "0.000000"
    parts = [
        decision.agent_type or "",
        decision.query or "",
        decision.reason or "",
        conf_val,
        decision.priority or ""
    ]
    payload = "|".join(parts)
    secret = get_settings().jwt_secret_key
    return hmac.new(secret.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()


def verify_ai_decision_signature(decision: "AIDecision") -> bool:
    """Verify that the stored signature on an AIDecision record matches the computed signature."""
    if not decision.signature:
        return False
    expected = compute_ai_decision_signature(decision)
    return hmac.compare_digest(decision.signature, expected)
