from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.config.database import Base


class ReactivationRequest(Base):
    __tablename__ = "reactivation_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    company_id = Column(String, nullable=False)
    status = Column(String, default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)
