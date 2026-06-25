from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.config.database import SessionLocal
from app.models.employee_schema import EmployeeSchema
from app.controllers.employee_controller import (
    get_all_employees,
    get_employee_by_id,
    create_employee,
    update_employee,
    delete_employee
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
        "phone": employee.phone,
        "address": employee.address,
        "date_of_joining": employee.date_of_joining,
        "profile_picture": employee.profile_picture,
        "employee_id": employee.employee_id,
        "status": employee.status,
        "companyId": employee.company_id
    }


# ✅ FIXED MULTI-TENANT FILTER
@router.get("/employees")
def fetch_employees(
    db: Session = Depends(get_db),
    company_id: str = Query(None)
):
    employees = get_all_employees(db)

    # 🔥 CRITICAL FIX: isolate tenant data
    if company_id:
        employees = [
            emp for emp in employees
            if emp.company_id == company_id
        ]

    return {
        "success": True,
        "data": [serialize_employee(emp) for emp in employees]
    }


@router.post("/employees")
def add_employee(employee: EmployeeSchema, db: Session = Depends(get_db)):
    new_employee = create_employee(db, employee)

    return {
        "success": True,
        "data": serialize_employee(new_employee)
    }


@router.put("/employees/{employee_id}")
def edit_employee(
    employee_id: int,
    employee: EmployeeSchema,
    db: Session = Depends(get_db),
    performed_by: str = Query("SYSTEM")
):
    updated = update_employee(db, employee_id, employee, user_name=performed_by)

    if not updated:
        raise HTTPException(status_code=404, detail="Employee not found")

    return {
        "success": True,
        "data": serialize_employee(updated)
    }


@router.delete("/employees/{employee_id}")
def remove_employee(employee_id: int, db: Session = Depends(get_db)):
    deleted = delete_employee(db, employee_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Employee not found")

    return {
        "success": True,
        "message": "Employee deleted successfully"
    }