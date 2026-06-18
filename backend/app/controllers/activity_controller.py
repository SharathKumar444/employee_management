from datetime import datetime

from sqlalchemy.orm import Session

from app.models.user_activity_model import UserActivity
from app.models.user_model import User


def create_activity_record(
    db: Session,
    user: User,
    browser: str,
    os: str,
    ip_address: str,
    device_type: str,
    is_new_device: bool,
    is_new_ip: bool,
):
    activity = UserActivity(
        user_id=user.id,
        company_id=user.company_id,
        login_time=datetime.utcnow(),
        browser=browser,
        os=os,
        ip_address=ip_address,
        device_type=device_type,
        is_new_device=is_new_device,
        is_new_ip=is_new_ip,
    )

    db.add(activity)
    db.commit()
    db.refresh(activity)

    return activity


def complete_activity_record(
    db: Session,
    user_id: int,
    browser: str = None,
    os: str = None,
    ip_address: str = None,
):
    activity = (
        db.query(UserActivity)
        .filter(UserActivity.user_id == user_id)
        .order_by(UserActivity.login_time.desc())
        .first()
    )

    if not activity or activity.logout_time:
        return None

    activity.logout_time = datetime.utcnow()

    if browser:
        activity.browser = browser
    if os:
        activity.os = os
    if ip_address:
        activity.ip_address = ip_address

    db.commit()
    db.refresh(activity)

    return activity


def fetch_activity_list(db: Session, company_id: str):
    users = db.query(User).filter(User.company_id == company_id).all()
    activity_list = []

    for user in users:
        latest_activity = (
            db.query(UserActivity)
            .filter(UserActivity.user_id == user.id)
            .order_by(UserActivity.login_time.desc())
            .first()
        )

        activity_list.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "company_id": user.company_id,
            "is_active": user.is_active,
            "status": "Active" if user.is_active else "Offline",
            "last_login": latest_activity.login_time if latest_activity else user.last_login,
            "last_logout": latest_activity.logout_time if latest_activity else user.last_logout,
            "browser": latest_activity.browser if latest_activity else user.browser_info,
            "ip_address": latest_activity.ip_address if latest_activity else user.ip_address,
            "device_type": latest_activity.device_type if latest_activity else None,
            "is_new_device": latest_activity.is_new_device if latest_activity else False,
            "is_new_ip": latest_activity.is_new_ip if latest_activity else False,
        })

    return {
        "success": True,
        "data": activity_list,
    }


def fetch_activity_detail(
    db: Session,
    company_id: str,
    user_id: int,
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .filter(User.company_id == company_id)
        .first()
    )

    if not user:
        return {
            "success": False,
            "message": "User not found",
        }

    latest_activity = (
        db.query(UserActivity)
        .filter(UserActivity.user_id == user.id)
        .order_by(UserActivity.login_time.desc())
        .first()
    )

    return {
        "success": True,
        "data": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "company_id": user.company_id,
            "company": user.company_id,
            "is_active": user.is_active,
            "status": "Active" if user.is_active else "Offline",
            "last_login": latest_activity.login_time if latest_activity else user.last_login,
            "last_logout": latest_activity.logout_time if latest_activity else user.last_logout,
            "browser": latest_activity.browser if latest_activity else user.browser_info,
            "os": latest_activity.os if latest_activity else None,
            "ip_address": latest_activity.ip_address if latest_activity else user.ip_address,
            "device_type": latest_activity.device_type if latest_activity else None,
            "is_new_device": latest_activity.is_new_device if latest_activity else False,
            "is_new_ip": latest_activity.is_new_ip if latest_activity else False,
        },
    }
