"""LangChain tools for querying and modifying stadium operations state."""

from typing import Any
from langchain_core.tools import tool
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_factory
from app.repositories.crowd import CrowdSnapshotRepository
from app.repositories.parking import ParkingLotRepository
from app.repositories.security import SecurityIncidentRepository
from app.repositories.vendor import VendorInventoryRepository
from app.repositories.medical import MedicalIncidentRepository


@tool
async def get_crowd_density(zone: str | None = None) -> dict[str, Any]:
    """Retrieve real-time crowd headcount and density percentages by zone or for the entire stadium.

    Use this when verifying entrance delays or stand congestion.
    """
    async with async_session_factory() as db:
        repo = CrowdSnapshotRepository(db)
        if zone:
            snap = await repo.get_latest_by_zone(zone)
            if snap:
                return {
                    "zone": snap.zone,
                    "density_percent": snap.density_percent,
                    "headcount": snap.headcount,
                    "capacity": snap.capacity,
                    "flow_rate": snap.flow_rate,
                    "risk_level": snap.risk_level
                }
            return {"error": f"No telemetry recorded for zone {zone}"}
        else:
            snaps = await repo.get_latest_for_all_zones()
            return {
                "zones": [
                    {
                        "zone": s.zone,
                        "density_percent": s.density_percent,
                        "headcount": s.headcount,
                        "risk_level": s.risk_level
                    } for s in snaps
                ]
            }


@tool
async def get_parking_status(lot_name: str | None = None) -> dict[str, Any]:
    """Check the real-time capacity and occupancy metrics of the stadium parking lots.

    Use this when drivers report parking congestion or when overflow parking routing is needed.
    """
    async with async_session_factory() as db:
        repo = ParkingLotRepository(db)
        if lot_name:
            lot = await repo.get_by_name(lot_name)
            if lot:
                return {
                    "name": lot.name,
                    "zone": lot.zone,
                    "occupancy_percent": lot.occupancy_percent,
                    "current_occupancy": lot.current_occupancy,
                    "total_capacity": lot.total_capacity,
                    "status": lot.status
                }
            return {"error": f"Parking lot {lot_name} not found"}
        else:
            lots = await repo.get_all()
            return {
                "lots": [
                    {
                        "name": l.name,
                        "zone": l.zone,
                        "occupancy_percent": l.occupancy_percent,
                        "current_occupancy": l.current_occupancy,
                        "total_capacity": l.total_capacity,
                        "status": l.status
                    } for l in lots
                ]
            }


@tool
async def get_active_security_incidents() -> dict[str, Any]:
    """Retrieve all open or active security alerts and threat assessments inside the stadium.

    Use this to identify ongoing hazards or dispatch requirements.
    """
    async with async_session_factory() as db:
        repo = SecurityIncidentRepository(db)
        incidents = await repo.get_active_incidents()
        return {
            "active_incidents": [
                {
                    "id": i.id,
                    "incident_type": i.incident_type,
                    "severity": i.severity,
                    "status": i.status,
                    "zone": i.zone,
                    "threat_level": i.threat_level
                } for i in incidents
            ]
        }


@tool
async def get_vendor_inventory(vendor_id: str | None = None) -> dict[str, Any]:
    """Query booth inventory levels and check for stock items below critical thresholds.

    Use this when forecasting food shortages or vendor operations.
    """
    async with async_session_factory() as db:
        repo = VendorInventoryRepository(db)
        items = await repo.get_low_stock_items(vendor_id)
        return {
            "low_stock_items": [
                {
                    "item_name": item.item_name,
                    "quantity": item.quantity,
                    "restock_threshold": item.restock_threshold,
                    "vendor_id": item.vendor_id
                } for item in items
            ]
        }


@tool
async def check_weather_telemetry() -> dict[str, Any]:
    """Fetch current meteorologic telemetry for the stadium region.

    Use this when assessing heat indexes, lightning risks, or storm warning delays.
    """
    # High fidelity mockup data simulating real weather service integrations
    return {
        "temperature_celsius": 24.5,
        "wind_speed_kmh": 12.4,
        "humidity_percent": 68,
        "precipitation_probability": 15,
        "sky_conditions": "Clear Skies",
        "lightning_detected_within_10km": False,
        "stadium_roof_state": "open"
    }
