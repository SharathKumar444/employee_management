from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user_session_model import UserSession
from app.models.user_model import User
from app.controllers.audit_controller import create_audit_log
import uuid


def parse_user_agent(user_agent: str):
    """Parse user agent string to extract browser and OS information"""
    browser = "Unknown Browser"
    operating_system = "Unknown OS"
    device_type = "Desktop"

    if not user_agent:
        return browser, operating_system, device_type

    lower_agent = user_agent.lower()

    # Browser detection
    if "chrome" in lower_agent:
        browser = "Chrome"
    elif "firefox" in lower_agent:
        browser = "Firefox"
    elif "safari" in lower_agent:
        browser = "Safari"
    elif "edge" in lower_agent:
        browser = "Edge"
    elif "opera" in lower_agent or "opr/" in lower_agent:
        browser = "Opera"

    # OS detection
    if "windows" in lower_agent:
        operating_system = "Windows"
    elif "mac os" in lower_agent or "macintosh" in lower_agent:
        operating_system = "macOS"
    elif "android" in lower_agent:
        operating_system = "Android"
    elif "iphone" in lower_agent or "ipad" in lower_agent:
        operating_system = "iOS"
    elif "linux" in lower_agent:
        operating_system = "Linux"

    # Device type detection
    if "mobile" in lower_agent or "iphone" in lower_agent or "android" in lower_agent:
        device_type = "Mobile"
    elif "tablet" in lower_agent or "ipad" in lower_agent:
        device_type = "Tablet"
    else:
        device_type = "Desktop"

    return browser, operating_system, device_type


def create_session(
    db: Session,
    user_id: int,
    user_email: str,
    company_id: str,
    browser_info: str = None,
    ip_address: str = None
):
    """Create a new user session"""
    browser, os_info, device_type = parse_user_agent(browser_info)
    session_token = f"session_{user_id}_{uuid.uuid4().hex}"
    
    new_session = UserSession(
        user_id=user_id,
        user_email=user_email,
        company_id=company_id,
        session_token=session_token,
        browser_info=browser,
        os_info=os_info,
        device_type=device_type,
        ip_address=ip_address,
        user_agent=browser_info,
        login_time=datetime.utcnow(),
        last_activity_time=datetime.utcnow(),
        status="active",
        is_active=True
    )
    
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    
    return {
        "success": True,
        "data": {
            "session_id": new_session.id,
            "session_token": session_token
        }
    }


def get_user_active_sessions(db: Session, user_id: int):
    """Get all active sessions for a user"""
    sessions = db.query(UserSession).filter(
        UserSession.user_id == user_id,
        UserSession.is_active == True,
        UserSession.status == "active"
    ).all()
    
    return sessions


def get_company_active_sessions(db: Session, company_id: str):
    """Get all active sessions for a company"""
    sessions = db.query(UserSession).filter(
        UserSession.company_id == company_id,
        UserSession.is_active == True,
        UserSession.status == "active"
    ).order_by(UserSession.last_activity_time.desc()).all()
    
    return sessions


