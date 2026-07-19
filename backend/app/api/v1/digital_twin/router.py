"""Digital Twin 3D assets API router endpoints."""

from typing import Any
from fastapi import APIRouter, Security
from app.security.rbac import require_viewer

router = APIRouter(tags=["Digital Twin 3D"])


@router.get("/assets", response_model=dict[str, Any])
async def list_digital_twin_coordinates(
    current_user: Any = Security(require_viewer)
) -> dict[str, Any]:
    """Retrieve spatial coordinate layout mappings for all stadium cameras, gates, and booths (requires Viewer role)."""
    # High fidelity mockup response matching typical Digital Twin coordinates
    return {
        "stadium": "Main Arena Twin",
        "spatial_grid_dimensions": {"x": 500, "y": 200, "z": 500},
        "assets": [
            {
                "id": "CAM_01",
                "name": "North Gate CCTV 1",
                "type": "camera",
                "coordinates": {"x": -120.5, "y": 15.0, "z": 240.2},
                "status": "online"
            },
            {
                "id": "GATE_04",
                "name": "Turnstile Block 4",
                "type": "gate",
                "coordinates": {"x": 10.0, "y": 0.0, "z": -180.5},
                "status": "online"
            },
            {
                "id": "BOOTH_A1",
                "name": "Hot Dog Palace Stand",
                "type": "vendor",
                "coordinates": {"x": -85.2, "y": 2.5, "z": 45.1},
                "status": "online"
            }
        ]
    }
