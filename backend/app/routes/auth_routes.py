from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.config.database import SessionLocal
from app.controllers.auth_controller import login_user


class LoginPayload(BaseModel):
    email: str
    password: str


router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/login")
def login(
    payload: LoginPayload,
    db: Session = Depends(get_db)
):
    try:
        result = login_user(
            db,
            payload.email,
            payload.password
        )

        if not result.get("success"):
            raise HTTPException(status_code=401, detail=result.get("message"))

        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
