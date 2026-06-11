from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from app.models.attendance_model import Attendance
from app.controllers.audit_controller import create_audit_log


def check_in(db: Session, user_id: int, user_email: str, company_id: str):
    """Record user check-in for today"""
    today = date.today()
    
    # Check if already checked in today
    existing = db.query(Attendance).filter(
        Attendance.user_id == user_id,
        Attendance.attendance_date == today,
        Attendance.check_in_time.isnot(None)
    ).first()
    
    if existing:
        return {
            "success": False,
            "message": "You have already checked in today"
        }
    
    attendance = Attendance(
        user_id=user_id,
        user_email=user_email,
        company_id=company_id,
        attendance_date=today,
        check_in_time=datetime.now(),
        status="present"
    )
    
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    
    create_audit_log(
        db=db,
        performed_by=user_email,
        action="Check In",
        target_user=user_email,
        company_id=company_id
    )
    
    return {
        "success": True,
        "message": "Check-in recorded successfully",
        "data": attendance.to_dict()
    }


def check_out(db: Session, user_id: int, user_email: str, company_id: str):
    """Record user check-out for today"""
    today = date.today()
    
    # Find today's check-in record
    attendance = db.query(Attendance).filter(
        Attendance.user_id == user_id,
        Attendance.attendance_date == today,
        Attendance.check_in_time.isnot(None),
        Attendance.check_out_time.is_(None)
    ).first()
    
    if not attendance:
        return {
            "success": False,
            "message": "No check-in record found for today. Please check-in first."
        }
    
    check_out_time = datetime.now()
    attendance.check_out_time = check_out_time
    
    # Calculate working hours
    check_in = attendance.check_in_time
    working_minutes = (check_out_time - check_in).total_seconds() / 60
    working_hours = working_minutes / 60
    attendance.working_hours = round(working_hours, 2)
    
    db.commit()
    db.refresh(attendance)
    
    create_audit_log(
        db=db,
        performed_by=user_email,
        action="Check Out",
        target_user=user_email,
        company_id=company_id
    )
    
    return {
        "success": True,
        "message": "Check-out recorded successfully",
        "data": attendance.to_dict()
    }


def get_today_status(db: Session, user_id: int, company_id: str):
    """Get today's attendance status"""
    today = date.today()
    
    # Company isolation: Verify attendance record belongs to user's company
    attendance = db.query(Attendance).filter(
        Attendance.user_id == user_id,
        Attendance.company_id == company_id,
        Attendance.attendance_date == today
    ).first()
    
    if not attendance:
        return {
            "success": True,
            "data": {
                "status": "not_started",
                "check_in_time": None,
                "check_out_time": None,
                "working_hours": 0
            }
        }
    
    return {
        "success": True,
        "data": attendance.to_dict()
    }


def get_attendance_history(db: Session, user_id: int, company_id: str, days: int = 30):
    """Get user's attendance history"""
    start_date = date.today() - timedelta(days=days)
    
    # Company isolation: Verify records belong to user's company
    records = db.query(Attendance).filter(
        Attendance.user_id == user_id,
        Attendance.company_id == company_id,
        Attendance.attendance_date >= start_date
    ).order_by(Attendance.attendance_date.desc()).all()
    
    return {
        "success": True,
        "data": [r.to_dict() for r in records]
    }


def get_company_attendance(db: Session, company_id: str, attendance_date: date = None):
    """Get all attendance records for a company on a specific date"""
    if attendance_date is None:
        attendance_date = date.today()
    
    records = db.query(Attendance).filter(
        Attendance.company_id == company_id,
        Attendance.attendance_date == attendance_date
    ).all()
    
    return {
        "success": True,
        "data": [r.to_dict() for r in records]
    }


def get_working_hours_summary(db: Session, user_id: int, company_id: str, days: int = 30):
    """Calculate total working hours for a period"""
    start_date = date.today() - timedelta(days=days)
    
    # Company isolation: Verify records belong to user's company
    records = db.query(Attendance).filter(
        Attendance.user_id == user_id,
        Attendance.company_id == company_id,
        Attendance.attendance_date >= start_date,
        Attendance.working_hours.isnot(None)
    ).all()
    
    total_hours = sum([r.working_hours for r in records if r.working_hours])
    present_days = len([r for r in records if r.status == "present"])
    absent_days = len([r for r in records if r.status == "absent"])
    
    return {
        "success": True,
        "data": {
            "total_hours": round(total_hours, 2),
            "present_days": present_days,
            "absent_days": absent_days,
            "average_hours_per_day": round(total_hours / max(present_days, 1), 2) if present_days > 0 else 0
        }
    }
