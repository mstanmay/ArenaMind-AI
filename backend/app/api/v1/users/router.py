"""User API router endpoints."""

from fastapi import APIRouter, Depends, Security
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.core.exceptions import NotFoundError, ConflictError
from app.schemas.user import UserResponseSchema, UserUpdateSchema, UserCreateSchema
from app.repositories.user import UserRepository
from app.models.user import User
from app.security.rbac import require_admin, require_operator, get_current_user
from app.security.password import hash_password

router = APIRouter(tags=["Users"])


@router.get("/me", response_model=UserResponseSchema)
async def get_me(current_user: User = Depends(get_current_user)) -> User:
    """Retrieve details of the currently authenticated user."""
    return current_user


@router.get("", response_model=list[UserResponseSchema])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Security(require_operator),
    db: AsyncSession = Depends(get_db_session)
) -> list[User]:
    """Retrieve a paginated list of users (requires Operator privileges)."""
    user_repo = UserRepository(db)
    users = await user_repo.get_all(skip=skip, limit=limit)
    return list(users)


@router.post("", response_model=UserResponseSchema, status_code=210)
async def create_user(
    payload: UserCreateSchema,
    current_user: User = Security(require_admin),
    db: AsyncSession = Depends(get_db_session)
) -> User:
    """Create a new user manually (requires Admin privileges)."""
    user_repo = UserRepository(db)
    
    existing_user = await user_repo.get_by_email(payload.email)
    if existing_user:
        raise ConflictError("A user with this email address already exists")

    new_user = User(
        email=payload.email.lower().strip(),
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role,
        is_active=payload.is_active,
        avatar_url=payload.avatar_url,
        phone=payload.phone,
        organization_id=payload.organization_id
    )

    await user_repo.create(new_user)
    return new_user


@router.patch("/{user_id}", response_model=UserResponseSchema)
async def update_user(
    user_id: str,
    payload: UserUpdateSchema,
    current_user: User = Security(require_operator),
    db: AsyncSession = Depends(get_db_session)
) -> User:
    """Update a user's details. Users can update themselves; admins/operators can update anyone."""
    user_repo = UserRepository(db)
    
    # Permission check: can only update self, unless operator/admin
    if current_user.id != user_id and current_user.role not in ["admin", "operator"]:
        from app.core.exceptions import AuthorizationError
        raise AuthorizationError("You do not have permission to update this user profile")

    user = await user_repo.get_by_id(user_id)
    if not user:
        raise NotFoundError("User", user_id)

    # Perform updates
    update_data = payload.model_dump(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        update_data["hashed_password"] = hash_password(update_data.pop("password"))
    
    updated_user = await user_repo.update(user_id, update_data)
    if not updated_user:
        raise NotFoundError("User", user_id)
        
    return updated_user


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: str,
    current_user: User = Security(require_admin),
    db: AsyncSession = Depends(get_db_session)
) -> None:
    """Soft delete a user by ID (requires Admin privileges)."""
    user_repo = UserRepository(db)
    success = await user_repo.delete(user_id, soft=True)
    if not success:
        raise NotFoundError("User", user_id)
