from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.config.database import SessionLocal
from app.controllers.session_controller import (
    get_company_active_sessions,
    get_company_recent_sessions,
    get_session_history,
    revoke_session,
    revoke_multiple_sessions,
    force_logout_session,
    expire_old_sessions,
    format_session_response,
)
from app.models.user_model import User
from app.models.user_session_model import UserSession


class RevokeSessionRequest(BaseModel):
    reason: Optional[str] = None


class RevokMultipleSessionsRequest(BaseModel):
    session_ids: List[int]
    reason: Optional[str] = None


class ForceLogoutRequest(BaseModel):
    reason: Optional[str] = None


router = APIRouter(
    prefix="/sessions",
    tags=["Sessions"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/active")
def get_active_sessions(
    company_id: str,
    db: Session = Depends(get_db)
):
    """Get all active sessions for a company"""
    try:
        sessions = get_company_active_sessions(db, company_id)
        
        return {
            "success": True,
            "data": [format_session_response(session) for session in sessions]
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


@router.get("/recent")
def get_recent_sessions(
    company_id: str,
    days: int = 30,
    db: Session = Depends(get_db)
):
    """Get recent sessions for a company (active and expired)"""
    try:
        sessions = get_company_recent_sessions(db, company_id, days)
        
        return {
            "success": True,
            "data": [format_session_response(session) for session in sessions]
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


@router.get("/history")
def get_user_session_history(
    company_id: str,
    user_email: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get session history for audit purposes"""
    try:
        sessions = get_session_history(db, company_id, user_email)
        
        return {
            "success": True,
            "data": [format_session_response(session) for session in sessions]
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


@router.post("/{session_id}/revoke")
def revoke_user_session(
    session_id: int,
    company_id: str,
    admin_email: str,
    request_body: RevokeSessionRequest,
    db: Session = Depends(get_db)
):
    """Revoke a specific user session"""
    try:
        # Verify admin has permission
        admin = db.query(User).filter(
            User.email == admin_email,
            User.company_id == company_id,
            User.role == "admin"
        ).first()
        
        if not admin:
            return {
                "success": False,
                "message": "Unauthorized: Admin privileges required"
            }
        
        result = revoke_session(
            db,
            session_id,
            admin_email,
            company_id,
            request_body.reason
        )
        
        return result
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


@router.post("/revoke-multiple")
def revoke_multiple_user_sessions(
    company_id: str,
    admin_email: str,
    request_body: RevokMultipleSessionsRequest,
    db: Session = Depends(get_db)
):
    """Revoke multiple sessions at once"""
    try:
        # Verify admin has permission
        admin = db.query(User).filter(
            User.email == admin_email,
            User.company_id == company_id,
            User.role == "admin"
        ).first()
        
        if not admin:
            return {
                "success": False,
                "message": "Unauthorized: Admin privileges required"
            }
        
        result = revoke_multiple_sessions(
            db,
            request_body.session_ids,
            admin_email,
            company_id,
            request_body.reason
        )
        
        return result
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


@router.post("/{session_id}/force-logout")
def force_logout_user_session(
    session_id: int,
    company_id: str,
    admin_email: str,
    request_body: ForceLogoutRequest,
    db: Session = Depends(get_db)
):
    """Force logout a user session"""
    try:
        # Verify admin has permission
        admin = db.query(User).filter(
            User.email == admin_email,
            User.company_id == company_id,
            User.role == "admin"
        ).first()
        
        if not admin:
            return {
                "success": False,
                "message": "Unauthorized: Admin privileges required"
            }
        
        result = force_logout_session(
            db,
            session_id,
            admin_email,
            company_id,
            request_body.reason
        )
        
        return result
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


@router.post("/expire-inactive")
def expire_inactive_sessions(
    company_id: str,
    admin_email: str,
    timeout_minutes: int = 1440,
    db: Session = Depends(get_db)
):
    """Expire inactive sessions"""
    try:
        # Verify admin has permission
        admin = db.query(User).filter(
            User.email == admin_email,
            User.company_id == company_id,
            User.role == "admin"
        ).first()
        
        if not admin:
            return {
                "success": False,
                "message": "Unauthorized: Admin privileges required"
            }
        
        result = expire_old_sessions(db, timeout_minutes)
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


@router.get("/company/{company_id}/summary")
def get_company_session_summary(
    company_id: str,
    db: Session = Depends(get_db)
):
    """Get session summary for a company"""
    try:
        active_sessions = get_company_active_sessions(db, company_id)
        recent_sessions = get_company_recent_sessions(db, company_id, 1)
        
        # Calculate statistics
        total_active = len(active_sessions)
        total_sessions_today = len(recent_sessions)
        
        # Group by user
        users_with_sessions = {}
        for session in active_sessions:
            if session.user_email not in users_with_sessions:
                users_with_sessions[session.user_email] = []
            users_with_sessions[session.user_email].append(session)
        
        return {
            "success": True,
            "data": {
                "total_active_sessions": total_active,
                "total_sessions_today": total_sessions_today,
                "users_with_active_sessions": len(users_with_sessions),
                "active_sessions": [format_session_response(s) for s in active_sessions]
            }
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }
