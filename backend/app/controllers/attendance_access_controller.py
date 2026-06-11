"""
Attendance Access Request Controller
Handles user requests for attendance module access and admin approvals/rejections
"""

from datetime import datetime
import json
from sqlalchemy.orm import Session
from app.models.user_model import User
from app.controllers.audit_controller import create_audit_log
from app.utils.notification_utils import create_notification


def request_attendance_access(db: Session, user_id: int, user_email: str, company_id: str):
    """Create a request for attendance module access"""
    
    user = db.query(User).filter(
        User.id == user_id,
        User.company_id == company_id
    ).first()
    
    if not user:
        return {
            "success": False,
            "message": "User not found in this company"
        }
    
    if user.attendance_access:
        return {
            "success": False,
            "message": "User already has attendance access"
        }
    
    # Create audit log for request
    create_audit_log(
        db=db,
        performed_by=user_email,
        action="Attendance Access Requested",
        target_user=user_email,
        company_id=company_id
    )
    
    # Notify all admins in the company
    admins = db.query(User).filter(
        User.company_id == company_id,
        User.role == "admin"
    ).all()
    
    for admin in admins:
        payload_obj = {
            "request_id": None,
            "user_id": user.id,
            "user_email": user_email,
            "user_name": user.name,
            "company_id": company_id,
            "created_at": datetime.now().isoformat(),
        }
        create_notification(
            db=db,
            recipient_user_id=admin.id,
            type="attendance_access_request",
            payload=json.dumps(payload_obj)
        )
    
    return {
        "success": True,
        "message": "Attendance access request submitted",
        "data": {
            "user_id": user_id,
            "user_email": user_email,
            "company_id": company_id,
            "status": "pending",
            "created_at": datetime.now().isoformat()
        }
    }


def approve_attendance_access(
    db: Session,
    user_id: int,
    admin_email: str,
    company_id: str
):
    """Approve user's attendance access request"""
    
    admin = db.query(User).filter(
        User.email == admin_email,
        User.company_id == company_id,
        User.role == "admin"
    ).first()
    
    if not admin:
        return {
            "success": False,
            "message": "Admin not authorized"
        }
    
    user = db.query(User).filter(
        User.id == user_id,
        User.company_id == company_id
    ).first()
    
    if not user:
        return {
            "success": False,
            "message": "User not found"
        }
    
    user.attendance_access = True
    db.commit()
    db.refresh(user)
    
    # Create audit log
    create_audit_log(
        db=db,
        performed_by=admin_email,
        action="Attendance Access Approved",
        target_user=user.email,
        company_id=company_id
    )
    
    # Notify user
    payload_obj = {
        "user_id": user.id,
        "user_email": user.email,
        "approved_by": admin_email,
        "approved_at": datetime.now().isoformat(),
    }
    create_notification(
        db=db,
        recipient_user_id=user_id,
        type="attendance_access_approved",
        payload=json.dumps(payload_obj)
    )
    
    return {
        "success": True,
        "message": "Attendance access approved",
        "data": {
            "user_id": user_id,
            "user_email": user.email,
            "attendance_access": True,
            "approved_by": admin_email,
            "approved_at": datetime.now().isoformat()
        }
    }


def reject_attendance_access(
    db: Session,
    user_id: int,
    admin_email: str,
    company_id: str,
    rejection_reason: str = None
):
    """Reject user's attendance access request"""
    
    admin = db.query(User).filter(
        User.email == admin_email,
        User.company_id == company_id,
        User.role == "admin"
    ).first()
    
    if not admin:
        return {
            "success": False,
            "message": "Admin not authorized"
        }
    
    user = db.query(User).filter(
        User.id == user_id,
        User.company_id == company_id
    ).first()
    
    if not user:
        return {
            "success": False,
            "message": "User not found"
        }
    
    # Create audit log
    create_audit_log(
        db=db,
        performed_by=admin_email,
        action="Attendance Access Rejected",
        target_user=user.email,
        company_id=company_id
    )
    
    # Notify user with reason
    reason_text = f": {rejection_reason}" if rejection_reason else ""
    payload_obj = {
        "user_id": user.id,
        "user_email": user.email,
        "rejected_by": admin_email,
        "rejection_reason": rejection_reason,
        "rejected_at": datetime.now().isoformat(),
    }
    create_notification(
        db=db,
        recipient_user_id=user_id,
        type="attendance_access_rejected",
        payload=json.dumps(payload_obj)
    )
    
    return {
        "success": True,
        "message": "Attendance access rejected",
        "data": {
            "user_id": user_id,
            "user_email": user.email,
            "attendance_access": False,
            "rejected_by": admin_email,
            "rejection_reason": rejection_reason,
            "rejected_at": datetime.now().isoformat()
        }
    }
