"""Authentication and multi-factor authorization API router."""

import json
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Security
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.core.database import get_db_session
from app.core.exceptions import (
    ValidationError,
    AuthenticationError,
    ConflictError,
    AccountLockedError,
    MFARequiredError,
    MFAInvalidError,
    PasswordComplexityError,
    NotFoundError,
)
from app.schemas.auth import (
    TokenSchema,
    UserRegisterSchema,
    MFASetupResponseSchema,
    MFAValidateSchema,
    PasswordChangeSchema,
    PasswordResetRequestSchema,
    PasswordResetConfirmSchema,
    DeviceResponseSchema,
)
from app.schemas.user import UserResponseSchema
from app.repositories.user import UserRepository
from app.repositories.organization import OrganizationRepository
from app.models.user import User
from app.models.organization import Organization
from app.models.refresh_token import RefreshToken
from app.models.user_device import UserDevice
from app.models.login_attempt import LoginAttempt
from app.security.password import verify_password, hash_password, validate_password_complexity
from app.security.jwt import create_access_token, create_refresh_token, verify_token, hash_token
from app.security.rbac import get_current_user
from app.security.mfa import (
    generate_totp_secret,
    get_totp_uri,
    verify_totp_code,
    generate_recovery_codes,
    hash_recovery_code,
    encrypt_secret,
    decrypt_secret,
)
from app.core.config import get_settings
from app.core.logging import get_logger

router = APIRouter(tags=["Authentication"])
logger = get_logger("auth_router")


async def track_login_attempt(
    db: AsyncSession,
    email: str,
    ip: str | None,
    ua: str | None,
    success: bool,
    reason: str | None = None,
) -> None:
    """Record an authentication attempt for audit logging."""
    attempt = LoginAttempt(
        email=email.lower().strip(),
        ip_address=ip,
        user_agent=ua,
        success=success,
        failure_reason=reason,
    )
    db.add(attempt)
    await db.flush()


@router.post("/register", response_model=UserResponseSchema, status_code=201)
async def register(
    payload: UserRegisterSchema,
    db: AsyncSession = Depends(get_db_session)
) -> User:
    """Register a new user, checking password complexity rules."""
    user_repo = UserRepository(db)
    org_repo = OrganizationRepository(db)

    # 1. Validate password complexity
    violations = validate_password_complexity(payload.password)
    if violations:
        raise PasswordComplexityError(violations)

    # 2. Check duplicate email
    existing_user = await user_repo.get_by_email(payload.email)
    if existing_user:
        raise ConflictError("A user with this email address already exists")

    org_id = None
    if payload.organization_name:
        slug = payload.organization_name.lower().replace(" ", "-")
        existing_org = await org_repo.get_by_slug(slug)
        if existing_org:
            org = existing_org
        else:
            org = Organization(
                name=payload.organization_name,
                slug=slug,
                stadium_name=f"{payload.organization_name} Stadium"
            )
            await org_repo.create(org)
        org_id = org.id

    new_user = User(
        email=payload.email.lower().strip(),
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role="viewer",  # Default role changed to viewer for security
        organization_id=org_id,
        is_verified=False
    )
    
    await user_repo.create(new_user)
    
    # Anchor the user registration on audit log
    try:
        from app.models.audit_log import AuditLog
        audit_log = AuditLog(
            event_type="permission_change",
            actor_id=new_user.id,
            organization_id=org_id,
            payload={"action": "user_registered", "email": new_user.email, "role": new_user.role},
            risk_level="low",
            verification_status="verified",
            database="PostgreSQL"
        )
        db.add(audit_log)
        await db.flush()
    except Exception as e:
        logger.error("registration_audit_log_failed", error=str(e))

    # Refresh user to load lazy properties and avoid MissingGreenlet
    await db.refresh(new_user)
    return new_user


