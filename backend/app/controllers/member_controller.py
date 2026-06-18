from sqlalchemy.orm import Session

from app.models.user_model import User
from app.controllers.audit_controller import create_audit_log


# ======================================
# GET MEMBERS (COMPANY SCOPED)
# ======================================
def get_members(db: Session, company_id: str):

    members = db.query(User).filter(
        User.company_id == company_id
    ).all()

    return {
        "success": True,
        "members": [
            {
                "id": member.id,
                "name": member.name,
                "email": member.email,
                "role": member.role,
                "companyId": member.company_id,
                "is_active": member.is_active,
                "last_login": member.last_login,
                "last_logout": member.last_logout,
                "browser_info": member.browser_info,
                "ip_address": member.ip_address,
            }
            for member in members
        ]
    }


# ======================================
# DEACTIVATE MEMBER
# ======================================
def deactivate_member(
    db: Session,
    member_id: int,
    admin_email: str,
    company_id: str = None
):

    query = db.query(User).filter(
        User.id == member_id
    )

    if company_id:
        query = query.filter(User.company_id == company_id)

    user = query.first()

    if not user:
        return {
            "success": False,
            "message": "User not found"
        }

    # Already inactive
    if not user.is_active:
        return {
            "success": False,
            "message": "User already deactivated"
        }

    user.is_active = False

    db.commit()
    db.refresh(user)

    # ==========================
    # AUDIT LOG
    # ==========================
    create_audit_log(
        db=db,
        performed_by=admin_email,
        action="User Deactivated",
        target_user=user.email,
        company_id=user.company_id
    )

    return {
        "success": True,
        "message": "Account deactivated successfully",
        "data": {
            "id": user.id,
            "email": user.email,
            "is_active": user.is_active
        }
    }


# ======================================
# REACTIVATE MEMBER
# ======================================
def reactivate_member(
    db: Session,
    member_id: int,
    admin_email: str,
    company_id: str = None
):

    query = db.query(User).filter(
        User.id == member_id
    )

    if company_id:
        query = query.filter(User.company_id == company_id)

    user = query.first()

    if not user:
        return {
            "success": False,
            "message": "User not found"
        }

    # Already active
    if user.is_active:
        return {
            "success": False,
            "message": "User already active"
        }

    # ==========================
    # BUSINESS RULE
    # ==========================
    user.is_active = True

    # Restore role access
    if user.role == "admin":
        user.role = "admin"
    elif user.role == "user":
        user.role = "user"

    db.commit()
    db.refresh(user)

    # ==========================
    # AUDIT LOG
    # ==========================
    create_audit_log(
        db=db,
        performed_by=admin_email,
        action="User Activated",
        target_user=user.email,
        company_id=user.company_id
    )

    return {
        "success": True,
        "message": "Account reactivated successfully",
        "data": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active
        }
    }