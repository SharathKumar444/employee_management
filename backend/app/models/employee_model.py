from sqlalchemy import Column, Integer, String
from app.config.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    designation = Column(String, nullable=False)
    email = Column(String, nullable=False)
    status = Column(String, nullable=False)

    # ✅ FIX: MUST be required for multi-tenant
    company_id = Column(String, nullable=False)