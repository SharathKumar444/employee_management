from sqlalchemy.orm import Session
from app.models.user_model import User


def login_user(
    db: Session,
    email: str,
    password: str
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
            },
            "token": f"token_{user.id}_{user.email}"
        }
    }
