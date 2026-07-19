"""User response, creation, and update Pydantic schemas."""

from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserBaseSchema(BaseModel):
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    avatar_url: str | None = None
    phone: str | None = None
    mfa_enabled: bool = False


class UserCreateSchema(UserBaseSchema):
    password: str = Field(..., min_length=8)
    organization_id: str | None = None


class UserUpdateSchema(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    role: str | None = None
    is_active: bool | None = None
    avatar_url: str | None = None
    phone: str | None = None
    password: str | None = None


class UserResponseSchema(UserBaseSchema):
    id: str
    organization_id: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }
