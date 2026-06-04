from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import SessionLocal
from app.models.audit_log_model import AuditLog

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/audit-logs")
def get_logs(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()

    return {
        "success": True,
        "data": [
            {
                "id": log.id,
                "userName": log.user_name,
                "action": log.action,
                "timestamp": log.timestamp,
                "relatedUser": log.related_user,
                "role": log.role
            }
            for log in logs
        ]
    }