@router.post("/login", response_model=TokenSchema)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db_session)
) -> dict:
    """Authenticate credentials and issue JWT tokens or trigger MFA/lockout challenges."""
    user_repo = UserRepository(db)
    user = await user_repo.get_by_email(form_data.username)
    settings = get_settings()

    # 1. Lockout check
    if user and user.locked_until:
        now = datetime.now(timezone.utc)
        locked_until = user.locked_until
        if locked_until.tzinfo is None:
            now = now.replace(tzinfo=None)
        if locked_until > now:
            time_left = int((locked_until - now).total_seconds() / 60)
            await track_login_attempt(db, form_data.username, None, None, False, "Account locked")
            raise AccountLockedError(minutes_remaining=max(1, time_left))
        else:
            # Lockout expired, reset it
            user.locked_until = None
            user.failed_login_count = 0
            db.add(user)

    # 2. Verify existence and password
    if not user or not verify_password(form_data.password, user.hashed_password):
        if user:
            user.failed_login_count += 1
            if user.failed_login_count >= settings.account_lockout_threshold:
                lock_duration = timedelta(minutes=settings.account_lockout_duration_minutes)
                user.locked_until = datetime.now(timezone.utc) + lock_duration
                logger.warning("user_account_locked", email=user.email)
            db.add(user)
        
        await track_login_attempt(db, form_data.username, None, None, False, "Invalid credentials")
        raise AuthenticationError("Invalid email or password combination")

    if not user.is_active:
        await track_login_attempt(db, form_data.username, None, None, False, "Inactive account")
        raise AuthenticationError("User account has been disabled")

    # Clear failed logins on successful verify
    user.failed_login_count = 0
    db.add(user)

    # 3. Check MFA status
    if user.mfa_enabled:
        # Check if the device is remembered/trusted
        # In a real app we'd receive device fingerprint from login request body.
        # Since OAuth2PasswordRequestForm is standard, we require MFA validation endpoint.
        await track_login_attempt(db, user.email, None, None, True, "MFA Challenge Required")
        return {
            "access_token": "",
            "refresh_token": "",
            "mfa_required": True,
            "token_type": "bearer"
        }

    # 4. Generate Tokens
    access = create_access_token(subject=user.id, role=user.role)
    refresh = create_refresh_token(subject=user.id)
    
    # Persist refresh token hash
    rt_hash = hash_token(refresh)
    rt_expires = datetime.now(timezone.utc) + timedelta(days=settings.jwt_refresh_token_expire_days)
    rt_record = RefreshToken(
        user_id=user.id,
        token_hash=rt_hash,
        expires_at=rt_expires
    )
    db.add(rt_record)

    await track_login_attempt(db, user.email, None, None, True)
    return {
        "access_token": access,
        "refresh_token": refresh,
        "mfa_required": False,
        "token_type": "bearer"
    }


@router.post("/mfa/setup", response_model=MFASetupResponseSchema)
async def setup_mfa(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Security(get_current_user)
) -> dict:
    """Initialize TOTP secret key generation and recovery codes for enrollment."""
    if current_user.mfa_enabled:
        raise ConflictError("MFA is already enabled on this account")

    totp_secret = generate_totp_secret()
    recovery = generate_recovery_codes()
    hashed_recovery = [hash_recovery_code(code) for code in recovery]

    # Store serialized payload securely
    mfa_payload = {
        "secret": totp_secret,
        "recovery_codes": hashed_recovery
    }
    current_user.mfa_secret_encrypted = encrypt_secret(json.dumps(mfa_payload))
    db.add(current_user)

    otp_uri = get_totp_uri(totp_secret, current_user.email)

    return {
        "secret": totp_secret,
        "otpauth_uri": otp_uri,
        "recovery_codes": recovery
    }


