"""Parking intelligence API router endpoints."""

from typing import Any
from fastapi import APIRouter, Depends, Security, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.schemas.parking import ParkingLotResponse, ParkingLotCreate
from app.services.parking import ParkingService
from app.security.rbac import require_viewer, require_operator

router = APIRouter(tags=["Parking Intelligence"])


@router.get("", response_model=list[ParkingLotResponse])
async def list_parking_lots(
    db: AsyncSession = Depends(get_db_session),
    current_user: Any = Security(require_viewer)
) -> list[Any]:
    """Retrieve all stadium parking lot details (requires Viewer role)."""
    service = ParkingService(db)
    lots = await service.get_all_lots()
    return list(lots)


@router.post("", response_model=ParkingLotResponse, status_code=210)
async def create_parking_lot(
    payload: ParkingLotCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: Any = Security(require_operator)
) -> Any:
    """Register a new parking lot (requires Operator role)."""
    service = ParkingService(db)
    lot = await service.create_parking_lot(payload.model_dump())
    return lot


@router.post("/{lot_id}/occupancy/{new_occupancy}", response_model=ParkingLotResponse)
async def update_lot_occupancy(
    lot_id: str = Path(..., description="The unique ID of the parking lot"),
    new_occupancy: int = Path(..., ge=0, description="The newly updated vehicle headcount count"),
    db: AsyncSession = Depends(get_db_session),
    current_user: Any = Security(require_operator)
) -> Any:
    """Update a parking lot's occupancy metrics (requires Operator role)."""
    service = ParkingService(db)
    lot = await service.update_occupancy(lot_id, new_occupancy)
    if not lot:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("ParkingLot", lot_id)
    return lot
