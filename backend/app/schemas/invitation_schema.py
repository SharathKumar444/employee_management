from pydantic import BaseModel
from typing import Optional


class InvitationCreate(BaseModel):
    email: str
    role: str = "user"
    admin_email: Optional[str] = None
    company_id: Optional[str] = None
    expires_days: Optional[int] = None


class Config:
    orm_mode = True
