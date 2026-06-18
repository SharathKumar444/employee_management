from datetime import datetime, timedelta

from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.models.employee_model import Employee
from app.models.role_request_model import RoleRequest
from app.models.user_activity_model import UserActivity


def get_dashboard_analytics(db: Session, company_id: str):
    today_start = datetime.utcnow().replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    tomorrow_start = today_start + timedelta(days=1)

    total_employees = (
        db.query(Employee)
        .filter(Employee.company_id == company_id)
        .count()
    )

    active_employees = (
        db.query(Employee)
        .filter(
            Employee.company_id == company_id,
            Employee.status == 'Active'
        )
        .count()
    )

    total_departments = (
        db.query(Employee.department)
        .filter(Employee.company_id == company_id)
        .distinct()
        .count()
    )

    pending_requests = (
        db.query(RoleRequest)
        .filter(
            RoleRequest.company_id == company_id,
            RoleRequest.status == 'Pending'
        )
        .count()
    )

    active_sessions = (
        db.query(UserActivity)
        .filter(
            UserActivity.company_id == company_id,
            UserActivity.login_time != None,
            UserActivity.logout_time == None,
        )
        .count()
    )

    new_devices_today = (
        db.query(UserActivity)
        .filter(
            UserActivity.company_id == company_id,
            UserActivity.login_time >= today_start,
            UserActivity.login_time < tomorrow_start,
            or_(
                UserActivity.is_new_device == True,
                UserActivity.is_new_ip == True,
            ),
        )
        .count()
    )

    department_distribution = (
        db.query(
            Employee.department,
            func.count(Employee.id)
        )
        .filter(Employee.company_id == company_id)
        .group_by(Employee.department)
        .all()
    )

    role_distribution = (
        db.query(
            Employee.designation,
            func.count(Employee.id)
        )
        .filter(Employee.company_id == company_id)
        .group_by(Employee.designation)
        .all()
    )

    status_distribution = (
        db.query(
            Employee.status,
            func.count(Employee.id)
        )
        .filter(Employee.company_id == company_id)
        .group_by(Employee.status)
        .all()
    )

    return {
        'totalEmployees': total_employees,
        'activeEmployees': active_employees,
        'totalDepartments': total_departments,
        'pendingRequests': pending_requests,
        'activeSessions': active_sessions,
        'newDevicesToday': new_devices_today,
        'departmentDistribution': department_distribution,
        'roleDistribution': role_distribution,
        'statusDistribution': status_distribution,
    }
