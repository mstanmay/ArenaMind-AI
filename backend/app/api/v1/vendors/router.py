"""Vendor intelligence API router endpoints."""

from typing import Any
from fastapi import APIRouter, Depends, Security, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.schemas.vendor import VendorResponse, VendorCreate, VendorInventoryResponse, VendorInventoryCreate
from app.services.vendor import VendorService
from app.security.rbac import require_viewer, require_operator

router = APIRouter(tags=["Vendor Intelligence"])


@router.get("", response_model=list[VendorResponse])
async def list_vendors(
    db: AsyncSession = Depends(get_db_session),
    current_user: Any = Security(require_viewer)
) -> list[Any]:
    """Retrieve details for all stadium vendors (requires Viewer role)."""
    service = VendorService(db)
    vendors = await service.get_all_vendors()
    return list(vendors)


@router.post("", response_model=VendorResponse, status_code=210)
async def create_vendor_booth(
    payload: VendorCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: Any = Security(require_operator)
) -> Any:
    """Create a new vendor booth location (requires Operator role)."""
    service = VendorService(db)
    vendor = await service.create_vendor(payload.model_dump())
    return vendor


@router.post("/inventory", response_model=VendorInventoryResponse, status_code=210)
async def add_vendor_inventory(
    payload: VendorInventoryCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: Any = Security(require_operator)
) -> Any:
    """Add a stock item to a vendor's inventory logs (requires Operator role)."""
    service = VendorService(db)
    item = await service.add_inventory_item(payload.model_dump())
    return item


@router.post("/inventory/{item_id}/quantity/{quantity}", response_model=VendorInventoryResponse)
async def update_item_stock(
    item_id: str = Path(..., description="The unique ID of the inventory item"),
    quantity: int = Path(..., ge=0, description="The newly updated quantity level"),
    db: AsyncSession = Depends(get_db_session),
    current_user: Any = Security(require_operator)
) -> Any:
    """Update stock quantity levels for an inventory item (requires Operator role)."""
    service = VendorService(db)
    item = await service.update_item_quantity(item_id, quantity)
    if not item:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("VendorInventory", item_id)
    return item
