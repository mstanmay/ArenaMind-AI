"""Tournament operations API router endpoints."""

from typing import Any
from fastapi import APIRouter, Depends, Security
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.schemas.event import StadiumEventResponse, StadiumEventCreate
from app.repositories.event import StadiumEventRepository
from app.security.rbac import require_viewer, require_operator

router = APIRouter(tags=["Tournament Operations"])


@router.get("/matches", response_model=list[StadiumEventResponse])
async def list_matches(
    db: AsyncSession = Depends(get_db_session),
    current_user: Any = Security(require_viewer)
) -> list[Any]:
    """Retrieve all tournament matches scheduled in the stadium (requires Viewer role)."""
    repo = StadiumEventRepository(db)
    events = await repo.get_all()
    return list(events)


@router.post("/matches", response_model=StadiumEventResponse, status_code=210)
async def schedule_match(
    payload: StadiumEventCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: Any = Security(require_operator)
) -> Any:
    """Schedule a new match or stadium event (requires Operator role)."""
    repo = StadiumEventRepository(db)
    from app.models.event import StadiumEvent
    event = StadiumEvent(
        name=payload.name,
        event_type=payload.event_type,
        status=payload.status,
        home_team=payload.home_team,
        away_team=payload.away_team,
        venue=payload.venue,
        expected_attendance=payload.expected_attendance,
        actual_attendance=payload.actual_attendance,
        start_time=payload.start_time,
        end_time=payload.end_time,
        description=payload.description
    )
    await repo.create(event)
    return event
