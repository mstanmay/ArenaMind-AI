"""User repository implementation."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Data access repository for User entities."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(User, db)

    async def get_by_email(self, email: str, include_deleted: bool = False) -> User | None:
        """Fetch a user by email address."""
        stmt = select(User).where(User.email == email.lower().strip())
        if not include_deleted:
            stmt = stmt.where(User.deleted_at.is_(None))
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
