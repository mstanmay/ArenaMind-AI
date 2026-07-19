"""TOTP Multi-Factor Authentication — setup, verification, recovery codes, and secret encryption."""

import secrets
import hashlib

import pyotp
from cryptography.fernet import Fernet

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger("mfa")


def generate_totp_secret() -> str:
    """Generate a new base32-encoded TOTP secret."""
    return pyotp.random_base32()


def get_totp_uri(secret: str, email: str) -> str:
    """Build an OTPAuth URI for QR code enrollment."""
    settings = get_settings()
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=email, issuer_name=settings.mfa_issuer_name)


def verify_totp_code(secret: str, code: str) -> bool:
    """Verify a 6-digit TOTP code against a secret.

    Allows a ±1 window for clock drift (valid_window=1 means ±30 seconds).
    """
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=1)


def generate_recovery_codes(count: int = 10) -> list[str]:
    """Generate one-time-use backup recovery codes.

    Each code is 8 hex characters, uppercase, in XXXX-XXXX format.
    """
    codes: list[str] = []
    for _ in range(count):
        raw = secrets.token_hex(4).upper()
        codes.append(f"{raw[:4]}-{raw[4:]}")
    return codes


def hash_recovery_code(code: str) -> str:
    """Hash a recovery code for safe storage."""
    return hashlib.sha256(code.strip().upper().encode()).hexdigest()


def _get_fernet() -> Fernet:
    """Get a Fernet cipher instance from the configured encryption key."""
    settings = get_settings()
    key = settings.mfa_encryption_key
    # If key is not valid Fernet format, derive one deterministically
    try:
        return Fernet(key.encode())
    except Exception:
        # Derive a valid Fernet key from the configured secret
        import base64
        derived = hashlib.sha256(key.encode()).digest()
        fernet_key = base64.urlsafe_b64encode(derived)
        return Fernet(fernet_key)


def encrypt_secret(plaintext: str) -> str:
    """Encrypt a TOTP secret using Fernet symmetric encryption."""
    f = _get_fernet()
    return f.encrypt(plaintext.encode()).decode()


def decrypt_secret(ciphertext: str) -> str:
    """Decrypt a Fernet-encrypted TOTP secret."""
    f = _get_fernet()
    return f.decrypt(ciphertext.encode()).decode()
