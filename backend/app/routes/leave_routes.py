from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from datetime import date
from app.config.database import get_db
from app.controllers.leave_controller import (
    create_leave_request,
    get_user_leave_requests,
    get_company_leave_requests,
    approve_leave_request,
    reject_leave_request
)
from app.utils.user_status import ensure_user_active_by_id, ensure_user_active_by_email

router = APIRouter(
    prefix="/leaves",
    tags=["Leaves"]
)


@router.post("/request")
def submit_leave_request(
    user_id: int = Body(...),
    user_email: str = Body(...),
    company_id: str = Body(...),
    leave_type: str = Body(...),
    start_date: date = Body(...),
    end_date: date = Body(...),
    reason: str = Body(None),
    db: Session = Depends(get_db)
):
    """Submit a new leave request"""
    ensure_user_active_by_id(db, user_id, company_id)
    return create_leave_request(
        db, user_id, user_email, company_id, leave_type, start_date, end_date, reason
    )


@router.get("/my-requests")
def my_leave_requests(
    user_id: int = Query(...),
    company_id: str = Query(...),
    status: str = Query(None),
    db: Session = Depends(get_db)
):
    """Get user's leave requests"""
    ensure_user_active_by_id(db, user_id, company_id)
    return get_user_leave_requests(db, user_id, company_id, status)


@router.get("/company-requests")
def company_leave_requests(
    company_id: str = Query(...),
    status: str = Query(None),
    db: Session = Depends(get_db)
):
    """Get company's leave requests (admin only)"""
    return get_company_leave_requests(db, company_id, status)


@router.put("/{leave_id}/approve")
def approve_request(
    leave_id: int,
    admin_email: str = Query(...),
    company_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """Approve a leave request"""
    ensure_user_active_by_email(db, admin_email, company_id)
    return approve_leave_request(db, leave_id, admin_email, company_id)


@router.put("/{leave_id}/reject")
def reject_request(
    leave_id: int,
    admin_email: str = Query(...),
    company_id: str = Query(...),
    rejection_reason: str = Query(None),
    db: Session = Depends(get_db)
):
    """Reject a leave request"""
    ensure_user_active_by_email(db, admin_email, company_id)
    return reject_leave_request(db, leave_id, admin_email, company_id, rejection_reason)
