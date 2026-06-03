from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.config.database import SessionLocal

from app.schemas.role_request_schema import (
    RoleRequestCreate,
)

from app.controllers.role_request_controller import (
    create_role_request,
)

router = APIRouter(
    prefix="/role-request",
    tags=["Role Requests"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def submit_role_request(
    data: RoleRequestCreate,
    db: Session = Depends(get_db)
):
    # TEMP USER DATA
    current_user = {
        "email": "sharath@gmail.com",
        "password": "123456",
        "role": "user",
    }

    return create_role_request(
        db,
        data.password,
        data.admin_email,
        current_user
    )