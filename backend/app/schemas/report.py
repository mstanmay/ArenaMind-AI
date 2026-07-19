"""Operational reports schemas."""

from datetime import datetime
from typing import Any
from pydantic import BaseModel


class ReportBase(BaseModel):
    title: str
    report_type: str
    status: str = "generating"
    summary: str | None = None
    data: dict[str, Any] | None = None
    generated_by: str = "system"
    file_url: str | None = None


class ReportCreate(ReportBase):
    pass


class ReportResponse(ReportBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
