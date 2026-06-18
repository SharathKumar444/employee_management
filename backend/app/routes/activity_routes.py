from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.config.database import SessionLocal
from app.controllers.activity_controller import (
    fetch_activity_detail,
    fetch_activity_list,
)

router = APIRouter(
    prefix="/activity-tracking",
    tags=["Activity Tracking"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def activity_list(
    company_id: str = Query(...),
    db: Session = Depends(get_db),
):
    return fetch_activity_list(db, company_id)


@router.get("/{user_id}")
def activity_detail(
    user_id: int,
    company_id: str = Query(...),
    db: Session = Depends(get_db),
):
    result = fetch_activity_detail(db, company_id, user_id)

    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("message"))

    return result
