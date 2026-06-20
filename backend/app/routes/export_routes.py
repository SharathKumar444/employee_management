"""Routes for export functionality"""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.controllers.export_controller import ExportController, EXPORT_TYPES
from app.models.user_model import User
from app.config.database import get_db
from app.utils.user_status import ensure_user_active_by_id
import logging
import io

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/export", tags=["export"])


@router.post("/data/{data_type}/{format_type}")
async def export_data(
    data_type: str,
    format_type: str,
    user_id: int = Query(...),
    user_email: str = Query(...),
    company_id: str = Query(...),
    start_date: str = Query(None),
    end_date: str = Query(None),
    reason: str = Query(None),
    db: Session = Depends(get_db)
):
    """
    Export data in the specified format

    Args:
        data_type: Type of data to export (employees, attendance, leaves, audit_logs, notifications, analytics)
        format_type: Export format (csv, excel, pdf)
        user_id: Current user ID
        user_email: Current user email
        company_id: Company ID for scoping
        reason: Optional reason for export

    Returns:
        File download or error JSON
    """
    try:
        # Get current user (select only required fields to support legacy DB schemas)
        ensure_user_active_by_id(db, user_id)

        current_user_row = db.execute(
            select(User.id, User.email, User.role).where(User.id == user_id)
        ).first()

        if not current_user_row:
            raise HTTPException(status_code=401, detail="User not found")

        current_user = User(id=current_user_row.id, email=current_user_row.email, role=current_user_row.role)

        # Only admins can export
        if current_user.role != 'admin':
            raise HTTPException(status_code=403, detail="Admin access required for exports")

        if not company_id:
            raise HTTPException(status_code=400, detail="Company ID not set")

        # Generate export
        file_bytes, result = ExportController.export_data(
            db,
            data_type,
            format_type,
            company_id,
            current_user,
            start_date,
            end_date,
            reason,
        )

        if file_bytes is None:
            raise HTTPException(status_code=400, detail=result)

        # Determine MIME type
        mime_types = {
            'csv': 'text/csv',
            'excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'pdf': 'application/pdf'
        }
        mime_type = mime_types.get(format_type, 'application/octet-stream')

        # Return file as stream
        return StreamingResponse(
            iter([file_bytes]),
            media_type=mime_type,
            headers={"Content-Disposition": f"attachment; filename={result}"}
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in export_data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating export: {str(e)}")


@router.get("/history")
async def get_export_history(
    user_id: int = Query(...),
    user_email: str = Query(...),
    company_id: str = Query(...),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get export history for the current company"""
    try:
        # Get current user (select only required fields to support legacy DB schemas)
        ensure_user_active_by_id(db, user_id)

        current_user_row = db.execute(
            select(User.id, User.email, User.role).where(User.id == user_id)
        ).first()

        if not current_user_row:
            raise HTTPException(status_code=401, detail="User not found")

        current_user = User(id=current_user_row.id, email=current_user_row.email, role=current_user_row.role)

        # Only admins can view history
        if current_user.role != 'admin':
            raise HTTPException(status_code=403, detail="Admin access required")

        if not company_id:
            raise HTTPException(status_code=400, detail="Company ID not set")

        history = ExportController.get_export_history(db, company_id, limit)

        return {
            'success': True,
            'data': history,
            'count': len(history)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching export history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching history: {str(e)}")


@router.get("/available-types")
async def get_available_types(
    user_id: int = Query(...),
    user_email: str = Query(...),
    company_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """Get list of available export types"""
    try:
        # Get current user (select only required fields to support legacy DB schemas)
        ensure_user_active_by_id(db, user_id)

        current_user_row = db.execute(
            select(User.id, User.email, User.role).where(User.id == user_id)
        ).first()

        if not current_user_row:
            raise HTTPException(status_code=401, detail="User not found")

        current_user = User(id=current_user_row.id, email=current_user_row.email, role=current_user_row.role)

        # Only admins can export
        if current_user.role != 'admin':
            raise HTTPException(status_code=403, detail="Admin access required")

        return {
            'success': True,
            'types': list(EXPORT_TYPES.keys()),
            'type_names': EXPORT_TYPES,
            'formats': ['csv', 'excel', 'pdf']
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching available types: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching types: {str(e)}")
