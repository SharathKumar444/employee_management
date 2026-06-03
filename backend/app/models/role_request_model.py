from sqlalchemy import Column, Integer, String

from app.config.database import Base


class RoleRequest(Base):
    __tablename__ = "role_requests"

    id = Column(Integer, primary_key=True, index=True)

    user_email = Column(String, nullable=False)

    current_role = Column(String, default="user")

    requested_role = Column(String, default="admin")

    admin_email = Column(String, nullable=False)

    status = Column(String, default="pending")