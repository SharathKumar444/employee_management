import json
from datetime import datetime, date
from sqlalchemy.orm import Session
from app.models.attendance_model import Leave
from app.models.user_model import User
from app.controllers.audit_controller import create_audit_log
from app.utils.notification_utils import create_notification


def create_leave_request(
    db: Session,
    user_id: int,
    user_email: str,
    company_id: str,
    leave_type: str,
    start_date: date,
    end_date: date,
    reason: str = None
):
    """Create a new leave request"""
    
    # Validate dates
    if start_date > end_date:
        return {
            "success": False,
            "message": "Start date must be before end date"
        }
    
    # Calculate number of days
    delta = end_date - start_date
    number_of_days = delta.days + 1
    
    # Check for existing overlapping requests
    existing = db.query(Leave).filter(
        Leave.user_id == user_id,
        Leave.status == "pending",
        Leave.start_date <= end_date,
        Leave.end_date >= start_date
    ).first()
    
    if existing:
        return {
            "success": False,
            "message": "You already have a pending leave request for overlapping dates"
        }
    
    leave_request = Leave(
        user_id=user_id,
        user_email=user_email,
        company_id=company_id,
        leave_type=leave_type,
        start_date=start_date,
        end_date=end_date,
        number_of_days=number_of_days,
        reason=reason,
        status="pending"
    )
    
    db.add(leave_request)
    db.commit()
    db.refresh(leave_request)
    
    # Create audit log
    create_audit_log(
        db=db,
        performed_by=user_email,
        action="Leave Request Submitted",
        target_user=user_email,
        company_id=company_id
    )
    
    # Notify admins
    admins = db.query(User).filter(
        User.company_id == company_id,
        User.role == "admin"
    ).all()
    
    for admin in admins:
        create_notification(
            db=db,
            recipient_user_id=admin.id,
            type="leave_request",
            payload=json.dumps({
                "request_id": leave_request.id,
                "user_id": user_id,
                "user_email": user_email,
                "leave_type": leave_type,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
            })
        )
    
    return {
        "success": True,
        "message": "Leave request submitted successfully",
        "data": leave_request.to_dict()
    }


def get_user_leave_requests(db: Session, user_id: int, company_id: str, status: str = None):
    """Get leave requests for a user, optionally filtered by status"""
    # Company isolation: Verify leave requests belong to user's company
    query = db.query(Leave).filter(
        Leave.user_id == user_id,
        Leave.company_id == company_id
    )
    
    if status:
        query = query.filter(Leave.status == status)
    
    requests = query.order_by(Leave.start_date.desc()).all()
    
    return {
        "success": True,
        "data": [r.to_dict() for r in requests]
    }


def get_company_leave_requests(db: Session, company_id: str, status: str = None):
    """Get all leave requests for a company, optionally filtered by status"""
    query = db.query(Leave).filter(Leave.company_id == company_id)
    
    if status:
        query = query.filter(Leave.status == status)
    
    requests = query.order_by(Leave.created_at.desc()).all()
    
    return {
        "success": True,
        "data": [r.to_dict() for r in requests]
    }


def approve_leave_request(
    db: Session,
    leave_id: int,
    admin_email: str,
    company_id: str
):
    """Approve a leave request"""
    leave_request = db.query(Leave).filter(
        Leave.id == leave_id,
        Leave.company_id == company_id
    ).first()
    
    if not leave_request:
        return {
            "success": False,
            "message": "Leave request not found"
        }
    
    if leave_request.status != "pending":
        return {
            "success": False,
            "message": f"Cannot approve a {leave_request.status} request"
        }
    
    leave_request.status = "approved"
    leave_request.approved_by = admin_email
    leave_request.approved_at = datetime.now()
    
    db.commit()
    db.refresh(leave_request)
    
    # Create audit log
    create_audit_log(
        db=db,
        performed_by=admin_email,
        action="Leave Request Approved",
        target_user=leave_request.user_email,
        company_id=company_id
    )
    
    # Notify user
    create_notification(
        db=db,
        recipient_user_id=leave_request.user_id,
        type="leave_approval",
        payload=f"Your leave request #{leave_request.id} ({leave_request.leave_type}) has been approved by {admin_email}"
    )
    
    return {
        "success": True,
        "message": "Leave request approved",
        "data": leave_request.to_dict()
    }


def reject_leave_request(
    db: Session,
    leave_id: int,
    admin_email: str,
    company_id: str,
    rejection_reason: str = None
):
    """Reject a leave request"""
    leave_request = db.query(Leave).filter(
        Leave.id == leave_id,
        Leave.company_id == company_id
    ).first()
    
    if not leave_request:
        return {
            "success": False,
            "message": "Leave request not found"
        }
    
    if leave_request.status != "pending":
        return {
            "success": False,
            "message": f"Cannot reject a {leave_request.status} request"
        }
    
    leave_request.status = "rejected"
    leave_request.approved_by = admin_email
    leave_request.approved_at = datetime.now()
    leave_request.rejection_reason = rejection_reason
    
    db.commit()
    db.refresh(leave_request)
    
    # Create audit log
    create_audit_log(
        db=db,
        performed_by=admin_email,
        action="Leave Request Rejected",
        target_user=leave_request.user_email,
        company_id=company_id
    )
    
    # Notify user
    reason_text = f" Reason: {rejection_reason}" if rejection_reason else ""
    create_notification(
        db=db,
        recipient_user_id=leave_request.user_id,
        type="leave_rejection",
        payload=f"Your leave request #{leave_request.id} ({leave_request.leave_type}) has been rejected by {admin_email}.{reason_text}"
    )
    
    return {
        "success": True,
        "message": "Leave request rejected",
        "data": leave_request.to_dict()
    }
