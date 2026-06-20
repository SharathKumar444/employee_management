from sqlalchemy.orm import Session
from datetime import datetime
import json

from app.controllers.audit_controller import create_audit_log
from app.models.reinstatement_model import ReinstallmentRequest
from app.models.user_model import User
from app.utils.notification_utils import create_notification


# =========================
# SUSPEND USER
# =========================
def suspend_user(db: Session, user_id: int, admin_email: str, reason: str = None):
    """
    Suspend a user account
    - Suspended users can still login but cannot access features
    - Creates audit log and notification
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        return {
            "success": False,
            "message": "User not found"
        }
    
    if user.suspension_status == "suspended":
        return {
            "success": False,
            "message": "User is already suspended"
        }
    
    user.suspension_status = "suspended"
    user.suspended_by = admin_email
    user.suspended_at = datetime.utcnow()
    user.suspension_reason = reason
    
    db.commit()
    
    # 🔥 AUDIT LOG
    create_audit_log(
        db=db,
        performed_by=admin_email,
        action="User Suspended",
        target_user=user.email,
        company_id=user.company_id,
        details=reason or "User account suspended"
    )
    
    # Notify all company admins about suspension
    admins = db.query(User).filter(
        User.company_id == user.company_id,
        User.role == "admin",
        User.id != user.id
    ).all()
    for admin in admins:
        try:
            create_notification(
                db=db,
                recipient_user_id=admin.id,
                type="user_suspended",
                payload=json.dumps({
                    "user_name": user.name,
                    "user_email": user.email,
                    "suspended_by": admin_email,
                    "suspended_at": user.suspended_at.isoformat() if user.suspended_at else None,
                    "reason": reason
                })
            )
        except Exception:
            pass
    
    return {
        "success": True,
        "message": "User suspended successfully",
        "data": {
            "user_id": user.id,
            "email": user.email,
            "suspension_status": user.suspension_status,
            "suspended_at": user.suspended_at
        }
    }


# =========================
# UNSUSPEND USER (DIRECT)
# =========================
def unsuspend_user(db: Session, user_id: int, admin_email: str):
    """
    Directly unsuspend a user (without going through reinstatement request)
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        return {
            "success": False,
            "message": "User not found"
        }
    
    if user.suspension_status != "suspended":
        return {
            "success": False,
            "message": "User is not suspended"
        }
    
    user.suspension_status = "active"
    user.suspended_by = None
    user.suspended_at = None
    user.suspension_reason = None
    
    db.commit()
    
    # 🔥 AUDIT LOG
    create_audit_log(
        db=db,
        performed_by=admin_email,
        action="User Reinstated",
        target_user=user.email,
        company_id=user.company_id,
        details="User directly reinstated"
    )
    
    return {
        "success": True,
        "message": "User reinstated successfully",
        "data": {
            "user_id": user.id,
            "email": user.email,
            "suspension_status": user.suspension_status
        }
    }


