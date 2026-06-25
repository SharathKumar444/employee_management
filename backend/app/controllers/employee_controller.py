import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.employee_model import Employee
from app.models.user_model import User
from app.services.audit_service import log_action
from app.utils.notification_utils import create_notification

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
        phone=employee_data.phone,
        address=employee_data.address,
        date_of_joining=employee_data.date_of_joining,
        profile_picture=employee_data.profile_picture,
        employee_id=employee_data.employee_id,
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
        related_user=employee.name,
        company_id=employee.company_id
    )

    return employee


def requires_attendance_access(department: str) -> bool:
    """Determine whether a department should have attendance access granted."""
    return department in {"Finance", "Operations"}


def update_employee(db: Session, employee_id: int, employee_data, user_name="SYSTEM"):

    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if not employee:
        return None

    original_department = employee.department
    original_email = employee.email

    employee.name = employee_data.name
    employee.department = employee_data.department
    employee.designation = employee_data.designation
    employee.email = employee_data.email
    employee.phone = employee_data.phone
    employee.address = employee_data.address
    employee.date_of_joining = employee_data.date_of_joining
    employee.profile_picture = employee_data.profile_picture
    employee.employee_id = employee_data.employee_id
    employee.status = employee_data.status
    employee.company_id = employee_data.company_id

    db.commit()
    db.refresh(employee)

    department_changed = (
        original_department != employee_data.department
    )

    action = (
        f"Employee Transferred ({original_department} → {employee.department})"
        if department_changed
        else "Employee Updated"
    )

    # AUDIT LOG
    log_action(
        db,
        user_name=user_name,
        action=action,
        related_user=employee.name,
        company_id=employee.company_id
    )

    if department_changed:
        user = db.query(User).filter(
            User.email == original_email,
            User.company_id == employee.company_id
        ).first()

        if user:
            required_access = requires_attendance_access(employee.department)
            if user.attendance_access != required_access:
                user.attendance_access = required_access
                db.commit()
                db.refresh(user)

            transfer_payload_obj = {
                "employee_name": employee.name,
                "from_department": original_department,
                "to_department": employee.department,
                "transferred_at": datetime.now().isoformat(),
            }

            create_notification(
                db=db,
                recipient_user_id=user.id,
                type="employee_transferred",
                payload=json.dumps(transfer_payload_obj),
            )
            print(f"✅ Notification created for user {user.id}: {employee.name} transferred from {original_department} to {employee.department}")
        else:
            print(f"⚠️  No user found for email {original_email} in company {employee.company_id}")

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
        related_user=employee.name,
        company_id=employee.company_id
    )

    return employee