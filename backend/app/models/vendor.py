"""Vendor and vendor inventory models."""

from sqlalchemy import String, Integer, Float, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Vendor(Base):
    __tablename__ = "vendors"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    vendor_type: Mapped[str] = mapped_column(String(50), nullable=False, default="food")
    zone: Mapped[str] = mapped_column(String(100), nullable=False)
    booth_number: Mapped[str] = mapped_column(String(20), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    rating: Mapped[float] = mapped_column(Float, nullable=False, default=4.0)
    revenue_today: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    inventory = relationship("VendorInventory", back_populates="vendor", lazy="selectin")


class VendorInventory(Base):
    __tablename__ = "vendor_inventory"

    vendor_id: Mapped[str] = mapped_column(String(36), ForeignKey("vendors.id"), nullable=False)
    item_name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False, default="food")
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    restock_threshold: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    is_low_stock: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    vendor = relationship("Vendor", back_populates="inventory")
