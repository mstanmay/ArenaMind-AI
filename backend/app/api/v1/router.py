"""Central API v1 router aggregation."""

from fastapi import APIRouter

from app.api.v1.auth.router import router as auth_router
from app.api.v1.users.router import router as users_router
from app.api.v1.agents.router import router as agents_router
from app.api.v1.crowd.router import router as crowd_router
from app.api.v1.parking.router import router as parking_router
from app.api.v1.security.router import router as security_router
from app.api.v1.medical.router import router as medical_router
from app.api.v1.vendors.router import router as vendors_router
from app.api.v1.tournament.router import router as tournament_router
from app.api.v1.weather.router import router as weather_router
from app.api.v1.analytics.router import router as analytics_router
from app.api.v1.voice.router import router as voice_router
from app.api.v1.digital_twin.router import router as digital_twin_router
from app.api.v1.reports.router import router as reports_router
from app.api.v1.audit.router import router as audit_router

api_v1_router = APIRouter()

# ── Health Endpoint ──────────────────────────────────────
@api_v1_router.get("/health", tags=["System Health"])
async def health_check() -> dict:
    """Return the service operational status."""
    return {"status": "healthy"}

# ── Feature Routers ──────────────────────────────────────
api_v1_router.include_router(auth_router, prefix="/auth")
api_v1_router.include_router(users_router, prefix="/users")
api_v1_router.include_router(agents_router, prefix="/agents")
api_v1_router.include_router(crowd_router, prefix="/crowd")
api_v1_router.include_router(parking_router, prefix="/parking")
api_v1_router.include_router(security_router, prefix="/security")
api_v1_router.include_router(medical_router, prefix="/medical")
api_v1_router.include_router(vendors_router, prefix="/vendors")
api_v1_router.include_router(tournament_router, prefix="/tournament")
api_v1_router.include_router(weather_router, prefix="/weather")
api_v1_router.include_router(analytics_router, prefix="/analytics")
api_v1_router.include_router(voice_router, prefix="/voice")
api_v1_router.include_router(digital_twin_router, prefix="/digital-twin")
api_v1_router.include_router(reports_router, prefix="/reports")
api_v1_router.include_router(audit_router, prefix="/audit")
