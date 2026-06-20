from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from app.config.database import get_db
from app.controllers.attendance_controller import (
    check_in,
    check_out,
    get_today_status,
    get_attendance_history,
    get_company_attendance,
    get_working_hours_summary
)
from app.utils.user_status import ensure_user_active_by_id
from app.utils.user_status import ensure_user_active_by_id

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)


@router.post("/check-in")
def user_check_in(
    user_id: int = Query(...),
    user_email: str = Query(...),
    company_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """Check in for the day"""
    ensure_user_active_by_id(db, user_id, company_id)
    return check_in(db, user_id, user_email, company_id)


@router.post("/check-out")
def user_check_out(
    user_id: int = Query(...),
    user_email: str = Query(...),
    company_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """Check out for the day"""
    ensure_user_active_by_id(db, user_id, company_id)
    return check_out(db, user_id, user_email, company_id)


@router.get("/today")
def today_status(
    user_id: int = Query(...),
    company_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """Get today's attendance status"""
    ensure_user_active_by_id(db, user_id, company_id)
    return get_today_status(db, user_id, company_id)


@router.get("/history")
def attendance_history(
    user_id: int = Query(...),
    company_id: str = Query(...),
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get user's attendance history"""
    ensure_user_active_by_id(db, user_id, company_id)
    return get_attendance_history(db, user_id, company_id, days)


@router.get("/company")
def company_attendance(
    company_id: str = Query(...),
    attendance_date: date = Query(None),
    db: Session = Depends(get_db)
):
    """Get company attendance for a date"""
    return get_company_attendance(db, company_id, attendance_date)


@router.get("/summary")
def working_hours_summary(
    user_id: int = Query(...),
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get working hours summary"""
    ensure_user_active_by_id(db, user_id)
    return get_working_hours_summary(db, user_id, days)
