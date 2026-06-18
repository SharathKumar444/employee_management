"""Export controller for handling data exports in various formats"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user_model import User
from app.models.employee_model import Employee
from app.models.attendance_model import Attendance, Leave
from app.models.audit_log_model import AuditLog
from app.models.notification_model import Notification
from app.models.export_model import ExportHistory
from app.utils.export_utils import ExportGenerator
from sqlalchemy import func
import logging

logger = logging.getLogger(__name__)

# Data types that can be exported
EXPORT_TYPES = {
    'employees': 'Employee Records',
    'attendance': 'Attendance Records',
    'leaves': 'Leave Requests',
    'audit_logs': 'Audit Logs',
    'notifications': 'Notifications',
    'analytics': 'Analytics Summary',
}

# Supported export formats
EXPORT_FORMATS = ['csv', 'excel', 'pdf']


def admin_only(f):
    """Decorator to ensure only admins can export"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        current_user = kwargs.get('current_user')
        if not current_user or current_user.role != 'admin':
            return jsonify({'success': False, 'message': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function


class ExportController:
    """Controller for handling data exports"""

    @staticmethod
    def get_employee_data(db: Session, company_id: str) -> list:
        """Fetch employee data for export"""
        employees = db.query(Employee).filter_by(company_id=company_id).all()
        data = []
        for emp in employees:
            data.append({
                'ID': emp.id,
                'Name': emp.name,
                'Email': emp.email,
                'Department': emp.department,
                'Designation': emp.designation,
                'Status': emp.status,
                'Company ID': emp.company_id,
            })
        return data

    @staticmethod
    def get_attendance_data(
        db: Session,
        company_id: str,
        start_date: str = None,
        end_date: str = None,
        days: int = 30,
    ) -> list:
        """Fetch attendance data for export"""
        if start_date and end_date:
            try:
                start = datetime.fromisoformat(start_date)
                end = datetime.fromisoformat(end_date)
            except ValueError:
                start = datetime.utcnow() - timedelta(days=days)
                end = datetime.utcnow()

            attendance_records = db.query(Attendance).filter(
                Attendance.company_id == company_id,
                Attendance.check_in_time >= start,
                Attendance.check_in_time <= end,
            ).all()
        else:
            start = datetime.utcnow() - timedelta(days=days)
            attendance_records = db.query(Attendance).filter(
                Attendance.company_id == company_id,
                Attendance.check_in_time >= start,
            ).all()

        data = []
        for record in attendance_records:
            user = db.query(User).get(record.user_id)
            hours = record.working_hours if record.working_hours else 0
            data.append({
                'Date': record.check_in_time.date().isoformat() if record.check_in_time else '',
                'Employee': user.email if user else 'Unknown',
                'Check In': record.check_in_time.strftime('%H:%M:%S') if record.check_in_time else '',
                'Check Out': record.check_out_time.strftime('%H:%M:%S') if record.check_out_time else 'Not checked out',
                'Working Hours': f"{hours:.2f}",
                'Status': record.status,
            })
        return data

    @staticmethod
    def get_leave_data(
        db: Session,
        company_id: str,
        start_date: str = None,
        end_date: str = None,
    ) -> list:
        """Fetch leave request data for export"""
        query = db.query(Leave).filter_by(company_id=company_id)
        if start_date and end_date:
            try:
                start = datetime.fromisoformat(start_date).date()
                end = datetime.fromisoformat(end_date).date()
                query = query.filter(Leave.start_date >= start, Leave.end_date <= end)
            except ValueError:
                pass

        leaves = query.all()
        data = []
        for leave in leaves:
            user = db.query(User).get(leave.user_id)
            data.append({
                'ID': leave.id,
                'Employee': user.email if user else 'Unknown',
                'Leave Type': leave.leave_type,
                'Start Date': leave.start_date.isoformat() if leave.start_date else '',
                'End Date': leave.end_date.isoformat() if leave.end_date else '',
                'Reason': leave.reason or '',
                'Status': leave.status,
                'Applied On': leave.created_at.isoformat() if leave.created_at else '',
            })
        return data

    @staticmethod
    def get_audit_logs_data(
        db: Session,
        company_id: str,
        start_date: str = None,
        end_date: str = None,
        days: int = 90,
    ) -> list:
        """Fetch audit log data for export"""
        if start_date and end_date:
            try:
                start = datetime.fromisoformat(start_date)
                end = datetime.fromisoformat(end_date)
            except ValueError:
                start = datetime.utcnow() - timedelta(days=days)
                end = datetime.utcnow()

            audit_logs = db.query(AuditLog).filter(
                AuditLog.company_id == company_id,
                AuditLog.timestamp >= start,
                AuditLog.timestamp <= end,
            ).all()
        else:
            start = datetime.utcnow() - timedelta(days=days)
            audit_logs = db.query(AuditLog).filter(
                AuditLog.company_id == company_id,
                AuditLog.timestamp >= start,
            ).all()

        data = []
        for log in audit_logs:
            user = db.query(User).filter_by(email=log.performed_by).first()
            data.append({
                'Timestamp': log.timestamp.isoformat() if log.timestamp else '',
                'Performed By': log.performed_by or 'Unknown',
                'Action': log.action,
                'Target User': log.target_user or '',
                'Details': log.details or '',
            })
        return data

    @staticmethod
    def get_notifications_data(db: Session, company_id: str) -> list:
        """Fetch notifications data for export"""
        # Get all users in company for notifications
        company_users = db.query(User).filter_by(company_id=company_id).all()
        user_ids = [user.id for user in company_users]

        if not user_ids:
            return []

        notifications = db.query(Notification).filter(
            Notification.recipient_user_id.in_(user_ids)
        ).all()

        data = []
        for notif in notifications:
            recipient = db.query(User).get(notif.recipient_user_id)
            data.append({
                'Date': notif.created_at.isoformat() if notif.created_at else '',
                'Recipient': recipient.email if recipient else 'Unknown',
                'Type': notif.type,
                'Payload': notif.payload or '',
                'Read Status': 'Read' if notif.is_read else 'Unread',
            })
        return data

    @staticmethod
    def get_analytics_data(db: Session, company_id: str) -> list:
        """Generate analytics summary for export"""
        # Employee statistics
        total_employees = db.query(func.count(Employee.id)).filter_by(company_id=company_id).scalar() or 0
        active_employees = db.query(func.count(Employee.id)).filter_by(company_id=company_id, status='Active').scalar() or 0

        # Attendance statistics (last 30 days)
        start_date = datetime.utcnow() - timedelta(days=30)
        attendance_records = db.query(func.count(Attendance.id)).filter(
            Attendance.company_id == company_id,
            Attendance.check_in_time >= start_date
        ).scalar() or 0

        # Leave statistics
        pending_leaves = db.query(func.count(Leave.id)).filter_by(company_id=company_id, status='pending').scalar() or 0
        approved_leaves = db.query(func.count(Leave.id)).filter_by(company_id=company_id, status='approved').scalar() or 0
        rejected_leaves = db.query(func.count(Leave.id)).filter_by(company_id=company_id, status='rejected').scalar() or 0

        # Department distribution
        departments = db.query(func.count(func.distinct(Employee.department))).filter_by(company_id=company_id).scalar() or 0

        data = [
            {'Metric': 'Total Employees', 'Value': total_employees},
            {'Metric': 'Active Employees', 'Value': active_employees},
            {'Metric': 'Inactive Employees', 'Value': total_employees - active_employees},
            {'Metric': 'Attendance Records (30 days)', 'Value': attendance_records},
            {'Metric': 'Pending Leave Requests', 'Value': pending_leaves},
            {'Metric': 'Approved Leaves', 'Value': approved_leaves},
            {'Metric': 'Rejected Leaves', 'Value': rejected_leaves},
            {'Metric': 'Total Departments', 'Value': departments},
            {'Metric': 'Export Generated At', 'Value': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')},
        ]
        return data

    @staticmethod
    def get_export_history(db: Session, company_id: str, limit: int = 100):
        """Fetch export history for a company"""
        history = db.query(ExportHistory).filter_by(
            company_id=company_id
        ).order_by(ExportHistory.created_at.desc()).limit(limit).all()

        return [record.to_dict() for record in history]

    @staticmethod
    def export_data(
        db: Session,
        data_type: str,
        export_format: str,
        company_id: str,
        current_user,
        start_date: str = None,
        end_date: str = None,
        export_reason: str = None,
    ):
        """
        Generate and return an export file

        Args:
            db: Database session
            data_type: Type of data to export
            export_format: Format for export (csv, excel, pdf)
            company_id: Company ID for scoping data
            current_user: Current user object
            export_reason: Optional reason for export

        Returns:
            Tuple of (file_bytes, filename)
        """
        # Validate inputs
        if data_type not in EXPORT_TYPES:
            return None, f"Invalid data type: {data_type}"

        if export_format not in EXPORT_FORMATS:
            return None, f"Invalid format: {export_format}"

        # Get data based on type
        try:
            if data_type == 'employees':
                data = ExportController.get_employee_data(db, company_id)
            elif data_type == 'attendance':
                data = ExportController.get_attendance_data(
                    db, company_id, start_date, end_date
                )
            elif data_type == 'leaves':
                data = ExportController.get_leave_data(
                    db, company_id, start_date, end_date
                )
            elif data_type == 'audit_logs':
                data = ExportController.get_audit_logs_data(
                    db, company_id, start_date, end_date
                )
            elif data_type == 'notifications':
                data = ExportController.get_notifications_data(db, company_id)
            elif data_type == 'analytics':
                data = ExportController.get_analytics_data(db, company_id)
            else:
                return None, "Unknown data type"

            # Generate file
            generator = ExportGenerator()

            # If there is no data, produce a small CSV indicating no data (avoid 400)
            if not data:
                file_bytes = generator.generate_csv([{"Info": "No data available to export"}])
                filename = generator.get_filename(data_type, export_format)
                # record export history with zero records
                export_record = ExportHistory(
                    company_id=company_id,
                    exported_by_id=current_user.id,
                    exported_by_email=current_user.email,
                    data_type=data_type,
                    export_format=export_format,
                    record_count=0,
                    file_name=filename,
                    export_reason=export_reason
                )
                db.add(export_record)
                db.commit()
                return file_bytes, filename

            try:
                if export_format == 'csv':
                    file_bytes = generator.generate_csv(data)
                elif export_format == 'excel':
                    file_bytes = generator.generate_excel(
                        data,
                        title=EXPORT_TYPES[data_type],
                        sheet_name=data_type.replace('_', ' ').title()
                    )
                elif export_format == 'pdf':
                    try:
                        file_bytes = generator.generate_pdf(
                            data,
                            title=EXPORT_TYPES[data_type]
                        )
                    except ImportError:
                        # fallback to excel if reportlab missing
                        file_bytes = generator.generate_excel(
                            data,
                            title=EXPORT_TYPES[data_type],
                            sheet_name=data_type.replace('_', ' ').title()
                        )
            except ImportError as ie:
                return None, str(ie)

            # Record in export history
            filename = generator.get_filename(data_type, export_format)
            export_record = ExportHistory(
                company_id=company_id,
                exported_by_id=current_user.id,
                exported_by_email=current_user.email,
                data_type=data_type,
                export_format=export_format,
                record_count=len(data),
                file_name=filename,
                export_reason=export_reason
            )
            db.add(export_record)
            db.commit()

            logger.info(
                f"Export created: {filename} by {current_user.email} "
                f"for company {company_id} ({len(data)} records)"
            )

            return file_bytes, filename

        except Exception as e:
            logger.error(f"Error generating export: {str(e)}")
            return None, f"Error generating export: {str(e)}"


def export_employees(company_id: int, current_user, export_format: str):
    """Export employee records"""
    file_bytes, result = ExportController.export_data(
        'employees', export_format, company_id, current_user
    )
    return file_bytes, result


def export_attendance(company_id: int, current_user, export_format: str):
    """Export attendance records"""
    file_bytes, result = ExportController.export_data(
        'attendance', export_format, company_id, current_user
    )
    return file_bytes, result


def export_leaves(company_id: int, current_user, export_format: str):
    """Export leave requests"""
    file_bytes, result = ExportController.export_data(
        'leaves', export_format, company_id, current_user
    )
    return file_bytes, result


def export_audit_logs(company_id: int, current_user, export_format: str):
    """Export audit logs"""
    file_bytes, result = ExportController.export_data(
        'audit_logs', export_format, company_id, current_user
    )
    return file_bytes, result


def export_notifications(company_id: int, current_user, export_format: str):
    """Export notifications"""
    file_bytes, result = ExportController.export_data(
        'notifications', export_format, company_id, current_user
    )
    return file_bytes, result


def export_analytics(company_id: int, current_user, export_format: str):
    """Export analytics summary"""
    file_bytes, result = ExportController.export_data(
        'analytics', export_format, company_id, current_user
    )
    return file_bytes, result
