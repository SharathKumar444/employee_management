# app/models/invitation_model.py

from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.config.database import Base

class Invitation(Base):
    __tablename__ = "invitations"

    id = Column(Integer, primary_key=True)
    email = Column(String, nullable=False)

    role = Column(String, nullable=False)

    company_id = Column(String, nullable=False)

    invitation_token = Column(String, unique=True)

    status = Column(
        String,
        default="Pending"
    )

    created_by = Column(String)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )