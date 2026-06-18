from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime

from app.config.database import Base


class AuditLog(Base):
    __tablename__ = 'audit_logs'

    id = Column(Integer, primary_key=True, index=True)

    performed_by = Column(String, nullable=False)

    action = Column(String, nullable=False)

    target_user = Column(String)

    company_id = Column(String)

    details = Column(Text)

    timestamp = Column(
        DateTime,
        default=datetime.utcnow
    )
