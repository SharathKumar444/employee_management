from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime

from app.config.database import Base


class ReinstallmentRequest(Base):
    __tablename__ = "reinstatement_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    company_id = Column(String, nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(String, default="Pending")  # Pending, Approved, Rejected
    admin_reviewer = Column(String, nullable=True)
    review_comment = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
