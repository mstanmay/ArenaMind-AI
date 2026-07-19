"""Unit and integration tests for enhanced authentication, MFA, and account lockout features."""

import pytest
import pyotp
import json
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient

from app.security.password import validate_password_complexity, hash_password
from app.security.mfa import decrypt_secret
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.core.config import get_settings
from app.core.constants import UserRole, role_has_access


def test_password_complexity_validation():
    """Verify that weak passwords are rejected and strong passwords meet security rules."""
    # 1. Too short
    assert "at least 12 characters" in "; ".join(validate_password_complexity("Short1!"))
    
    # 2. Missing uppercase
    assert "uppercase letter" in "; ".join(validate_password_complexity("nocapitaldigit1!"))
    
    # 3. Missing digit
    assert "digit" in "; ".join(validate_password_complexity("NoDigitsInHere!"))
    
    # 4. Missing special char
    assert "special character" in "; ".join(validate_password_complexity("NoSpecialChars123"))
    
    # 5. Dictionary password (e.g. password)
    assert "too common" in "; ".join(validate_password_complexity("password"))
    
    # 6. Sequential characters
    assert "sequential characters" in "; ".join(validate_password_complexity("Abc12345678!"))
    
    # 7. Valid password
    assert len(validate_password_complexity("ComplexSecureP@ss4862")) == 0


def test_rbac_role_hierarchy():
    """Verify role checks against access control hierarchy."""
    # SUPER_ADMIN accesses everything
    assert role_has_access(UserRole.SUPER_ADMIN, UserRole.STADIUM_ADMIN) is True
    assert role_has_access(UserRole.SUPER_ADMIN, UserRole.SECURITY_MANAGER) is True
    assert role_has_access(UserRole.SUPER_ADMIN, UserRole.VIEWER) is True
    
    # STADIUM_ADMIN accesses domain managers but not SUPER_ADMIN
    assert role_has_access(UserRole.STADIUM_ADMIN, UserRole.SUPER_ADMIN) is False
    assert role_has_access(UserRole.STADIUM_ADMIN, UserRole.SECURITY_MANAGER) is True
    
    # SECURITY_MANAGER accesses operators and viewers but not other managers
    assert role_has_access(UserRole.SECURITY_MANAGER, UserRole.STADIUM_ADMIN) is False
    assert role_has_access(UserRole.SECURITY_MANAGER, UserRole.OPERATOR) is True
    assert role_has_access(UserRole.SECURITY_MANAGER, UserRole.VIEWER) is True
    
    # VIEWER has lowest access
    assert role_has_access(UserRole.VIEWER, UserRole.OPERATOR) is False


@pytest.mark.asyncio
async def test_account_lockout_mechanism(client, db_session):
    """Test user lockout progression after successive failed login attempts."""
    settings = get_settings()
    
    # Create test user
    test_user = User(
        email="lockout_test@arenamind.ai",
        hashed_password=hash_password("ComplexSecureP@ss4862"),
        full_name="Lockout Test",
        role="viewer"
    )
    db_session.add(test_user)
    await db_session.commit()
    
    # Simulate failed logins up to threshold
    for i in range(settings.account_lockout_threshold):
        response = await client.post(
            "/api/v1/auth/login",
            data={"username": "lockout_test@arenamind.ai", "password": "wrong_password"}
        )
        assert response.status_code == 401
        
    # User should now be locked
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "lockout_test@arenamind.ai", "password": "ComplexSecureP@ss4862"}
    )
    assert response.status_code == 401
    assert "locked" in response.json()["error"]["message"].lower()


@pytest.mark.asyncio
async def test_refresh_token_rotation_and_revocation(client, db_session):
    """Verify refresh token rotation and replay threat revocation."""
    # 1. Register and login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "rotation@arenamind.ai",
            "password": "ComplexSecureP@ss4862",
            "full_name": "Rotation Test"
        }
    )
    
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "rotation@arenamind.ai", "password": "ComplexSecureP@ss4862"}
    )
    data = response.json()
    refresh_token_1 = data["refresh_token"]
    
    # 2. Perform first refresh (rotates tokens)
    response_refresh = await client.post(
        "/api/v1/auth/refresh",
        params={"refresh_token": refresh_token_1}
    )
    assert response_refresh.status_code == 200
    data_2 = response_refresh.json()
    refresh_token_2 = data_2["refresh_token"]
    assert refresh_token_1 != refresh_token_2
    
    # 3. Replay attack: try to reuse refresh_token_1 (must fail and revoke session)
    response_replay = await client.post(
        "/api/v1/auth/refresh",
        params={"refresh_token": refresh_token_1}
    )
    assert response_replay.status_code == 401
    assert "spent" in response_replay.json()["error"]["message"] or "reuse" in response_replay.json()["error"]["message"] or "invalid" in response_replay.json()["error"]["message"].lower() or "revoked" in response_replay.json()["error"]["message"].lower()


@pytest.mark.asyncio
async def test_mfa_flow_setup_and_verification(client, db_session):
    """Test standard user MFA setup and subsequent login validations."""
    # 1. Register & Login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "mfa_flow@arenamind.ai",
            "password": "ComplexSecureP@ss4862",
            "full_name": "MFA Flow User"
        }
    )
    
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "mfa_flow@arenamind.ai", "password": "ComplexSecureP@ss4862"}
    )
    token = response.json()["access_token"]
    
    # 2. Request MFA setup
    setup_response = await client.post(
        "/api/v1/auth/mfa/setup",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert setup_response.status_code == 200
    setup_data = setup_response.json()
    secret = setup_data["secret"]
    recovery_codes = setup_data["recovery_codes"]
    
    # 3. Verify MFA setup using TOTP code
    totp = pyotp.TOTP(secret)
    code = totp.now()
    
    verify_response = await client.post(
        "/api/v1/auth/mfa/verify",
        json={"code": code, "email": "mfa_flow@arenamind.ai"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert verify_response.status_code == 200
    assert verify_response.json()["mfa_enabled"] is True
    
    # 4. Try logging in again (should trigger MFA required state)
    login_mfa = await client.post(
        "/api/v1/auth/login",
        data={"username": "mfa_flow@arenamind.ai", "password": "ComplexSecureP@ss4862"}
    )
    assert login_mfa.json()["mfa_required"] is True
    assert login_mfa.json()["access_token"] == ""
    
    # 5. Validate MFA code to complete login
    mfa_code = totp.now()
    validate_mfa = await client.post(
        "/api/v1/auth/mfa/validate",
        json={
            "code": mfa_code,
            "email": "mfa_flow@arenamind.ai"
        }
    )
    assert validate_mfa.status_code == 200
    assert validate_mfa.json()["access_token"] != ""
    assert validate_mfa.json()["mfa_required"] is False
    
    # 6. Validate login with backup recovery code
    login_mfa_2 = await client.post(
        "/api/v1/auth/login",
        data={"username": "mfa_flow@arenamind.ai", "password": "ComplexSecureP@ss4862"}
    )
    assert login_mfa_2.json()["mfa_required"] is True
    
    recovery_code = recovery_codes[0]
    validate_mfa_recovery = await client.post(
        "/api/v1/auth/mfa/validate",
        json={
            "code": recovery_code,
            "email": "mfa_flow@arenamind.ai"
        }
    )
    assert validate_mfa_recovery.status_code == 200
    assert validate_mfa_recovery.json()["access_token"] != ""
