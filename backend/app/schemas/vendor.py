"""Vendor and vendor inventory validation schemas."""

from datetime import datetime
from pydantic import BaseModel, Field


class VendorInventoryBase(BaseModel):
    item_name: str
    category: str = "food"
    quantity: int = Field(0, ge=0)
    unit_price: float = 0.0
    restock_threshold: int = 10
    is_low_stock: bool = False


class VendorInventoryCreate(VendorInventoryBase):
    vendor_id: str


class VendorInventoryUpdate(BaseModel):
    item_name: str | None = None
    category: str | None = None
    quantity: int | None = None
    unit_price: float | None = None
    restock_threshold: int | None = None
    is_low_stock: bool | None = None


class VendorInventoryResponse(VendorInventoryBase):
    id: str
    vendor_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VendorBase(BaseModel):
    name: str
    vendor_type: str = "food"
    zone: str
    booth_number: str
    is_active: bool = True
    rating: float = 4.0
    revenue_today: float = 0.0


class VendorCreate(VendorBase):
    pass


class VendorUpdate(BaseModel):
    name: str | None = None
    vendor_type: str | None = None
    zone: str | None = None
    booth_number: str | None = None
    is_active: bool | None = None
    rating: float | None = None
    revenue_today: float | None = None


class VendorResponse(VendorBase):
    id: str
    created_at: datetime
    updated_at: datetime
    inventory: list[VendorInventoryResponse] = []

    class Config:
        from_attributes = True
