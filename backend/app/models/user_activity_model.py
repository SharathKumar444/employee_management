from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text

from app.config.database import Base


class UserActivity(Base):
    __tablename__ = "user_activity"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    company_id = Column(String, nullable=False)
    login_time = Column(DateTime, nullable=True)
    logout_time = Column(DateTime, nullable=True)
    browser = Column(Text, nullable=True)
    os = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    device_type = Column(String, nullable=True)
    is_new_device = Column(Boolean, default=False)
    is_new_ip = Column(Boolean, default=False)
