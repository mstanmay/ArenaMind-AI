"""Crowd intelligence API router endpoints."""

from typing import Any
from fastapi import APIRouter, Depends, Security
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.schemas.crowd import CrowdSnapshotResponse, CrowdSnapshotCreate
from app.services.crowd import CrowdService
from app.security.rbac import require_viewer, require_operator

router = APIRouter(tags=["Crowd Intelligence"])


@router.get("", response_model=list[CrowdSnapshotResponse])
async def list_crowd_telemetry(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db_session),
    current_user: Any = Security(require_viewer)
) -> list[Any]:
    """Retrieve paginated crowd headcount snapshots (requires Viewer role)."""
    service = CrowdService(db)
    snapshots = await service.get_all_snapshots(skip=skip, limit=limit)
    return list(snapshots)


@router.post("", response_model=CrowdSnapshotResponse, status_code=210)
async def record_crowd_telemetry(
    payload: CrowdSnapshotCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: Any = Security(require_operator)
) -> Any:
    """Record a new crowd snapshot (requires Operator role)."""
    service = CrowdService(db)
    snapshot = await service.create_snapshot(payload.model_dump())
    return snapshot
