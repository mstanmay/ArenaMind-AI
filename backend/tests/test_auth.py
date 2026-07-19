"""Authentication endpoints API tests."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_user_registration_and_login(client: AsyncClient) -> None:
    """Verify that a new operator can register, generate an organization, and obtain JWT tokens."""
    # 1. Registration
    register_payload = {
        "email": "test.operator@arenamind.ai",
        "password": "SecureP@ssword486",
        "full_name": "Alex Ops",
        "organization_name": "North Field Stadium"
    }
    
    reg_response = await client.post("/api/v1/auth/register", json=register_payload)
    assert reg_response.status_code == 201
    user_data = reg_response.json()
    assert user_data["email"] == "test.operator@arenamind.ai"
    assert user_data["full_name"] == "Alex Ops"
    assert user_data["role"] == "viewer"
    assert user_data["organization_id"] is not None

    # 2. Login
    login_payload = {
        "username": "test.operator@arenamind.ai",
        "password": "SecureP@ssword486"
    }
    login_response = await client.post(
        "/api/v1/auth/login",
        data=login_payload
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    assert "refresh_token" in token_data
    assert token_data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_invalid_login_credentials(client: AsyncClient) -> None:
    """Verify that login fails with incorrect password or unregistered email."""
    login_payload = {
        "username": "unknown@arenamind.ai",
        "password": "wrongpassword"
    }
    login_response = await client.post(
        "/api/v1/auth/login",
        data=login_payload
    )
    assert login_response.status_code == 401
    assert "error" in login_response.json()
