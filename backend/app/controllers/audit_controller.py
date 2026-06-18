from app.models.audit_log_model import AuditLog


def create_audit_log(
    db,
    performed_by: str,
    action: str,
    target_user: str = None,
    company_id: str = None,
    details: str = None,
):
    log = AuditLog(
        performed_by=performed_by,
        action=action,
        target_user=target_user,
        company_id=company_id,
        details=details,
    )

    db.add(log)
    db.commit()

    return log