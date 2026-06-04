from datetime import datetime
from app.models.audit_log_model import AuditLog


def log_action(db, user_name: str, action: str, related_user: str = None, role: str = None):
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