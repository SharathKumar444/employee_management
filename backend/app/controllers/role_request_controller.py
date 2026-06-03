from fastapi import HTTPException

from app.models.role_request_model import RoleRequest


def create_role_request(
    db,
    password,
    admin_email,
    current_user
):
    if password != current_user["password"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid password"
        )

    if current_user["role"] != "user":
        raise HTTPException(
            status_code=403,
            detail="Only users can request role change"
        )

    existing = (
        db.query(RoleRequest)
        .filter(
            RoleRequest.user_email == current_user["email"],
            RoleRequest.status == "pending"
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Pending request already exists"
        )

    request = RoleRequest(
        user_email=current_user["email"],
        current_role="user",
        requested_role="admin",
        admin_email=admin_email,
        status="pending"
    )

    db.add(request)
    db.commit()
    db.refresh(request)

    return request