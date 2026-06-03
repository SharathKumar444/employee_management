from pydantic import BaseModel, EmailStr


class RoleRequestCreate(BaseModel):
    password: str
    admin_email: EmailStr


class RoleRequestResponse(BaseModel):
    id: int
    user_email: str
    current_role: str
    requested_role: str
    admin_email: str
    status: str

    class Config:
        from_attributes = True