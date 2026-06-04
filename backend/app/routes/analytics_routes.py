from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.services.analytics_service import get_dashboard_analytics

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

@router.get("/dashboard")
def dashboard_analytics(
    db: Session = Depends(get_db)
):
    return get_dashboard_analytics(db)