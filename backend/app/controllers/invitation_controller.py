import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.invitation_model import Invitation
from app.models.user_model import User
from app.controllers.audit_controller import create_audit_log


def validate_invitation(db: Session, token: str):
    """
    Validate invitation token and return invitation details
    """
    # Find invitation by token
    # First, we need to find the invitation that has this token in its invite_link
    invitation = db.query(Invitation).filter(
        Invitation.invite_link.contains(token)
    ).first()

    if not invitation:
        return {"success": False, "message": "Invalid invitation token"}

    # Check if expired
    if invitation.expires_at and invitation.expires_at < datetime.utcnow():
        return {"success": False, "message": "Invitation has expired"}

    # Check if revoked
    if invitation.status == "Revoked":
        return {"success": False, "message": "Invitation has been revoked"}

    return {
        "success": True,
        "data": {
            "email": invitation.email,
            "role": invitation.role,
            "company_id": invitation.company_id,
            "status": invitation.status,
        }
    }


def create_user_from_invitation(
    db: Session,
    name: str,
    email: str,
    password: str,
    role: str,
    company_id: str,
    invite_token: str = None
):
    """
    Create a new user account from an invitation
    """
    try:
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            return {"success": False, "message": "Email already registered"}

        # If invite_token provided, validate it
        if invite_token:
            validation = validate_invitation(db, invite_token)
            if not validation.get("success"):
                return validation
            # Use invitation details
            invitation = db.query(Invitation).filter(
                Invitation.invite_link.contains(invite_token)
            ).first()
            if invitation:
                email = invitation.email
                role = invitation.role
                company_id = invitation.company_id
                invitation.status = "Accepted"
                # Commit the invitation status update
                db.commit()

        new_user = User(
            name=name,
            email=email,
            password=password,
            role=role,
            company_id=company_id,
            is_active=True,
            attendance_access=(role == 'admin')
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {
            "success": True,
            "message": "User created successfully",
            "data": {
                "id": new_user.id,
                "name": new_user.name,
                "email": new_user.email,
                "role": new_user.role,
                "company_id": new_user.company_id,
                "attendance_access": new_user.attendance_access,
                "attendanceAccess": new_user.attendance_access,
            }
        }
    except Exception as e:
        db.rollback()
        return {"success": False, "message": f"Error creating user: {str(e)}"}



def create_invitation(
    db: Session,
    email: str,
    role: str,
    admin_email: str,
    company_id: str,
    expires_days: int = None
):
    token = uuid.uuid4().hex
    invite_link = f"http://localhost:5173/signup?invite={token}"
    expires_at = None

    if expires_days and expires_days > 0:
        expires_at = datetime.utcnow() + timedelta(days=expires_days)

    invitation = Invitation(
        email=email,
        role=role,
        admin_email=admin_email or "system",
        company_id=company_id,
        invite_link=invite_link,
        expires_at=expires_at,
        status="Pending"
    )

    db.add(invitation)
    db.commit()
    db.refresh(invitation)

    create_audit_log(
        db=db,
        performed_by=admin_email or "system",
        action="Invitation Created",
        target_user=email,
        company_id=company_id
    )

    return {
        "success": True,
        "data": {
            "id": invitation.id,
            "email": invitation.email,
            "role": invitation.role,
            "status": invitation.status,
            "invite_link": invitation.invite_link,
            "created_at": invitation.created_at,
            "expires_at": invitation.expires_at,
            "company_id": invitation.company_id,
            "admin_email": invitation.admin_email,
        }
    }


def get_pending_invitations(db: Session, company_id: str = None):
    query = db.query(Invitation)

    if company_id:
        query = query.filter(Invitation.company_id == company_id)

    invitations = query.order_by(Invitation.created_at.desc()).all()

    return {
        "success": True,
        "data": [
            {
                "id": invite.id,
                "email": invite.email,
                "role": invite.role,
                "status": invite.status,
                "invite_link": invite.invite_link,
                "created_at": invite.created_at,
                "expires_at": invite.expires_at,
                "company_id": invite.company_id,
                "admin_email": invite.admin_email,
            }
            for invite in invitations
        ]
    }


def revoke_invitation(
    db: Session,
    invite_id: int,
    admin_email: str = None,
    company_id: str = None
):
    query = db.query(Invitation).filter(Invitation.id == invite_id)

    if company_id:
        query = query.filter(Invitation.company_id == company_id)

    invitation = query.first()

    if not invitation:
        return {"success": False, "message": "Invitation not found"}

    invitation.status = "Revoked"
    db.commit()
    db.refresh(invitation)

    create_audit_log(
        db=db,
        performed_by=admin_email or "system",
        action="Invitation Revoked",
        target_user=invitation.email,
        company_id=invitation.company_id
    )

    return {
        "success": True,
        "message": "Invitation revoked successfully",
        "data": {
            "id": invitation.id,
            "email": invitation.email,
            "status": invitation.status,
        }
    }
