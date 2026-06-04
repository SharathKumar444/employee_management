# app/models/company_model.py

from sqlalchemy import Column, Integer, String
from app.config.database import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True)
    company_id = Column(String, unique=True)
    company_name = Column(String)