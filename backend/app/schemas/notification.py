"""System notification validation schemas."""

from datetime import datetime
from pydantic import BaseModel


class NotificationBase(BaseModel):
    title: str
    message: str
    notification_type: str = "info"
    priority: str = "medium"
    target_role: str | None = None
    target_user_id: str | None = None
    is_read: bool = False
    source_agent: str | None = None
    action_url: str | None = None


class NotificationCreate(NotificationBase):
    pass


class NotificationResponse(NotificationBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
