from datetime import datetime

from sqlalchemy.orm import Session
from app.controllers.audit_controller import create_audit_log
from app.controllers.activity_controller import (
    complete_activity_record,
    create_activity_record,
)
from app.models.user_model import User


def parse_user_agent(user_agent: str):
    browser = user_agent or 'Unknown Browser'
    operating_system = 'Unknown OS'
    device_type = 'Desktop'

    if not user_agent:
        return browser, operating_system, device_type

    lower_agent = user_agent.lower()

    if 'windows' in lower_agent:
        operating_system = 'Windows'
    elif 'mac os' in lower_agent or 'macintosh' in lower_agent:
        operating_system = 'macOS'
    elif 'android' in lower_agent:
        operating_system = 'Android'
    elif 'iphone' in lower_agent or 'ipad' in lower_agent:
        operating_system = 'iOS'
    elif 'linux' in lower_agent:
        operating_system = 'Linux'

    if 'mobile' in lower_agent or 'iphone' in lower_agent or 'android' in lower_agent:
        device_type = 'Mobile'
    elif 'tablet' in lower_agent or 'ipad' in lower_agent:
        device_type = 'Tablet'
    else:
        device_type = 'Desktop'

    return browser, operating_system, device_type


def login_user(
    db: Session,
    email: str,
    password: str,
    browser_info: str = None,
    ip_address: str = None
):
    """
    Authenticate user with email and password
    """
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return {"success": False, "message": "Invalid email or password"}

    # Simple password check (in production, use hashing)
    if user.password != password:
        return {"success": False, "message": "Invalid email or password"}

    old_browser = user.browser_info
    old_ip = user.ip_address

    new_device = old_browser and old_browser != browser_info
    new_ip = old_ip and old_ip != ip_address

    browser, operating_system, device_type = parse_user_agent(browser_info)

    user.last_login = datetime.utcnow()
    user.browser_info = browser_info
    user.ip_address = ip_address
    db.commit()
    db.refresh(user)

    create_activity_record(
        db=db,
        user=user,
        browser=browser,
        os=operating_system,
        ip_address=ip_address,
        device_type=device_type,
        is_new_device=new_device,
        is_new_ip=new_ip,
    )

    create_audit_log(
        db,
        performed_by=user.email,
        action="LOGIN",
        target_user=user.email,
        company_id=user.company_id,
        details=f"{browser_info or 'unknown browser'} / {ip_address or 'unknown IP'}"
    )

    if new_device:
        create_audit_log(
            db,
            performed_by=user.email,
            action="NEW_DEVICE_DETECTED",
            target_user=user.email,
            company_id=user.company_id,
            details=(
                f"Browser: {browser_info or 'unknown browser'} | "
                f"Previous Browser: {old_browser or 'unknown browser'}"
            )
        )

    if new_ip:
        create_audit_log(
            db,
            performed_by=user.email,
            action="NEW_IP_DETECTED",
            target_user=user.email,
            company_id=user.company_id,
            details=(
                f"Old IP: {old_ip or 'unknown IP'} | "
                f"New IP: {ip_address or 'unknown IP'}"
            )
        )

    return {
        "success": True,
        "message": "Login successful",
        "data": {
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "company_id": user.company_id,
                "companyId": user.company_id,
                "is_active": user.is_active,
                "isActive": user.is_active,
                "attendance_access": user.attendance_access,
                "attendanceAccess": user.attendance_access,
                "deactivated_by": user.deactivated_by,
                "deactivation_reason": user.deactivation_reason,
                "deactivated_at": user.deactivated_at,
                "suspension_status": getattr(user, 'suspension_status', 'active'),
                "suspended_by": getattr(user, 'suspended_by', None),
                "suspended_at": getattr(user, 'suspended_at', None),
                "suspension_reason": getattr(user, 'suspension_reason', None),
                "last_login": user.last_login,
                "last_logout": user.last_logout,
                "browser_info": user.browser_info,
                "ip_address": user.ip_address,
            },
            "token": f"token_{user.id}_{user.email}"
        }
    }


def logout_user(
    db: Session,
    user_id: int,
    browser_info: str = None,
    ip_address: str = None
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        return {"success": False, "message": "User not found"}

    browser, operating_system, device_type = parse_user_agent(browser_info)

    user.last_logout = datetime.utcnow()
    user.browser_info = browser_info
    user.ip_address = ip_address
    db.commit()
    db.refresh(user)

    complete_activity_record(
        db=db,
        user_id=user.id,
        browser=browser,
        os=operating_system,
        ip_address=ip_address,
    )

    create_audit_log(
        db,
        performed_by=user.email,
        action="LOGOUT",
        target_user=user.email,
        company_id=user.company_id,
        details=f"User logged out from {browser_info or 'unknown browser'} at {ip_address or 'unknown IP'}"
    )

    return {
        "success": True,
        "message": "Logout recorded",
        "data": {
            "user": {
                "id": user.id,
                "last_login": user.last_login,
                "last_logout": user.last_logout,
                "browser_info": user.browser_info,
                "ip_address": user.ip_address,
            }
        }
    }
