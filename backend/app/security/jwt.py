"""JWT token creation, verification, and refresh — with JTI tracking and replay prevention."""

import uuid
from datetime import datetime, timedelta, timezone

import jwt

from app.core.config import get_settings
from app.core.exceptions import InvalidTokenError, TokenExpiredError


def create_access_token(
    subject: str,
    role: str,
    device_fingerprint: str | None = None,
    extra: dict | None = None,
) -> str:
    """Create a short-lived JWT access token with JTI for revocation tracking."""
    settings = get_settings()
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_access_token_expire_minutes)
    payload = {
        "sub": subject,
        "role": role,
        "type": "access",
        "jti": str(uuid.uuid4()),
        "exp": expires,
        "iat": datetime.now(timezone.utc),
    }
    if device_fingerprint:
        payload["device_fp"] = device_fingerprint
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_refresh_token(subject: str) -> str:
    """Create a long-lived JWT refresh token with JTI and nonce for rotation."""
    settings = get_settings()
    expires = datetime.now(timezone.utc) + timedelta(days=settings.jwt_refresh_token_expire_days)
    payload = {
        "sub": subject,
        "type": "refresh",
        "jti": str(uuid.uuid4()),
        "nonce": uuid.uuid4().hex[:16],
        "exp": expires,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def verify_token(token: str, expected_type: str = "access") -> dict:
    """Verify and decode a JWT token. Raises on invalid/expired tokens."""
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except jwt.ExpiredSignatureError:
        raise TokenExpiredError()
    except jwt.InvalidTokenError:
        raise InvalidTokenError()

    if payload.get("type") != expected_type:
        raise InvalidTokenError()

    return payload


def extract_user_id(token: str) -> str:
    """Extract the user ID (sub) from an access token."""
    payload = verify_token(token, expected_type="access")
    user_id = payload.get("sub")
    if not user_id:
        raise InvalidTokenError()
    return user_id


def hash_token(token: str) -> str:
    """Create a SHA-256 hash of a token for safe database storage."""
    import hashlib
    return hashlib.sha256(token.encode()).hexdigest()
