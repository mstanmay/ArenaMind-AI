"""Medical dispatch API router endpoints."""

from typing import Any
from fastapi import APIRouter, Depends, Security, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.schemas.medical import MedicalIncidentResponse, MedicalIncidentCreate, MedicalIncidentUpdate
from app.services.medical import MedicalService
from app.security.rbac import require_viewer, require_operator

router = APIRouter(tags=["Medical Center"])


@router.get("", response_model=list[MedicalIncidentResponse])
async def list_medical_incidents(
    db: AsyncSession = Depends(get_db_session),
    current_user: Any = Security(require_viewer)
) -> list[Any]:
    """Retrieve all logged medical incidents (requires Viewer role)."""
    service = MedicalService(db)
    incidents = await service.get_all_incidents()
    return list(incidents)


@router.post("", response_model=MedicalIncidentResponse, status_code=210)
async def report_medical_incident(
    payload: MedicalIncidentCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: Any = Security(require_operator)
) -> Any:
    """Report a new medical emergency incident (requires Operator role)."""
    service = MedicalService(db)
    incident = await service.create_incident(payload.model_dump())
    return incident


@router.patch("/{incident_id}", response_model=MedicalIncidentResponse)
async def update_medical_incident(
    incident_id: str = Path(..., description="The unique ID of the incident"),
    payload: MedicalIncidentUpdate = None,
    db: AsyncSession = Depends(get_db_session),
    current_user: Any = Security(require_operator)
) -> Any:
    """Update medical incident status or team dispatches (requires Operator role)."""
    service = MedicalService(db)
    incident = await service.update_incident(incident_id, payload.model_dump(exclude_unset=True))
    if not incident:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("MedicalIncident", incident_id)
    return incident
