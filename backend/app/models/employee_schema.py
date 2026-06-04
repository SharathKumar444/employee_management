from pydantic import BaseModel


class EmployeeSchema(BaseModel):
    name: str
    department: str
    designation: str
    email: str
    status: str
    company_id: str   # ✅ MUST exist


class Config:
    orm_mode = True