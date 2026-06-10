from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.config.database import SessionLocal
from app.schemas.invitation_schema import InvitationCreate
from app.controllers.invitation_controller import (
    create_invitation,
    get_pending_invitations,
    revoke_invitation,
    validate_invitation,
    create_user_from_invitation,
)


class SignupPayload(BaseModel):
    name: str
    email: str
    password: str
    role: str = "user"
    company_id: str
    invite_token: Optional[str] = None


router = APIRouter(
    tags=["Invitations"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/signup")
def signup(
    payload: SignupPayload,
    db: Session = Depends(get_db)
):
    try:
        result = create_user_from_invitation(
            db,
            payload.name,
            payload.email,
            payload.password,
            payload.role,
            payload.company_id,
            payload.invite_token,
        )

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("message"))

        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/invitations/validate")
def validate(
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        if not token:
            raise HTTPException(status_code=400, detail="Token is required")

        result = validate_invitation(db, token)

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("message"))

        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/invitations")
def create(
    payload: InvitationCreate,
    db: Session = Depends(get_db)
):
    try:
        return create_invitation(
            db,
            payload.email,
            payload.role,
            payload.admin_email,
            payload.company_id,
            payload.expires_days,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/invitations")
def pending(
    company_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        return get_pending_invitations(db, company_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.put("/invitations/{invite_id}/revoke")
def revoke(
    invite_id: int,
    admin_email: Optional[str] = Query(None),
    company_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        result = revoke_invitation(
            db,
            invite_id,
            admin_email,
            company_id,
        )

        if not result.get("success"):
            raise HTTPException(status_code=404, detail=result.get("message"))

        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

