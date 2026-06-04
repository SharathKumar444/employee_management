from sqlalchemy.orm import Session
from app.models.employee_model import Employee
from app.services.audit_service import log_action

def get_all_employees(db: Session):
    return db.query(Employee).all()


def get_employee_by_id(db: Session, employee_id: int):
    return db.query(Employee).filter(Employee.id == employee_id).first()


def create_employee(db: Session, employee_data, user_name="SYSTEM"):

    employee = Employee(
        name=employee_data.name,
        department=employee_data.department,
        designation=employee_data.designation,
        email=employee_data.email,
        status=employee_data.status,
        company_id=employee_data.company_id
    )

    db.add(employee)
    db.commit()
    db.refresh(employee)

    # AUDIT LOG
    log_action(
        db,
        user_name=user_name,
        action="Employee Created",
        related_user=employee.name
    )

    return employee


def update_employee(db: Session, employee_id: int, employee_data, user_name="SYSTEM"):

    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if not employee:
        return None

    employee.name = employee_data.name
    employee.department = employee_data.department
    employee.designation = employee_data.designation
    employee.email = employee_data.email
    employee.status = employee_data.status
    employee.company_id = employee_data.company_id

    db.commit()
    db.refresh(employee)

    # AUDIT LOG
    log_action(
        db,
        user_name=user_name,
        action="Employee Updated",
        related_user=employee.name
    )

    return employee


def delete_employee(db: Session, employee_id: int, user_name="SYSTEM"):

    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if not employee:
        return None

    db.delete(employee)
    db.commit()

    # AUDIT LOG
    log_action(
        db,
        user_name=user_name,
        action="Employee Deleted",
        related_user=employee.name
    )

    return employee