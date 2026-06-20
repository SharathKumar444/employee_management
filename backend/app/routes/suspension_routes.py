from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session

from app.config.database import SessionLocal
from app.controllers.suspension_controller import (
    suspend_user,
    unsuspend_user,
    create_reinstatement_request,
    get_reinstatement_requests,
    approve_reinstatement_request,
    reject_reinstatement_request,
    get_members_list,
)
from app.utils.user_status import ensure_user_active_admin_by_email

router = APIRouter(
    prefix="/suspension",
    tags=["Suspension"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# MEMBERS MANAGEMENT
# =========================
@router.get("/members")
def fetch_members(
    company_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all members in a company"""
    try:
        if not company_id:
            raise HTTPException(status_code=400, detail="company_id is required")
        
        return get_members_list(db, company_id)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# =========================
# SUSPEND USER
# =========================
@router.post("/suspend/{user_id}")
def suspend(
    user_id: int,
    admin_email: Optional[str] = Query(None),
    company_id: Optional[str] = Query(None),
    reason: Optional[str] = Body(None),
    db: Session = Depends(get_db)
):
    """Admin suspends a user"""
    try:
        if not admin_email:
            raise HTTPException(status_code=400, detail="admin_email is required")
        
        ensure_user_active_admin_by_email(db, admin_email, company_id)
        result = suspend_user(db, user_id, admin_email, reason)
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("message"))
        
        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# =========================
# UNSUSPEND USER (Direct)
# =========================
@router.post("/unsuspend/{user_id}")
def unsuspend(
    user_id: int,
    admin_email: Optional[str] = Query(None),
    company_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Admin directly unsuspends a user (without reinstatement request)"""
    try:
        if not admin_email:
            raise HTTPException(status_code=400, detail="admin_email is required")
        
        ensure_user_active_admin_by_email(db, admin_email, company_id)
        result = unsuspend_user(db, user_id, admin_email)
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("message"))
        
        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# =========================
# REINSTATEMENT REQUESTS
# =========================
@router.post("/reinstatement-request")
def submit_reinstatement_request(
    user_id: int = Body(...),
    company_id: str = Body(...),
    reason: Optional[str] = Body(None),
    db: Session = Depends(get_db)
):
    """Suspended user submits reinstatement request"""
    try:
        result = create_reinstatement_request(db, user_id, company_id, reason)
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("message"))
        
        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/reinstatement-requests")
def fetch_reinstatement_requests(
    company_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all reinstatement requests for a company"""
    try:
        if not company_id:
            raise HTTPException(status_code=400, detail="company_id is required")
        
        return get_reinstatement_requests(db, company_id)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.put("/reinstatement-requests/{request_id}/approve")
def approve_reinstatement(
    request_id: int,
    admin_email: Optional[str] = Query(None),
    company_id: Optional[str] = Query(None),
    comment: Optional[str] = Body(None),
    db: Session = Depends(get_db)
):
    """Admin approves a reinstatement request"""
    try:
        if not admin_email:
            raise HTTPException(status_code=400, detail="admin_email is required")
        
        ensure_user_active_admin_by_email(db, admin_email, company_id)
        result = approve_reinstatement_request(db, request_id, admin_email, comment)
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("message"))
        
        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.put("/reinstatement-requests/{request_id}/reject")
def reject_reinstatement(
    request_id: int,
    admin_email: Optional[str] = Query(None),
    company_id: Optional[str] = Query(None),
    comment: Optional[str] = Body(None),
    db: Session = Depends(get_db)
):
    """Admin rejects a reinstatement request"""
    try:
        if not admin_email:
            raise HTTPException(status_code=400, detail="admin_email is required")
        
        ensure_user_active_admin_by_email(db, admin_email, company_id)
        result = reject_reinstatement_request(db, request_id, admin_email, comment)
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("message"))
        
        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
