"""Vendor and inventory repository implementation."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.vendor import Vendor, VendorInventory
from app.repositories.base import BaseRepository


class VendorRepository(BaseRepository[Vendor]):
    """Data access repository for Vendor entities."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(Vendor, db)

    async def get_by_booth(self, booth_number: str) -> Vendor | None:
        """Fetch a vendor by its unique booth/stall number."""
        stmt = select(Vendor).where(
            Vendor.booth_number == booth_number,
            Vendor.deleted_at.is_(None)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()


class VendorInventoryRepository(BaseRepository[VendorInventory]):
    """Data access repository for VendorInventory entities."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(VendorInventory, db)

    async def get_low_stock_items(self, vendor_id: str | None = None) -> list[VendorInventory]:
        """Fetch inventory items that have crossed their restock thresholds."""
        stmt = select(VendorInventory).where(
            VendorInventory.is_low_stock.is_(True),
            VendorInventory.deleted_at.is_(None)
        )
        if vendor_id:
            stmt = stmt.where(VendorInventory.vendor_id == vendor_id)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
