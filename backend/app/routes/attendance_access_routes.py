"""
Attendance Access Request Routes
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.controllers.attendance_access_controller import (
    request_attendance_access,
    approve_attendance_access,
    reject_attendance_access
)

router = APIRouter(
    prefix="/attendance-access",
    tags=["Attendance Access"]
)


@router.post("/request")
def request_access(
    user_id: int = Query(...),
    user_email: str = Query(...),
    company_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """Request attendance module access"""
    return request_attendance_access(db, user_id, user_email, company_id)


@router.put("/approve")
def approve_access(
    user_id: int = Query(...),
    admin_email: str = Query(...),
    company_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """Approve attendance access request"""
    return approve_attendance_access(db, user_id, admin_email, company_id)


@router.put("/reject")
def reject_access(
    user_id: int = Query(...),
    admin_email: str = Query(...),
    company_id: str = Query(...),
    rejection_reason: str = Query(None),
    db: Session = Depends(get_db)
):
    """Reject attendance access request"""
    return reject_attendance_access(db, user_id, admin_email, company_id, rejection_reason)
