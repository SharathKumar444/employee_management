from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user_model import User

ACCOUNT_SUSPENDED_CODE = "ACCOUNT_SUSPENDED"
ADMIN_ACCESS_REQUIRED_CODE = "ADMIN_ACCESS_REQUIRED"
USER_NOT_FOUND_CODE = "USER_NOT_FOUND"


def get_user_by_id(db: Session, user_id: int, company_id: str = None):
    query = db.query(User).filter(User.id == user_id)
    if company_id is not None:
        query = query.filter(User.company_id == company_id)
    return query.first()


def get_user_by_email(db: Session, email: str, company_id: str = None):
    query = db.query(User).filter(User.email == email)
    if company_id is not None:
        query = query.filter(User.company_id == company_id)
    return query.first()


def raise_if_user_inactive(user):
    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found",
            headers={"X-Error-Code": USER_NOT_FOUND_CODE},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Account Deactivated",
            headers={"X-Error-Code": "ACCOUNT_DEACTIVATED"},
        )
    if user.suspension_status == "suspended":
        raise HTTPException(
            status_code=403,
            detail="Account Suspended",
            headers={"X-Error-Code": ACCOUNT_SUSPENDED_CODE},
        )
    return user


def raise_if_user_not_admin(user):
    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found",
            headers={"X-Error-Code": USER_NOT_FOUND_CODE},
        )
    if user.role != 'admin':
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
            headers={"X-Error-Code": ADMIN_ACCESS_REQUIRED_CODE},
        )
    return user


def ensure_user_active_by_id(db: Session, user_id: int, company_id: str = None):
    user = get_user_by_id(db, user_id, company_id)
    return raise_if_user_inactive(user)


def ensure_user_active_by_email(db: Session, email: str, company_id: str = None):
    user = get_user_by_email(db, email, company_id)
    return raise_if_user_inactive(user)


def ensure_user_active_admin_by_email(db: Session, email: str, company_id: str = None):
    user = get_user_by_email(db, email, company_id)
    raise_if_user_inactive(user)
    return raise_if_user_not_admin(user)
