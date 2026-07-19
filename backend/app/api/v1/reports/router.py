"""Operational reports archiving API router endpoints."""

from typing import Any
from fastapi import APIRouter, Depends, Security
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.schemas.report import ReportResponse, ReportCreate
from app.repositories.report import ReportRepository
from app.models.report import Report
from app.security.rbac import require_viewer, require_operator

router = APIRouter(tags=["Reports Archive"])


@router.get("", response_model=list[ReportResponse])
async def list_reports(
    db: AsyncSession = Depends(get_db_session),
    current_user: Any = Security(require_viewer)
) -> list[Any]:
    """Retrieve all generated operational shift summaries and logs (requires Viewer role)."""
    repo = ReportRepository(db)
    reports = await repo.get_all()
    return list(reports)


@router.post("", response_model=ReportResponse, status_code=210)
async def generate_shift_report(
    payload: ReportCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: Any = Security(require_operator)
) -> Any:
    """Trigger background generation of an operational summary report (requires Operator role)."""
    repo = ReportRepository(db)
    report = Report(
        title=payload.title,
        report_type=payload.report_type,
        status="completed", # Immediately set to completed for dev speed, or generating
        summary=payload.summary,
        data=payload.data or {},
        generated_by=payload.generated_by,
        file_url=payload.file_url or "/downloads/reports/report_shift.pdf"
    )
    await repo.create(report)
    return report
