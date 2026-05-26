from sqlalchemy.orm import Session

from app.models.employee_model import Employee


def get_all_employees(db: Session):
    return db.query(Employee).all()


def get_employee_by_id(
    db: Session,
    employee_id: int
):
    return db.query(Employee).filter(
        Employee.id == employee_id
    ).first()


def create_employee(
    db: Session,
    employee_data
):
    employee = Employee(
        name=employee_data.name,
        department=employee_data.department,
        designation=employee_data.designation,
        email=employee_data.email,
        status=employee_data.status
    )

    db.add(employee)

    db.commit()

    db.refresh(employee)

    return employee


def update_employee(
    db: Session,
    employee_id: int,
    updated_data
):
    employee = db.query(Employee).filter(
        Employee.id == employee_id
    ).first()

    if employee:
        employee.name = updated_data.name
        employee.department = updated_data.department
        employee.designation = updated_data.designation
        employee.email = updated_data.email
        employee.status = updated_data.status

        db.commit()

        db.refresh(employee)

    return employee


def delete_employee(
    db: Session,
    employee_id: int
):
    employee = db.query(Employee).filter(
        Employee.id == employee_id
    ).first()

    if employee:
        db.delete(employee)

        db.commit()

    return employee