"""Authentication-related Pydantic schemas."""

from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class TokenSchema(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    mfa_required: bool = False
    device_trusted: bool = False


class TokenPayloadSchema(BaseModel):
    sub: str | None = None
    role: str | None = None
    exp: int | None = None
    jti: str | None = None
    device_fp: str | None = None


class UserRegisterSchema(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=12, description="Password must be at least 12 characters long")
    full_name: str = Field(..., min_length=2, description="Display name for the user")
    organization_name: str | None = Field(None, description="Optional organization to register under")


class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str
    device_fingerprint: str | None = Field(None, description="Client device fingerprint")
    device_name: str | None = Field(None, description="Name or type of client device")


class MFASetupResponseSchema(BaseModel):
    secret: str = Field(..., description="MFA secret key (base32)")
    otpauth_uri: str = Field(..., description="URI for Google Authenticator / Authy")
    recovery_codes: list[str] = Field(..., description="Backup one-time recovery codes")


class MFAValidateSchema(BaseModel):
    code: str = Field(..., description="6-digit TOTP verification code or backup recovery code")
    email: EmailStr = Field(..., description="Email address for user identification during login flow")
    device_fingerprint: str | None = Field(None, description="Fingerprint to remember device")
    device_name: str | None = Field(None, description="Friendly device name")


class PasswordChangeSchema(BaseModel):
    current_password: str = Field(..., description="Current account password")
    new_password: str = Field(..., description="New password meeting complexity rules")


class PasswordResetRequestSchema(BaseModel):
    email: EmailStr = Field(..., description="Email to send reset link to")


class PasswordResetConfirmSchema(BaseModel):
    token: str = Field(..., description="Verification reset token")
    new_password: str = Field(..., description="New password meeting complexity rules")


class DeviceResponseSchema(BaseModel):
    id: str
    device_name: str
    device_fingerprint: str
    is_trusted: bool
    last_login_at: datetime | None = None

    class Config:
        from_attributes = True
