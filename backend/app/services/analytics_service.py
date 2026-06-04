from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.employee_model import Employee
from app.models.role_request_model import RoleRequest


def get_dashboard_analytics(db: Session):

    total_employees = db.query(Employee).count()

    active_employees = (
        db.query(Employee)
        .filter(Employee.status == "Active")
        .count()
    )

    total_departments = (
        db.query(Employee.department)
        .distinct()
        .count()
    )

    pending_requests = (
        db.query(RoleRequest)
        .filter(RoleRequest.status == "Pending")
        .count()
    )

    department_distribution = (
        db.query(
            Employee.department,
            func.count(Employee.id)
        )
        .group_by(Employee.department)
        .all()
    )

    role_distribution = (
        db.query(
            Employee.designation,
            func.count(Employee.id)
        )
        .group_by(Employee.designation)
        .all()
    )

    status_distribution = (
        db.query(
            Employee.status,
            func.count(Employee.id)
        )
        .group_by(Employee.status)
        .all()
    )

    return {
        "totalEmployees": total_employees,
        "activeEmployees": active_employees,
        "totalDepartments": total_departments,
        "pendingRequests": pending_requests,
        "departmentDistribution": department_distribution,
        "roleDistribution": role_distribution,
        "statusDistribution": status_distribution,
    }