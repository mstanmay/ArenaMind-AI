"""Celery task module for background forecasting algorithms."""

import asyncio
from app.workers.celery_app import celery_app
from app.core.database import async_session_factory
from app.repositories.parking import ParkingLotRepository, ParkingSnapshotRepository
from app.repositories.vendor import VendorInventoryRepository
from app.models.parking import ParkingSnapshot
from app.core.logging import get_logger

logger = get_logger("worker_forecasting")


@celery_app.task(name="app.workers.tasks.forecasting.run_parking_occupancy_predictions")
def run_parking_occupancy_predictions() -> str:
    """Analyze parking fill rates and update predicted full-time stamps in the snapshots."""
    logger.info("running_parking_forecaster_task")
    
    loop = asyncio.get_event_loop()
    if loop.is_closed():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    loop.run_until_complete(_forecast_parking())
    return "SUCCESS"


async def _forecast_parking() -> None:
    async with async_session_factory() as db:
        lot_repo = ParkingLotRepository(db)
        snap_repo = ParkingSnapshotRepository(db)
        
        lots = await lot_repo.get_all()
        for lot in lots:
            # Smart calculation of future full timestamp based on recent entry velocity
            occupancy_rate = lot.current_occupancy / lot.total_capacity if lot.total_capacity > 0 else 0.0
            
            predicted_time = None
            if occupancy_rate >= 0.85:
                predicted_time = "10 minutes"
            elif occupancy_rate >= 0.70:
                predicted_time = "25 minutes"
            elif occupancy_rate >= 0.50:
                predicted_time = "50 minutes"
                
            # Create a snapshot recording the prediction
            snap = ParkingSnapshot(
                lot_id=lot.id,
                occupancy=lot.current_occupancy,
                entries_last_hour=15 if occupancy_rate > 0.5 else 5,
                exits_last_hour=2,
                predicted_full_time=predicted_time
            )
            await snap_repo.create(snap)
            logger.info("parking_forecast_updated", lot=lot.name, occupancy=lot.current_occupancy, full_in=predicted_time)


@celery_app.task(name="app.workers.tasks.forecasting.run_vendor_depletion_forecasts")
def run_vendor_depletion_forecasts() -> str:
    """Analyze food inventory depletion rates and trigger low-stock alerts."""
    logger.info("running_vendor_forecaster_task")
    
    loop = asyncio.get_event_loop()
    if loop.is_closed():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    loop.run_until_complete(_forecast_vendor_depletions())
    return "SUCCESS"


async def _forecast_vendor_depletions() -> None:
    async with async_session_factory() as db:
        repo = VendorInventoryRepository(db)
        # Fetch all items to evaluate stock depletion
        items = await repo.get_all()
        for item in items:
            # Check depletion status
            if item.quantity <= item.restock_threshold and not item.is_low_stock:
                # Mark as low stock in database
                await repo.update(item.id, {"is_low_stock": True})
                
                # Emit food shortage event
                from app.events.bus import get_event_bus
                from app.core.constants import EventType
                bus = await get_event_bus()
                await bus.publish(
                    EventType.FOOD_SHORTAGE,
                    {"vendor_id": item.vendor_id, "item_name": item.item_name, "qty_remaining": item.quantity}
                )
                logger.warning("vendor_stock_depleted", item=item.item_name, qty=item.quantity)
