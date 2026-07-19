"""Password hashing, verification, and complexity validation using Argon2."""

import re

from passlib.context import CryptContext

from app.core.config import get_settings

pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

# Common weak passwords (sample — production would use a full dictionary)
COMMON_PASSWORDS = {
    "password", "123456", "12345678", "qwerty", "abc123", "password1",
    "letmein", "admin", "welcome", "monkey", "dragon", "master",
    "login", "princess", "football", "shadow", "sunshine", "trustno1",
    "iloveyou", "batman", "access", "hello", "charlie", "passw0rd",
}


def hash_password(password: str) -> str:
    """Hash a password using the configured crypt context (Argon2 primary)."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def validate_password_complexity(password: str) -> list[str]:
    """Validate password against enterprise complexity requirements.

    Returns a list of violation messages. Empty list means valid.
    """
    settings = get_settings()
    violations: list[str] = []

    if len(password) < settings.password_min_length:
        violations.append(f"Password must be at least {settings.password_min_length} characters long")

    if not re.search(r"[A-Z]", password):
        violations.append("Password must contain at least one uppercase letter")

    if not re.search(r"[a-z]", password):
        violations.append("Password must contain at least one lowercase letter")

    if not re.search(r"\d", password):
        violations.append("Password must contain at least one digit")

    if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?`~]", password):
        violations.append("Password must contain at least one special character")

    if password.lower() in COMMON_PASSWORDS:
        violations.append("Password is too common and easily guessable")

    # Check for sequential characters (e.g., abc, 123)
    for i in range(len(password) - 2):
        if (
            ord(password[i]) + 1 == ord(password[i + 1]) == ord(password[i + 2]) - 1
        ):
            violations.append("Password must not contain sequential characters")
            break

    return violations
