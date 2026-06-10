from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.config.database import Base


class Invitation(Base):
    __tablename__ = "invitations"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False)
    role = Column(String, default="user")
    admin_email = Column(String, nullable=False)
    company_id = Column(String, nullable=False)
    invite_link = Column(String, nullable=False)
    status = Column(String, default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
