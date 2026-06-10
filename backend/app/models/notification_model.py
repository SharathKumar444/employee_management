from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from datetime import datetime

from app.config.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    recipient_user_id = Column(Integer, nullable=False)
    type = Column(String, nullable=False)
    payload = Column(Text, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