def get_company_recent_sessions(db: Session, company_id: str, days: int = 30):
    """Get recent sessions (active and expired) for a company"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    sessions = db.query(UserSession).filter(
        UserSession.company_id == company_id,
        UserSession.login_time >= cutoff_date
    ).order_by(UserSession.last_activity_time.desc()).all()
    
    return sessions


def update_session_activity(db: Session, session_token: str):
    """Update the last activity time of a session"""
    session = db.query(UserSession).filter(
        UserSession.session_token == session_token
    ).first()
    
    if session and session.is_active:
        session.last_activity_time = datetime.utcnow()
        db.commit()
        return True
    
    return False


def logout_session(db: Session, session_token: str):
    """Mark a session as logged out"""
    session = db.query(UserSession).filter(
        UserSession.session_token == session_token
    ).first()
    
    if session:
        session.status = "logged_out"
        session.is_active = False
        session.logout_time = datetime.utcnow()
        db.commit()
        
        create_audit_log(
            db,
            performed_by=session.user_email,
            action="LOGOUT",
            target_user=session.user_email,
            company_id=session.company_id,
            details=f"Session logged out from {session.browser_info} at {session.ip_address}"
        )
        
        return True
    
    return False


def revoke_session(
    db: Session,
    session_id: int,
    revoked_by: str,
    company_id: str,
    reason: str = None
):
    """Revoke a user session"""
    session = db.query(UserSession).filter(
        UserSession.id == session_id,
        UserSession.company_id == company_id
    ).first()
    
    if not session:
        return {"success": False, "message": "Session not found"}
    
    session.status = "revoked"
    session.is_active = False
    session.is_revoked = True
    session.revoked_by = revoked_by
    session.revoked_at = datetime.utcnow()
    session.revocation_reason = reason
    db.commit()
    
    create_audit_log(
        db,
        performed_by=revoked_by,
        action="SESSION_REVOKED",
        target_user=session.user_email,
        company_id=company_id,
        details=f"Session revoked: {session.browser_info} at {session.ip_address}. Reason: {reason or 'No reason provided'}"
    )
    
    return {"success": True, "message": "Session revoked successfully"}


def revoke_multiple_sessions(
    db: Session,
    session_ids: list,
    revoked_by: str,
    company_id: str,
    reason: str = None
):
    """Revoke multiple sessions at once"""
    revoked_count = 0
    failed_count = 0
    
    for session_id in session_ids:
        result = revoke_session(db, session_id, revoked_by, company_id, reason)
        if result["success"]:
            revoked_count += 1
        else:
            failed_count += 1
    
    return {
        "success": True,
        "revoked_count": revoked_count,
        "failed_count": failed_count
    }


def force_logout_session(
    db: Session,
    session_id: int,
    admin_email: str,
    company_id: str,
    reason: str = None
):
    """Force logout a user session"""
    session = db.query(UserSession).filter(
        UserSession.id == session_id,
        UserSession.company_id == company_id
    ).first()
    
    if not session:
        return {"success": False, "message": "Session not found"}
    
    session.status = "logged_out"
    session.is_active = False
    session.is_forced_logout = True
    session.logout_time = datetime.utcnow()
    db.commit()
    
    create_audit_log(
        db,
        performed_by=admin_email,
        action="FORCE_LOGOUT_INITIATED",
        target_user=session.user_email,
        company_id=company_id,
        details=f"Admin {admin_email} force logged out session: {session.browser_info} at {session.ip_address}. Reason: {reason or 'No reason provided'}"
    )
    
    return {"success": True, "message": "Session force logged out successfully"}


def get_session_history(
    db: Session,
    company_id: str,
    user_email: str = None,
    start_date: datetime = None,
    end_date: datetime = None
):
    """Get session history for audit purposes"""
    query = db.query(UserSession).filter(UserSession.company_id == company_id)
    
    if user_email:
        query = query.filter(UserSession.user_email == user_email)
    
    if start_date:
        query = query.filter(UserSession.login_time >= start_date)
    
    if end_date:
        query = query.filter(UserSession.login_time <= end_date)
    
    sessions = query.order_by(UserSession.login_time.desc()).all()
    
    return sessions


def expire_old_sessions(db: Session, session_timeout_minutes: int = 1440):
    """Expire sessions that have been inactive for too long"""
    cutoff_time = datetime.utcnow() - timedelta(minutes=session_timeout_minutes)
    
    sessions = db.query(UserSession).filter(
        UserSession.is_active == True,
        UserSession.status == "active",
        UserSession.last_activity_time < cutoff_time
    ).all()
    
    expired_count = 0
    for session in sessions:
        session.status = "expired"
        session.is_active = False
        expired_count += 1
        
        create_audit_log(
            db,
            performed_by="SYSTEM",
            action="SESSION_EXPIRED",
            target_user=session.user_email,
            company_id=session.company_id,
            details=f"Session expired after {session_timeout_minutes} minutes of inactivity"
        )
    
    if sessions:
        db.commit()
    
    return {"expired_count": expired_count}


def format_session_response(session: UserSession):
    """Format a session object for API response"""
    return {
        "id": session.id,
        "user_id": session.user_id,
        "user_email": session.user_email,
        "browser_info": session.browser_info,
        "os_info": session.os_info,
        "device_type": session.device_type,
        "ip_address": session.ip_address,
        "login_time": session.login_time.isoformat() if session.login_time else None,
        "last_activity_time": session.last_activity_time.isoformat() if session.last_activity_time else None,
        "logout_time": session.logout_time.isoformat() if session.logout_time else None,
        "status": session.status,
        "is_active": session.is_active,
        "is_forced_logout": session.is_forced_logout,
        "is_revoked": session.is_revoked,
        "revoked_by": session.revoked_by,
        "revoked_at": session.revoked_at.isoformat() if session.revoked_at else None,
        "revocation_reason": session.revocation_reason
    }