@router.post("/mfa/verify", response_model=UserResponseSchema)
async def verify_mfa_setup(
    payload: MFAValidateSchema,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Security(get_current_user)
) -> User:
    """Verify setup code to finalize and enable MFA."""
    if current_user.mfa_enabled:
        raise ConflictError("MFA is already enabled")

    if not current_user.mfa_secret_encrypted:
        raise ValidationError("MFA setup has not been initialized")

    # Decrypt TOTP secret
    mfa_data = json.loads(decrypt_secret(current_user.mfa_secret_encrypted))
    secret = mfa_data.get("secret")

    if not verify_totp_code(secret, payload.code):
        raise MFAInvalidError()

    current_user.mfa_enabled = True
    db.add(current_user)

    # Database event logging
    try:
        from app.models.audit_log import AuditLog
        audit_log = AuditLog(
            action="mfa_enabled",
            entity_type="user",
            entity_id=current_user.id,
            actor_id=current_user.id,
            actor_type="user",
            details="User enabled multi-factor authentication (MFA)."
        )
        db.add(audit_log)
        await db.flush()
    except Exception as e:
        logger.error("mfa_enable_audit_log_failed", error=str(e))

    # Refresh current_user to load database attributes cleanly and avoid MissingGreenlet
    await db.refresh(current_user)
    return current_user


@router.post("/mfa/validate", response_model=TokenSchema)
async def validate_mfa_challenge(
    payload: MFAValidateSchema,
    db: AsyncSession = Depends(get_db_session)
) -> dict:
    """Validate TOTP or recovery code to complete login challenge."""
    user_repo = UserRepository(db)
    user = await user_repo.get_by_email(payload.email)
    settings = get_settings()

    if not user or not user.mfa_enabled or not user.mfa_secret_encrypted:
        raise AuthenticationError("MFA not enabled or user not found")

    mfa_data = json.loads(decrypt_secret(user.mfa_secret_encrypted))
    secret = mfa_data.get("secret")
    recovery_hashes = mfa_data.get("recovery_codes", [])

    is_valid = False
    used_recovery = False
    
    # 1. Check TOTP code
    if verify_totp_code(secret, payload.code):
        is_valid = True
    # 2. Check Recovery codes
    else:
        incoming_hash = hash_recovery_code(payload.code)
        if incoming_hash in recovery_hashes:
            is_valid = True
            used_recovery = True
            recovery_hashes.remove(incoming_hash)
            # Reserialize and save remaining recovery codes
            mfa_data["recovery_codes"] = recovery_hashes
            user.mfa_secret_encrypted = encrypt_secret(json.dumps(mfa_data))
            db.add(user)

    if not is_valid:
        await track_login_attempt(db, payload.email, None, None, False, "Invalid MFA Code")
        raise MFAInvalidError()

    # If device fingerprinting requested
    device_trusted = False
    if payload.device_fingerprint:
        # Check if device is trusted or update it
        stmt = select(UserDevice).where(
            UserDevice.user_id == user.id,
            UserDevice.device_fingerprint == payload.device_fingerprint
        )
        res = await db.execute(stmt)
        device = res.scalar_one_or_none()

        trusted_until = datetime.now(timezone.utc) + timedelta(days=settings.trusted_device_ttl_days)
        if device:
            device.last_login_at = datetime.now(timezone.utc)
            device.is_trusted = True
            device.trusted_until = trusted_until
            db.add(device)
        else:
            device = UserDevice(
                user_id=user.id,
                device_fingerprint=payload.device_fingerprint,
                device_name=payload.device_name or "Unknown Device",
                is_trusted=True,
                trusted_until=trusted_until,
                last_login_at=datetime.now(timezone.utc)
            )
            db.add(device)
        device_trusted = True

    # Generate tokens
    access = create_access_token(
        subject=user.id,
        role=user.role,
        device_fingerprint=payload.device_fingerprint
    )
    refresh = create_refresh_token(subject=user.id)

    # Save refresh token hash
    rt_hash = hash_token(refresh)
    rt_expires = datetime.now(timezone.utc) + timedelta(days=settings.jwt_refresh_token_expire_days)
    rt_record = RefreshToken(
        user_id=user.id,
        token_hash=rt_hash,
        expires_at=rt_expires
    )
    db.add(rt_record)

    await track_login_attempt(db, user.email, None, None, True, "MFA Success")
    return {
        "access_token": access,
        "refresh_token": refresh,
        "mfa_required": False,
        "device_trusted": device_trusted,
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=TokenSchema)
async def refresh_tokens(
    refresh_token: str,
    db: AsyncSession = Depends(get_db_session)
) -> dict:
    """Exchange a refresh token for new access/refresh pair, supporting token rotation."""
    try:
        payload = verify_token(refresh_token, expected_type="refresh")
        user_id = payload.get("sub")
    except Exception:
        raise AuthenticationError("Invalid or expired refresh token")

    if not user_id:
        raise AuthenticationError("Invalid token subject credentials")

    # Find the refresh token record in the DB
    rt_hash = hash_token(refresh_token)
    stmt = select(RefreshToken).where(RefreshToken.token_hash == rt_hash)
    res = await db.execute(stmt)
    rt_record = res.scalar_one_or_none()

    # Token rotation reuse detection (Replay Attack mitigation)
    if rt_record and rt_record.revoked:
        # Replay breach! Revoke all tokens for this user for security
        stmt_revoke = update(RefreshToken).where(RefreshToken.user_id == user_id).values(
            revoked=True,
            revoked_at=datetime.now(timezone.utc)
        )
        await db.execute(stmt_revoke)
        logger.critical("refresh_token_reuse_detected", user_id=user_id)
        raise AuthenticationError("Breach alert: Refresh token has already been spent. All active sessions invalidated.")

    # Make sure we compare naive and aware datetimes correctly
    now = datetime.now(timezone.utc)
    expires_at = rt_record.expires_at
    if expires_at.tzinfo is None:
        now = now.replace(tzinfo=None)

    if not rt_record or expires_at < now:
        raise AuthenticationError("Invalid or expired refresh token")

    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    if not user or not user.is_active:
        raise AuthenticationError("Account has been disabled or does not exist")

    # Spend the token
    rt_record.revoked = True
    rt_record.revoked_at = datetime.now(timezone.utc)
    db.add(rt_record)

    # Generate new pair
    settings = get_settings()
    access = create_access_token(subject=user.id, role=user.role)
    refresh = create_refresh_token(subject=user.id)

    # Record new refresh token hash
    new_hash = hash_token(refresh)
    new_expires = datetime.now(timezone.utc) + timedelta(days=settings.jwt_refresh_token_expire_days)
    new_record = RefreshToken(
        user_id=user.id,
        token_hash=new_hash,
        expires_at=new_expires
    )
    db.add(new_record)
    await db.flush()

    # Link rotation chain
    rt_record.replaced_by = new_record.id
    db.add(rt_record)

    return {
        "access_token": access,
        "refresh_token": refresh,
        "mfa_required": False,
        "token_type": "bearer"
    }


