from sqlalchemy import Column, Integer, String, Boolean

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
