from fastapi import APIRouter

router = APIRouter(
    prefix="/members",
    tags=["Members"]
)

# Simulated database
members = [
    
     {
        "id": 1,
        "name": "Emma Wilson",
        "email": "emma@example.com",
        "role": "Employee",
        "department": "Engineering",
        "status": "Active"
    },
    {
        "id": 2,
        "name": "David Miller",
        "email": "david@example.com",
        "role": "Employee",
        "department": "Finance",
        "status": "Inactive"
    },
    {
        "id": 3,
        "name": "Sophia Brown",
        "email": "sophia@example.com",
        "role": "Employee",
        "department": "HR",
        "status": "Active"
    },
    {
        "id": 4,
        "name": "James Anderson",
        "email": "james@example.com",
        "role": "Employee",
        "department": "Engineering",
        "status": "Active"
    },
    {
        "id": 5,
        "name": "Olivia Taylor",
        "email": "olivia@example.com",
        "role": "Employee",
        "department": "Marketing",
        "status": "Active"
    },
    {
        "id": 6,
        "name": "Daniel Thomas",
        "email": "daniel@example.com",
        "role": "Employee",
        "department": "Sales",
        "status": "Active"
    },
    {
        "id": 7,
        "name": "Ava Martinez",
        "email": "ava@example.com",
        "role": "Employee",
        "department": "Support",
        "status": "Active"
    },
    {
        "id": 8,
        "name": "William Harris",
        "email": "william@example.com",
        "role": "Employee",
        "department": "Engineering",
        "status": "Active"
    },
    {
        "id": 9,
        "name": "Mia Clark",
        "email": "mia@example.com",
        "role": "Employee",
        "department": "Finance",
        "status": "Active"
    },
    {
        "id": 10,
        "name": "Benjamin Lewis",
        "email": "benjamin@example.com",
        "role": "Employee",
        "department": "Operations",
        "status": "On Leave"
    },
    {
        "id": 11,
        "name": "Charlotte Walker",
        "email": "charlotte@example.com",
        "role": "Employee",
        "department": "Engineering",
        "status": "Active"
    },
    {
        "id": 12,
        "name": "Elijah Hall",
        "email": "elijah@example.com",
        "role": "Employee",
        "department": "Marketing",
        "status": "Active"
    },
    {
        "id": 13,
        "name": "Amelia Allen",
        "email": "amelia@example.com",
        "role": "Employee",
        "department": "HR",
        "status": "Active"
    },
    {
        "id": 14,
        "name": "Lucas Young",
        "email": "lucas@example.com",
        "role": "Employee",
        "department": "Engineering",
        "status": "Inactive"
    },
    {
        "id": 15,
        "name": "Harper King",
        "email": "harper@example.com",
        "role": "Employee",
        "department": "Support",
        "status": "Active"
    }

]



@router.get("/")
def get_members(company_id: str = None):
    if company_id:
        return [
            member
            for member in members
            if member["companyId"] == company_id
        ]

    return members


@router.put("/{member_id}/deactivate")
def deactivate_member(member_id: int):
    for member in members:
        if member["id"] == member_id:
            member["status"] = "Deactivated"

            return {
                "success": True,
                "message": "User deactivated",
                "member": member
            }

    return {
        "success": False,
        "message": "Member not found"
    }


@router.put("/{member_id}/activate")
def activate_member(member_id: int):
    for member in members:
        if member["id"] == member_id:
            member["status"] = "Active"

            return {
                "success": True,
                "message": "User activated",
                "member": member
            }

    return {
        "success": False,
        "message": "Member not found"
    }


@router.post("/")
def add_member(member: dict):

    new_id = (
        max(
            [m["id"] for m in members],
            default=0
        )
        + 1
    )

    member["id"] = new_id

    if "status" not in member:
        member["status"] = "Active"

    members.append(member)

    return {
        "success": True,
        "member": member
    }