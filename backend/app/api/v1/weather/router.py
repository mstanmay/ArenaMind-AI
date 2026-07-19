"""Weather telemetry API router endpoints."""

from typing import Any
from fastapi import APIRouter, Security
from app.langgraph.tools.stadium_tools import check_weather_telemetry
from app.security.rbac import require_viewer

router = APIRouter(tags=["Weather Telemetry"])


@router.get("", response_model=dict[str, Any])
async def get_current_weather_conditions(
    current_user: Any = Security(require_viewer)
) -> dict[str, Any]:
    """Retrieve real-time meteorologic telemetry for the stadium region (requires Viewer role)."""
    # Direct execution of weather telemetry tool function
    return await check_weather_telemetry()
