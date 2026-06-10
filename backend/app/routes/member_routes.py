from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.config.database import SessionLocal
from app.controllers.member_controller import (
    get_members,
    deactivate_member,
    reactivate_member,
)

router = APIRouter(
    prefix="/members",
    tags=["Members"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def fetch_members(
    company_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return get_members(db, company_id)


@router.put("/{member_id}/deactivate")
def deactivate(
    member_id: int,
    admin_email: Optional[str] = Query(None),
    company_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    result = deactivate_member(db, member_id, admin_email, company_id)

    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("message"))

    return result


@router.put("/{member_id}/reactivate")
def reactivate(
    member_id: int,
    admin_email: Optional[str] = Query(None),
    company_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    result = reactivate_member(db, member_id, admin_email, company_id)

    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("message"))

    return result

    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("message"))

    return result