# =========================
# CREATE REINSTATEMENT REQUEST
# =========================
def create_reinstatement_request(db: Session, user_id: int, company_id: str, reason: str = None):
    """
    Suspended user submits a reinstatement request
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        return {
            "success": False,
            "message": "User not found"
        }
    
    if user.suspension_status != "suspended":
        return {
            "success": False,
            "message": "Account is not suspended"
        }
    
    # Check for existing pending request
    existing = db.query(ReinstallmentRequest).filter(
        ReinstallmentRequest.user_id == user_id,
        ReinstallmentRequest.status == "Pending"
    ).first()
    
    if existing:
        return {
            "success": False,
            "message": "Reinstatement request already pending"
        }
    
    request = ReinstallmentRequest(
        user_id=user_id,
        company_id=company_id,
        reason=reason,
        status="Pending"
    )
    
    db.add(request)
    db.commit()
    db.refresh(request)
    
    # 🔥 AUDIT LOG
    create_audit_log(
        db=db,
        performed_by=user.email,
        action="Reinstatement Request Submitted",
        target_user=user.email,
        company_id=company_id,
        details=reason or "User submitted reinstatement request"
    )
    
    # Notify company admins about the new reinstatement request
    admins = db.query(User).filter(
        User.company_id == company_id,
        User.role == "admin"
    ).all()
    for admin in admins:
        try:
            create_notification(
                db=db,
                recipient_user_id=admin.id,
                type="reinstatement_request_submitted",
                payload=json.dumps({
                    "request_id": request.id,
                    "user_name": user.name,
                    "user_email": user.email,
                    "reason": reason
                })
            )
        except Exception:
            pass
    
    return {
        "success": True,
        "message": "Reinstatement request submitted",
        "data": {
            "id": request.id,
            "user_id": request.user_id,
            "status": request.status,
            "created_at": request.created_at
        }
    }


# =========================
# GET ALL REINSTATEMENT REQUESTS
# =========================
def get_reinstatement_requests(db: Session, company_id: str):
    """
    Get all reinstatement requests for a company
    """
    requests = db.query(ReinstallmentRequest).filter(
        ReinstallmentRequest.company_id == company_id
    ).order_by(
        ReinstallmentRequest.created_at.desc()
    ).all()
    
    return {
        "success": True,
        "data": [
            {
                "id": r.id,
                "user_id": r.user_id,
                "user_name": db.query(User).filter(User.id == r.user_id).first().name if db.query(User).filter(User.id == r.user_id).first() else f"User #{r.user_id}",
                "user_email": db.query(User).filter(User.id == r.user_id).first().email if db.query(User).filter(User.id == r.user_id).first() else f"User #{r.user_id}",
                "company_id": r.company_id,
                "reason": r.reason,
                "status": r.status,
                "admin_reviewer": r.admin_reviewer,
                "review_comment": r.review_comment,
                "reviewed_at": r.reviewed_at,
                "created_at": r.created_at
            }
            for r in requests
        ]
    }


# =========================
# APPROVE REINSTATEMENT REQUEST
# =========================
def approve_reinstatement_request(db: Session, request_id: int, admin_email: str, comment: str = None):
    """
    Admin approves a reinstatement request
    - Updates user suspension_status to active
    - Creates audit log and notification
    """
    req = db.query(ReinstallmentRequest).filter(
        ReinstallmentRequest.id == request_id
    ).first()
    
    if not req:
        return {
            "success": False,
            "message": "Request not found"
        }
    
    if req.status != "Pending":
        return {
            "success": False,
            "message": "Request has already been reviewed"
        }
    
    req.status = "Approved"
    req.admin_reviewer = admin_email
    req.review_comment = comment
    req.reviewed_at = datetime.utcnow()
    
    user = db.query(User).filter(User.id == req.user_id).first()
    
    if user:
        user.suspension_status = "active"
        user.suspended_by = None
        user.suspended_at = None
        user.suspension_reason = None
        
        # 🔥 AUDIT LOGS
        create_audit_log(
            db=db,
            performed_by=admin_email,
            action="Reinstatement Approved",
            target_user=user.email,
            company_id=req.company_id,
            details=comment or "Reinstatement request approved"
        )
        create_audit_log(
            db=db,
            performed_by=admin_email,
            action="User Reinstated",
            target_user=user.email,
            company_id=req.company_id
        )
        
        # Notify the user that their request was approved
        try:
            create_notification(
                db=db,
                recipient_user_id=user.id,
                type="reinstatement_approved",
                payload=json.dumps({
                    "request_id": req.id,
                    "admin_reviewer": admin_email,
                    "review_comment": comment
                })
            )
        except Exception:
            pass
    
    db.commit()
    
    return {
        "success": True,
        "message": "User reinstated successfully",
        "data": {
            "request_id": req.id,
            "user_id": req.user_id,
            "status": req.status
        }
    }


# =========================
# REJECT REINSTATEMENT REQUEST
# =========================
def reject_reinstatement_request(db: Session, request_id: int, admin_email: str, comment: str = None):
    """
    Admin rejects a reinstatement request
    - User remains suspended
    - Creates audit log and notification
    """
    req = db.query(ReinstallmentRequest).filter(
        ReinstallmentRequest.id == request_id
    ).first()
    
    if not req:
        return {
            "success": False,
            "message": "Request not found"
        }
    
    if req.status != "Pending":
        return {
            "success": False,
            "message": "Request has already been reviewed"
        }
    
    req.status = "Rejected"
    req.admin_reviewer = admin_email
    req.review_comment = comment
    req.reviewed_at = datetime.utcnow()
    
    user = db.query(User).filter(User.id == req.user_id).first()
    
    if user:
        create_audit_log(
            db=db,
            performed_by=admin_email,
            action="Reinstatement Rejected",
            target_user=user.email,
            company_id=req.company_id,
            details=comment or "Reinstatement request rejected"
        )
        # Notify the user that their request was rejected
        try:
            create_notification(
                db=db,
                recipient_user_id=user.id,
                type="reinstatement_rejected",
                payload=json.dumps({
                    "request_id": req.id,
                    "admin_reviewer": admin_email,
                    "review_comment": comment
                })
            )
        except Exception:
            pass
    
    db.commit()
    
    return {
        "success": True,
        "message": "Reinstatement request rejected",
        "data": {
            "request_id": req.id,
            "status": req.status
        }
    }


# =========================
# GET MEMBERS LIST (for Members Management page)
# =========================
def get_members_list(db: Session, company_id: str):
    """
    Get all members (users) in a company with their status
    """
    users = db.query(User).filter(
        User.company_id == company_id
    ).order_by(User.name).all()
    
    return {
        "success": True,
        "data": [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "role": u.role,
                "is_active": u.is_active,
                "suspension_status": u.suspension_status,
                "suspended_at": u.suspended_at,
                "suspended_by": u.suspended_by,
                "suspension_reason": u.suspension_reason,
                "deactivated_at": u.deactivated_at
            }
            for u in users
        ]
    }
