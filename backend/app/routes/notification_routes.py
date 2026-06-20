from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.config.database import SessionLocal
from app.controllers.notification_controller import (
    get_notifications,
    mark_notification_read,
    mark_all_read,
)
from app.utils.user_status import ensure_user_active_by_id

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def fetch_notifications(user_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    ensure_user_active_by_id(db, user_id)

    try:
        data = get_notifications(db, user_id)
        return {"success": True, "data": data}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.put("/{notification_id}/mark_read")
def mark_read(
    notification_id: int,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    if user_id is not None:
        ensure_user_active_by_id(db, user_id)

    res = mark_notification_read(db, notification_id)
    if not res:
        raise HTTPException(status_code=404, detail="Notification not found")
    return res


@router.put("/mark_all_read")
def mark_all(user_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    ensure_user_active_by_id(db, user_id)
    return mark_all_read(db, user_id)
