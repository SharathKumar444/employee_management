from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text

from app.config.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="user")
    company_id = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    attendance_access = Column(Boolean, default=False)
    deactivated_by = Column(String, nullable=True)
    deactivated_at = Column(DateTime, nullable=True)
    deactivation_reason = Column(Text, nullable=True)
    suspension_status = Column(String, default="active")  # active, suspended
    suspended_by = Column(String, nullable=True)
    suspended_at = Column(DateTime, nullable=True)
    suspension_reason = Column(Text, nullable=True)
    last_login = Column(DateTime, nullable=True)
    last_logout = Column(DateTime, nullable=True)
    browser_info = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
