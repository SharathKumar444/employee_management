from datetime import datetime
from sqlalchemy.orm import Session
from app.models.audit_log_model import AuditLog


def log_action(
    db: Session,
    user_name: str,
    action: str,
    related_user: str = None,
    role: str = None,
    company_id: str = None
):
    """
    Create an audit log entry.

    Backwards-compatible: accepts `role` param but stores it in `company_id`
    if `company_id` is not provided.
    """
    try:
        log = AuditLog(
            performed_by=user_name,
            action=action,
            target_user=related_user,
            company_id=company_id or role,
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