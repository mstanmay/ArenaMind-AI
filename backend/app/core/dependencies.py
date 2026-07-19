"""FastAPI dependency injection — centralized DI container."""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session

# ── Database Session ─────────────────────────────────────
DbSession = Annotated[AsyncSession, Depends(get_db_session)]
