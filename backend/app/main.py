"""ArenaMind AI — FastAPI Application Entry Point.

This is the main application factory with lifespan management,
middleware stack, CORS, exception handlers, and router mounting.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import init_db, close_db
from app.core.redis import get_redis_pool, close_redis
from app.core.logging import setup_logging, get_logger
from app.middleware.correlation_id import CorrelationIdMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.middleware.request_logging import RequestLoggingMiddleware
from app.middleware.error_handler import register_exception_handlers

logger = get_logger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown hooks."""
    settings = get_settings()
    setup_logging()

    logger.info(
        "application_starting",
        app_name=settings.app_name,
        environment=settings.app_env,
        version=settings.app_version,
    )

    if settings.is_development:
        await init_db()
        logger.info("database_initialized", mode="development_auto_create")

        # Seed default operator user for frontend testing
        try:
            from app.core.database import async_session_factory
            from app.repositories.user import UserRepository
            from app.models.user import User
            from app.security.password import hash_password
            
            async with async_session_factory() as session:
                user_repo = UserRepository(session)
                existing = await user_repo.get_by_email("operator@arenamind.ai")
                if not existing:
                    default_operator = User(
                        email="operator@arenamind.ai",
                        hashed_password=hash_password("ComplexSecureP@ss4862"),
                        full_name="Operations Center Controller",
                        role="operator",
                        is_active=True,
                        is_verified=True
                    )
                    await user_repo.create(default_operator)
                    await session.commit()
                    logger.info("default_operator_user_seeded")

            # Seed audit log demo records
            from app.models.audit_log import AuditLog
            from sqlalchemy import select as sa_select

            async with async_session_factory() as session:
                # Check if audit log data already exists
                existing_logs = await session.execute(
                    sa_select(AuditLog).limit(1)
                )
                if not existing_logs.scalar_one_or_none():
                    demo_events = [
                        {
                            "action": "perimeter_breach_detected",
                            "entity_type": "security",
                            "details": "Perimeter breach detected at Zone Gate-7 North, camera CAM-14, severity high"
                        },
                        {
                            "action": "crowd_reroute_activated",
                            "entity_type": "ai_decision",
                            "details": "AI Copilot activated crowd reroute from Gate-4 to Gate-6 with confidence 0.94"
                        },
                        {
                            "action": "medical_team_dispatched",
                            "entity_type": "emergency",
                            "details": "Medical team dispatched to Section-212 Row-F, responder unit MED-03"
                        },
                        {
                            "action": "vip_suite_access_granted",
                            "entity_type": "vip_access",
                            "details": "VIP suite access granted to suite Diamond-A using biometric credential"
                        },
                        {
                            "action": "operator_role_elevated",
                            "entity_type": "permission",
                            "details": "Operator role elevated for user field_ops_02 from viewer to operator"
                        },
                        {
                            "action": "unattended_package_cleared",
                            "entity_type": "security",
                            "details": "Unattended package cleared at Zone Concourse-B, resolution false_alarm, camera CAM-22"
                        },
                        {
                            "action": "parking_lot_overflow_predicted",
                            "entity_type": "ai_decision",
                            "details": "AI Copilot predicted parking lot overflow at P3-East (ETA 12 minutes) with confidence 0.91"
                        },
                        {
                            "action": "fire_suppression_test_logged",
                            "entity_type": "emergency",
                            "details": "Fire suppression test logged at Zone Kitchen-Wing-2 with status passed"
                        },
                    ]
                    for event_data in demo_events:
                        log_entry = AuditLog(
                            action=event_data["action"],
                            entity_type=event_data["entity_type"],
                            actor_type="system",
                            details=event_data["details"]
                        )
                        session.add(log_entry)
                    await session.commit()
                    logger.info("audit_log_demo_data_seeded", count=len(demo_events))

        except Exception as e:
            logger.error("seeding_default_data_failed", error=str(e))

    try:
        await get_redis_pool()
        logger.info("redis_pool_ready")
    except Exception as e:
        logger.warning("redis_unavailable", error=str(e))

    logger.info("application_ready", port=settings.app_port)

    yield

    # ── Shutdown ─────────────────────────────────────
    logger.info("application_shutting_down")
    await close_db()
    await close_redis()
    logger.info("application_stopped")


def create_app() -> FastAPI:
    """Application factory — creates and configures the FastAPI instance."""
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        description=(
            "Enterprise Agentic AI Platform for Smart Stadium Operations. "
            "Multi-agent decision system with LangGraph, real-time event processing, "
            "and predictive analytics."
        ),
        version=settings.app_version,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # ── CORS ─────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID"],
    )

    # ── Middleware Stack (order matters: outermost first) ──
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(CorrelationIdMiddleware)

    # ── Exception Handlers ───────────────────────────
    register_exception_handlers(app)

    # ── Routers ──────────────────────────────────────
    _register_routers(app)

    return app


def _register_routers(app: FastAPI) -> None:
    """Mount all API routers."""
    from app.api.v1.router import api_v1_router

    app.include_router(api_v1_router, prefix="/api/v1")


# Create the app instance (used by uvicorn)
app = create_app()
