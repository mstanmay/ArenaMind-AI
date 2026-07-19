"""Domain exception hierarchy — maps cleanly to HTTP status codes in the error handler."""


class ArenaMindError(Exception):
    """Base exception for all ArenaMind domain errors."""

    def __init__(self, message: str = "An unexpected error occurred", code: str = "INTERNAL_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


# ── Authentication & Authorization ───────────────────────


class AuthenticationError(ArenaMindError):
    """Invalid credentials, expired token, or missing authentication."""

    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message=message, code="AUTHENTICATION_ERROR")


class AuthorizationError(ArenaMindError):
    """Insufficient permissions for the requested operation."""

    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message=message, code="AUTHORIZATION_ERROR")


class TokenExpiredError(AuthenticationError):
    """JWT token has expired."""

    def __init__(self):
        super().__init__(message="Token has expired")


class InvalidTokenError(AuthenticationError):
    """JWT token is malformed or invalid."""

    def __init__(self):
        super().__init__(message="Invalid or malformed token")


class AccountLockedError(AuthenticationError):
    """User account is temporarily locked due to repeated failed login attempts."""

    def __init__(self, minutes_remaining: int = 0):
        msg = "Account temporarily locked due to repeated failed login attempts"
        if minutes_remaining > 0:
            msg += f". Try again in {minutes_remaining} minutes"
        super().__init__(message=msg)


class MFARequiredError(AuthenticationError):
    """Multi-factor authentication challenge is required to complete login."""

    def __init__(self):
        super().__init__(message="MFA verification required to complete authentication")


class MFAInvalidError(AuthenticationError):
    """Invalid or expired TOTP code provided during MFA challenge."""

    def __init__(self):
        super().__init__(message="Invalid or expired MFA verification code")


# ── Resource Errors ──────────────────────────────────────


class NotFoundError(ArenaMindError):
    """Requested resource does not exist."""

    def __init__(self, resource: str = "Resource", identifier: str = ""):
        detail = f"{resource} not found" + (f": {identifier}" if identifier else "")
        super().__init__(message=detail, code="NOT_FOUND")


class ConflictError(ArenaMindError):
    """Resource already exists or state conflict."""

    def __init__(self, message: str = "Resource conflict"):
        super().__init__(message=message, code="CONFLICT")


class ValidationError(ArenaMindError):
    """Business rule validation failure."""

    def __init__(self, message: str = "Validation failed"):
        super().__init__(message=message, code="VALIDATION_ERROR")


class PasswordComplexityError(ValidationError):
    """Password does not meet complexity requirements."""

    def __init__(self, violations: list[str] | None = None):
        detail = "Password does not meet complexity requirements"
        if violations:
            detail += ": " + "; ".join(violations)
        super().__init__(message=detail)


# ── AI & Agent Errors ────────────────────────────────────


class AIGuardrailError(ArenaMindError):
    """AI output violated safety guardrails."""

    def __init__(self, message: str = "AI output blocked by guardrails"):
        super().__init__(message=message, code="AI_GUARDRAIL_VIOLATION")


class PromptInjectionError(ArenaMindError):
    """Detected prompt injection attempt in user input."""

    def __init__(self, message: str = "Potential prompt injection detected"):
        super().__init__(message=message, code="PROMPT_INJECTION")


class AgentExecutionError(ArenaMindError):
    """An AI agent failed during execution."""

    def __init__(self, agent: str, message: str = "Agent execution failed"):
        super().__init__(message=f"[{agent}] {message}", code="AGENT_EXECUTION_ERROR")


class LLMProviderError(ArenaMindError):
    """Upstream LLM provider returned an error."""

    def __init__(self, provider: str, message: str = "LLM provider error"):
        super().__init__(message=f"[{provider}] {message}", code="LLM_PROVIDER_ERROR")


# ── Rate Limiting ────────────────────────────────────────


class RateLimitExceededError(ArenaMindError):
    """Client has exceeded the request rate limit."""

    def __init__(self, message: str = "Rate limit exceeded. Try again later."):
        super().__init__(message=message, code="RATE_LIMIT_EXCEEDED")


# ── External Service Errors ──────────────────────────────


class ExternalServiceError(ArenaMindError):
    """An external service (weather API, etc.) failed."""

    def __init__(self, service: str, message: str = "External service unavailable"):
        super().__init__(message=f"[{service}] {message}", code="EXTERNAL_SERVICE_ERROR")

