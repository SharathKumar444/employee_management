# app/models/reactivation_request_model.py

from sqlalchemy import Column,Integer,String,DateTime
from datetime import datetime

from app.config.database import Base

class ReactivationRequest(Base):

    __tablename__ = "reactivation_requests"

    id = Column(Integer, primary_key=True)

    user_email = Column(String)

    company_id = Column(String)

    reason = Column(String)

    status = Column(
        String,
        default="Pending"
    )

    submitted_at = Column(
        DateTime,
        default=datetime.utcnow
    )