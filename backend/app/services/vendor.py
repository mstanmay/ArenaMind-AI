"""Vendor management service layer."""

from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.vendor import Vendor, VendorInventory
from app.repositories.vendor import VendorRepository, VendorInventoryRepository

logger = get_logger("service_vendor")


class VendorService:
    """Business logic for vendor booth sales and inventory tracking."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.vendor_repo = VendorRepository(db)
        self.inventory_repo = VendorInventoryRepository(db)

    async def get_all_vendors(self) -> list[Vendor]:
        """Fetch all vendors."""
        results = await self.vendor_repo.get_all()
        return list(results)

    async def get_vendor_by_booth(self, booth_number: str) -> Vendor | None:
        """Fetch a vendor by its booth number."""
        return await self.vendor_repo.get_by_booth(booth_number)

    async def create_vendor(self, data: dict[str, Any]) -> Vendor:
        """Create a new vendor booth."""
        vendor = Vendor(
            name=data["name"],
            vendor_type=data.get("vendor_type", "food"),
            zone=data["zone"],
            booth_number=data["booth_number"],
            is_active=data.get("is_active", True),
            rating=float(data.get("rating", 4.0)),
            revenue_today=float(data.get("revenue_today", 0.0))
        )
        await self.vendor_repo.create(vendor)
        return vendor

    async def add_inventory_item(self, data: dict[str, Any]) -> VendorInventory:
        """Add a stock item to a vendor's inventory list."""
        item = VendorInventory(
            vendor_id=data["vendor_id"],
            item_name=data["item_name"],
            category=data.get("category", "food"),
            quantity=int(data["quantity"]),
            unit_price=float(data.get("unit_price", 0.0)),
            restock_threshold=int(data.get("restock_threshold", 10)),
            is_low_stock=int(data["quantity"]) <= int(data.get("restock_threshold", 10))
        )
        await self.inventory_repo.create(item)
        return item

    async def update_item_quantity(self, item_id: str, new_qty: int) -> VendorInventory | None:
        """Update an inventory item's quantity level and evaluate low-stock state."""
        item = await self.inventory_repo.get_by_id(item_id)
        if not item:
            return None

        is_low = new_qty <= item.restock_threshold
        
        updated_item = await self.inventory_repo.update(
            item_id, 
            {"quantity": new_qty, "is_low_stock": is_low}
        )
        return updated_item
