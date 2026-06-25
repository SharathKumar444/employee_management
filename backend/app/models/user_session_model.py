from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from app.config.database import Base
from datetime import datetime


class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    user_email = Column(String, nullable=False)
    company_id = Column(String, nullable=False, index=True)
    session_token = Column(String, unique=True, nullable=False, index=True)
    
    # Session details
    browser_info = Column(String, nullable=True)
    os_info = Column(String, nullable=True)
    device_type = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # Session timing
    login_time = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_activity_time = Column(DateTime, default=datetime.utcnow, nullable=False)
    logout_time = Column(DateTime, nullable=True)
    
    # Session status
    status = Column(String, default="active")  # active, expired, logged_out, revoked
    is_active = Column(Boolean, default=True, index=True)
    
    # Session management
    is_forced_logout = Column(Boolean, default=False)
    is_revoked = Column(Boolean, default=False)
    revoked_by = Column(String, nullable=True)  # admin email who revoked the session
    revoked_at = Column(DateTime, nullable=True)
    revocation_reason = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
