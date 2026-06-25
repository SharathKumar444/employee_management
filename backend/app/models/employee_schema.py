from typing import Optional
from pydantic import BaseModel


class EmployeeSchema(BaseModel):
    name: str
    department: str
    designation: str
    email: str
    status: str
    phone: Optional[str] = None
    address: Optional[str] = None
    date_of_joining: Optional[str] = None
    profile_picture: Optional[str] = None
    employee_id: Optional[str] = None
    company_id: str   # ✅ MUST exist

    class Config:
        orm_mode = True
