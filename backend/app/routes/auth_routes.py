from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.config.database import SessionLocal
from app.controllers.auth_controller import login_user, logout_user


class LoginPayload(BaseModel):
    email: str
    password: str


class LogoutPayload(BaseModel):
    user_id: int


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
    request: Request,
    db: Session = Depends(get_db)
):
    try:
        browser_info = request.headers.get("user-agent")
        ip_address = request.client.host if request.client else None

        result = login_user(
            db,
            payload.email,
            payload.password,
            browser_info=browser_info,
            ip_address=ip_address
        )

        if not result.get("success"):
            raise HTTPException(status_code=401, detail=result.get("message"))

        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/logout")
def logout(
    payload: LogoutPayload,
    request: Request,
    db: Session = Depends(get_db)
):
    try:
        browser_info = request.headers.get("user-agent")
        ip_address = request.client.host if request.client else None

        result = logout_user(
            db,
            payload.user_id,
            browser_info=browser_info,
            ip_address=ip_address
        )

        if not result.get("success"):
            raise HTTPException(status_code=404, detail=result.get("message"))

        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
