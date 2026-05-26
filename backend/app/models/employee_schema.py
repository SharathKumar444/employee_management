from pydantic import BaseModel, EmailStr


class EmployeeSchema(BaseModel):
    name: str
    department: str
    designation: str
    email: EmailStr
    status: str