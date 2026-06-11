from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.audit_log_model import AuditLog

router = APIRouter()


@router.get("/audit-logs")
def get_logs(
    company_id: str = Query(...),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Return audit logs scoped to a company (tenant isolation)."""
    logs = (
        db.query(AuditLog)
        .filter(AuditLog.company_id == company_id)
        .order_by(AuditLog.timestamp.desc())
        .limit(limit)
        .all()
    )

    return {
        "success": True,
        "data": [
            {
                "id": log.id,
                "performed_by": log.performed_by,
                "action": log.action,
                "timestamp": log.timestamp,
                "target_user": log.target_user,
                "company_id": log.company_id,
            }
            for log in logs
        ],
    }