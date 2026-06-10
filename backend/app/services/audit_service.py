from datetime import datetime
from sqlalchemy.orm import Session
from app.models.audit_log_model import AuditLog


def log_action(
    db: Session,
    user_name: str,
    action: str,
    related_user: str = None,
    role: str = None
):
    try:
        log = AuditLog(
            user_name=user_name,
            action=action,
            related_user=related_user,
            role=role,
            timestamp=datetime.utcnow()
        )

        db.add(log)
        db.commit()
        db.refresh(log)

        return log

    except Exception as e:
        db.rollback()
        print("Audit Log Error:", e)
        return None