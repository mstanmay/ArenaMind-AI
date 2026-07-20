import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.audit_log import AuditLog
from app.models.ai_decision import AIDecision
from app.security.integrity import (
    verify_audit_log_signature,
    verify_ai_decision_signature,
    compute_audit_log_signature,
    compute_ai_decision_signature
)


@pytest.mark.asyncio
async def test_audit_log_signature_generation(db_session: AsyncSession) -> None:
    """Verify that AuditLog records automatically generate a cryptographic signature on insert."""
    log = AuditLog(
        action="unauthorized_access_attempt",
        entity_type="security",
        entity_id="test-entity-uuid",
        actor_id="user-123",
        actor_type="user",
        details="User attempted to access restricted admin panel."
    )
    db_session.add(log)
    await db_session.commit()
    await db_session.refresh(log)

    # 1. Signature must be generated and stored
    assert log.signature is not None
    assert len(log.signature) == 64  # SHA-256 hex digest length

    # 2. Verification should pass for untampered row
    assert verify_audit_log_signature(log) is True

    # 3. Tamper with the row - signature verification should fail
    log.details = "User was allowed access to restricted admin panel."
    assert verify_audit_log_signature(log) is False


@pytest.mark.asyncio
async def test_ai_decision_signature_generation(db_session: AsyncSession) -> None:
    """Verify that AIDecision records automatically generate a cryptographic signature on insert."""
    decision = AIDecision(
        agent_type="crowd",
        query="Reroute crowd from Gate 4 to Gate 6.",
        reason="Gate 4 wait times exceeded 15 minutes.",
        confidence=0.950000,
        priority="high"
    )
    db_session.add(decision)
    await db_session.commit()
    await db_session.refresh(decision)

    # 1. Signature must be generated and stored
    assert decision.signature is not None
    assert len(decision.signature) == 64

    # 2. Verification should pass
    assert verify_ai_decision_signature(decision) is True

    # 3. Tamper with the decision - signature verification should fail
    decision.confidence = 0.500000
    assert verify_ai_decision_signature(decision) is False


@pytest.mark.asyncio
async def test_audit_verify_api_endpoint(client: AsyncClient, db_session: AsyncSession) -> None:
    """Verify that the /api/v1/audit/verify endpoint correctly validates untampered and tampered rows."""
    # 1. Seed user for authorization bypass (operator)
    from app.models.user import User
    from app.security.password import hash_password
    
    operator = User(
        email="test_operator@arenamind.ai",
        hashed_password=hash_password("ComplexSecureP@ss4862"),
        full_name="Operations Manager",
        role="operator",
        is_active=True,
        is_verified=True
    )
    db_session.add(operator)
    await db_session.commit()
    
    # Login to get token
    login_res = await client.post(
        "/api/v1/auth/login",
        data={"username": "test_operator@arenamind.ai", "password": "ComplexSecureP@ss4862"}
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Log an event via API (which creates a signed AuditLog record)
    log_res = await client.post(
        "/api/v1/audit/log-event",
        headers=headers,
        json={
            "action": "gate_lockdown",
            "event_type": "security",
            "details": "Gate 3 locked down due to sensor trigger."
        }
    )
    assert log_res.status_code == 200
    log_id = log_res.json()["log_id"]

    # 3. Verify integrity of the new log entry via API
    verify_res = await client.post(
        "/api/v1/audit/verify",
        headers=headers,
        json={"log_id": log_id}
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["is_valid"] is True
    assert verify_res.json()["hash_match"] is True

    # 4. Manually fetch and tamper with the row in DB, then verify again
    stmt = select(AuditLog).where(AuditLog.id == log_id)
    result = await db_session.execute(stmt)
    db_log = result.scalar_one()
    db_log.details = "Gate 3 reopened."  # Tamper
    await db_session.commit()

    verify_tampered_res = await client.post(
        "/api/v1/audit/verify",
        headers=headers,
        json={"log_id": log_id}
    )
    assert verify_tampered_res.status_code == 200
    assert verify_tampered_res.json()["is_valid"] is False
    assert verify_tampered_res.json()["hash_match"] is False
