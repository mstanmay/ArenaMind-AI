"""Security center API router endpoints."""

from typing import Any
from fastapi import APIRouter, Depends, Security, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.schemas.security import SecurityIncidentResponse, SecurityIncidentCreate, SecurityIncidentUpdate
from app.services.security import SecurityService
from app.security.rbac import require_viewer, require_operator

router = APIRouter(tags=["Security Center"])


@router.get("", response_model=list[SecurityIncidentResponse])
async def list_security_incidents(
    db: AsyncSession = Depends(get_db_session),
    current_user: Any = Security(require_viewer)
) -> list[Any]:
    """Retrieve all logged security incidents (requires Viewer role)."""
    service = SecurityService(db)
    incidents = await service.get_all_incidents()
    return list(incidents)


@router.post("", response_model=SecurityIncidentResponse, status_code=210)
async def report_security_incident(
    payload: SecurityIncidentCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: Any = Security(require_operator)
) -> Any:
    """Report a new security incident alert (requires Operator role)."""
    service = SecurityService(db)
    incident = await service.create_incident(payload.model_dump())
    return incident


@router.patch("/{incident_id}", response_model=SecurityIncidentResponse)
async def update_security_incident(
    incident_id: str = Path(..., description="The unique ID of the incident"),
    payload: SecurityIncidentUpdate = None,
    db: AsyncSession = Depends(get_db_session),
    current_user: Any = Security(require_operator)
) -> Any:
    """Update a security incident's status or details (requires Operator role)."""
    service = SecurityService(db)
    incident = await service.update_incident_status(incident_id, payload.model_dump(exclude_unset=True))
    if not incident:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("SecurityIncident", incident_id)
    return incident
