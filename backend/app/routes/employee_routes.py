from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session
from app.models.employee_schema import EmployeeSchema
from app.config.database import SessionLocal

from app.controllers.employee_controller import (
    get_all_employees,
    get_employee_by_id,
    create_employee,
    update_employee,
    delete_employee
)

from app.models.employee_schema import ( # type: ignore
    EmployeeSchema
)

router = APIRouter()


def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


def serialize_employee(employee):
    return {
        "id": employee.id,
        "name": employee.name,
        "department": employee.department,
        "designation": employee.designation,
        "email": employee.email,
        "status": employee.status
    }


@router.get("/employees")
def fetch_employees(
    db: Session = Depends(get_db)
):
    employees = get_all_employees(db)

    return {
        "success": True,
        "data": [
            serialize_employee(employee)
            for employee in employees
        ]
    }


@router.get("/employees/{employee_id}")
def fetch_employee(
    employee_id: int,
    db: Session = Depends(get_db)
):
    employee = get_employee_by_id(
        db,
        employee_id
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return {
        "success": True,
        "data": serialize_employee(
            employee
        )
    }


@router.post("/employees")
def add_employee(
    employee: EmployeeSchema,
    db: Session = Depends(get_db)
):
    new_employee = create_employee(
        db,
        employee
    )

    return {
        "success": True,
        "message":
            "Employee added successfully",
        "data": serialize_employee(
            new_employee
        )
    }


@router.put("/employees/{employee_id}")
def edit_employee(
    employee_id: int,
    employee: EmployeeSchema,
    db: Session = Depends(get_db)
):
    updated_employee = update_employee(
        db,
        employee_id,
        employee
    )

    if not updated_employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return {
        "success": True,
        "message":
            "Employee updated successfully",
        "data": serialize_employee(
            updated_employee
        )
    }


@router.delete("/employees/{employee_id}")
def remove_employee(
    employee_id: int,
    db: Session = Depends(get_db)
):
    deleted_employee = delete_employee(
        db,
        employee_id
    )

    if not deleted_employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return {
        "success": True,
        "message":
            "Employee deleted successfully"
    }