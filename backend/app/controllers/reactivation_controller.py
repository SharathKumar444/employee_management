from sqlalchemy.orm import Session

from app.controllers.audit_controller import create_audit_log
from app.models.reactivation_model import ReactivationRequest
from app.models.user_model import User


# =========================
# CREATE REQUEST
# =========================
def create_request(db: Session, user_id: int, company_id: str):

    existing = db.query(ReactivationRequest).filter(
        ReactivationRequest.user_id == user_id,
        ReactivationRequest.status == "Pending"
    ).first()

    if existing:
        return {
            "success": False,
            "message": "Request already exists",
            "data": existing
        }

    request = ReactivationRequest(
        user_id=user_id,
        company_id=company_id,
        status="Pending"
    )

    db.add(request)
    db.commit()
    db.refresh(request)

    # 🔥 AUDIT LOG
    create_audit_log(
        db=db,
        performed_by=f"user_{user_id}",
        action="Reactivation Request Submitted",
        target_user=str(user_id),
        company_id=company_id
    )

    return {
        "success": True,
        "message": "Request created successfully",
        "data": {
            "id": request.id,
            "user_id": request.user_id,
            "company_id": request.company_id,
            "status": request.status,
            "created_at": request.created_at
        }
    }


# =========================
# GET ALL REQUESTS
# =========================
def get_requests(db: Session, company_id: str):

    requests = db.query(ReactivationRequest).filter(
        ReactivationRequest.company_id == company_id
    ).order_by(
        ReactivationRequest.created_at.desc()
    ).all()

    return {
        "success": True,
        "data": [
            {
                "id": r.id,
                "user_id": r.user_id,
                "user_email": db.query(User).filter(User.id == r.user_id).first().email if db.query(User).filter(User.id == r.user_id).first() else f"User #{r.user_id}",
                "company_id": r.company_id,
                "status": r.status,
                "created_at": r.created_at
            }
            for r in requests
        ]
    }


# =========================
# APPROVE REQUEST
# =========================
def approve_request(db: Session, request_id: int, admin_name: str = "admin"):

    req = db.query(ReactivationRequest).filter(
        ReactivationRequest.id == request_id
    ).first()

    if not req:
        return None

    req.status = "Approved"

    user = db.query(User).filter(User.id == req.user_id).first()

    if user:
        user.is_active = True

        # 🔥 AUDIT LOG
        create_audit_log(
            db=db,
            performed_by=admin_name,
            action="Reactivation Approved",
            target_user=user.email,
            company_id=req.company_id
        )

    db.commit()

    return {
        "success": True,
        "message": "User reactivated successfully",
        "data": {
            "request_id": req.id,
            "user_id": req.user_id,
            "status": req.status
        }
    }


# =========================
# REJECT REQUEST
# =========================
def reject_request(db: Session, request_id: int, admin_name: str = "admin"):

    req = db.query(ReactivationRequest).filter(
        ReactivationRequest.id == request_id
    ).first()

    if not req:
        return None

    req.status = "Rejected"

    user = db.query(User).filter(User.id == req.user_id).first()

    if user:
        create_audit_log(
            db=db,
            performed_by=admin_name,
            action="Reactivation Rejected",
            target_user=user.email,
            company_id=req.company_id
        )

    db.commit()

    return {
        "success": True,
        "message": "Request rejected",
        "data": {
            "request_id": req.id,
            "status": req.status
        }
    }