@router.post("/logout")
async def logout(
    refresh_token: str,
    db: AsyncSession = Depends(get_db_session)
) -> dict:
    """Revoke a refresh token to securely terminate a session."""
    rt_hash = hash_token(refresh_token)
    stmt = select(RefreshToken).where(RefreshToken.token_hash == rt_hash)
    res = await db.execute(stmt)
    rt_record = res.scalar_one_or_none()

    if rt_record:
        rt_record.revoked = True
        rt_record.revoked_at = datetime.now(timezone.utc)
        db.add(rt_record)

    return {"status": "success", "message": "Successfully logged out"}


@router.post("/password/change")
async def change_password(
    payload: PasswordChangeSchema,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Security(get_current_user)
) -> dict:
    """Change current user password after complexity validation."""
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise AuthenticationError("Invalid current password")

    violations = validate_password_complexity(payload.new_password)
    if violations:
        raise PasswordComplexityError(violations)

    current_user.hashed_password = hash_password(payload.new_password)
    current_user.password_changed_at = datetime.now(timezone.utc)
    db.add(current_user)

    # Database event logging
    try:
        from app.models.audit_log import AuditLog
        audit_log = AuditLog(
            action="password_changed",
            entity_type="user",
            entity_id=current_user.id,
            actor_id=current_user.id,
            actor_type="user",
            details="User changed account password."
        )
        db.add(audit_log)
        await db.flush()
    except Exception as e:
        logger.error("password_change_audit_log_failed", error=str(e))

    return {"status": "success", "message": "Password changed successfully"}
