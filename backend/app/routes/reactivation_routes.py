from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session

from app.config.database import SessionLocal
from app.controllers.reactivation_controller import (
    create_request,
    get_requests,
    approve_request,
    reject_request,
)

router = APIRouter(
    prefix="/reactivation",
    tags=["Reactivation"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def submit_request(
    user_id: int = Body(...),
    company_id: str = Body(...),
    reason: Optional[str] = Body(None),
    db: Session = Depends(get_db)
):
    try:
        return create_request(db, user_id, company_id, reason)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/")
def fetch_requests(
    company_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        return get_requests(db, company_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.put("/{request_id}/approve")
def approve(
    request_id: int,
    admin_name: Optional[str] = Query(None),
    comment: Optional[str] = Body(None),
    db: Session = Depends(get_db)
):
    try:
        if not admin_name:
            raise HTTPException(status_code=400, detail="admin_name is required")
        
        result = approve_request(db, request_id, admin_name, comment)

        if not result:
            raise HTTPException(status_code=404, detail="Request not found")

        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.put("/{request_id}/reject")
def reject(
    request_id: int,
    admin_name: Optional[str] = Query(None),
    comment: Optional[str] = Body(None),
    db: Session = Depends(get_db)
):
    try:
        if not admin_name:
            raise HTTPException(status_code=400, detail="admin_name is required")
        
        result = reject_request(db, request_id, admin_name, comment)

        if not result:
            raise HTTPException(status_code=404, detail="Request not found")

        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
