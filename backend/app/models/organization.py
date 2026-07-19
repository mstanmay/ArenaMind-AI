"""Organization model — multi-tenant entity for stadium operators."""

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Organization(Base):
    __tablename__ = "organizations"

    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    stadium_name: Mapped[str] = mapped_column(String(255), nullable=False)
    stadium_capacity: Mapped[int] = mapped_column(nullable=False, default=80000)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Relationships
    members = relationship("User", back_populates="organization", lazy="selectin")
