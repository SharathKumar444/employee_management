from fastapi import APIRouter

router = APIRouter(
    prefix="/reactivation",
    tags=["Reactivation"]
)

requests = []


@router.get("/")
def get_requests():
    return requests


@router.post("/request")
def create_request():
    request = {
        "id": len(requests) + 1,
        "user_name": "John Smith",
        "status": "Pending",
        "created_at": "2026-06-05"
    }

    requests.append(request)

    return {
        "message": "Request submitted",
        "request": request
    }


@router.put("/{request_id}/approve")
def approve_request(request_id: int):
    for request in requests:
        if request["id"] == request_id:
            request["status"] = "Approved"
            return {
                "message": "Approved"
            }

    return {"message": "Request not found"}


@router.put("/{request_id}/reject")
def reject_request(request_id: int):
    for request in requests:
        if request["id"] == request_id:
            request["status"] = "Rejected"
            return {
                "message": "Rejected"
            }

    return {"message": "Request not found"}