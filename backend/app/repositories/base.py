"""Generic base repository implementing standard CRUD operations with soft delete filter."""

from typing import Generic, TypeVar, Sequence, Any
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Abstract base repository for generic database access."""

    def __init__(self, model: type[ModelType], db: AsyncSession) -> None:
        self.model = model
        self.db = db

    async def get_by_id(self, id: str, include_deleted: bool = False) -> ModelType | None:
        """Fetch an entity by its UUID."""
        stmt = select(self.model).where(self.model.id == id)
        if not include_deleted:
            stmt = stmt.where(self.model.deleted_at.is_(None))
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all(self, skip: int = 0, limit: int = 100, include_deleted: bool = False) -> Sequence[ModelType]:
        """Fetch multiple entities with pagination."""
        stmt = select(self.model).offset(skip).limit(limit)
        if not include_deleted:
            stmt = stmt.where(self.model.deleted_at.is_(None))
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def create(self, entity: ModelType) -> ModelType:
        """Persist a new entity to the database."""
        self.db.add(entity)
        await self.db.flush()
        return entity

    async def update(self, id: str, values: dict[str, Any]) -> ModelType | None:
        """Perform an update on an entity by ID."""
        stmt = (
            update(self.model)
            .where(self.model.id == id, self.model.deleted_at.is_(None))
            .values(**values)
            .execution_options(synchronize_session="fetch")
        )
        await self.db.execute(stmt)
        await self.db.flush()
        return await self.get_by_id(id)

    async def delete(self, id: str, soft: bool = True) -> bool:
        """Delete an entity by ID (defaults to soft delete)."""
        entity = await self.get_by_id(id)
        if not entity:
            return False

        if soft:
            entity.soft_delete()
            self.db.add(entity)
        else:
            await self.db.delete(entity)
        
        await self.db.flush()
        return True
