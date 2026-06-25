import os
import sqlite3

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.config.database import Base, engine, SessionLocal, DATABASE_PATH
from app.models.employee_model import Employee
from app.models.role_request_model import RoleRequest
from app.models.audit_log_model import AuditLog
from app.models.user_model import User
from app.models.user_activity_model import UserActivity
from app.models.invitation_model import Invitation
from app.models.attendance_model import Attendance, Leave
from app.models.export_model import ExportHistory
from app.models.reinstatement_model import ReinstallmentRequest
from app.models.user_session_model import UserSession

from app.routes.employee_routes import router as employee_router
from app.routes.role_request_routes import router as role_request_router
from app.routes.audit_routes import router as audit_router
from app.routes.analytics_routes import router as analytics_router
from app.routes.auth_routes import router as auth_router
from app.routes.activity_routes import router as activity_router
from app.routes.invitation_routes import router as invitation_router
from app.routes.member_routes import router as member_router
from app.routes.reactivation_routes import router as reactivation_router
from app.routes.notification_routes import router as notification_router
from app.routes.attendance_routes import router as attendance_router
from app.routes.attendance_access_routes import router as attendance_access_router
from app.routes.leave_routes import router as leave_router
from app.routes.export_routes import router as export_router
from app.routes.suspension_routes import router as suspension_router
from app.routes.session_routes import router as session_router


def ensure_invitation_schema():
    db_path = DATABASE_PATH

    if not os.path.exists(db_path):
        return

    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(invitations)")
        columns = [row[1] for row in cursor.fetchall()]

        if 'admin_email' not in columns:
            cursor.execute(
                "ALTER TABLE invitations ADD COLUMN admin_email TEXT"
            )

        if 'created_at' not in columns:
            cursor.execute(
                "ALTER TABLE invitations ADD COLUMN created_at DATETIME"
            )

        if 'expires_at' not in columns:
            cursor.execute(
                "ALTER TABLE invitations ADD COLUMN expires_at DATETIME"
            )

        conn.commit()


def ensure_user_schema():
    db_path = DATABASE_PATH

    if not os.path.exists(db_path):
        return

    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in cursor.fetchall()]

        if 'password' not in columns:
            cursor.execute(
                "ALTER TABLE users ADD COLUMN password TEXT DEFAULT 'default_password'"
            )

        if 'last_login' not in columns:
            cursor.execute(
                "ALTER TABLE users ADD COLUMN last_login DATETIME"
            )

        if 'last_logout' not in columns:
            cursor.execute(
                "ALTER TABLE users ADD COLUMN last_logout DATETIME"
            )

        if 'browser_info' not in columns:
            cursor.execute(
                "ALTER TABLE users ADD COLUMN browser_info TEXT"
            )

        if 'ip_address' not in columns:
            cursor.execute(
                "ALTER TABLE users ADD COLUMN ip_address TEXT"
            )

        if 'deactivated_at' not in columns:
            cursor.execute(
                "ALTER TABLE users ADD COLUMN deactivated_at DATETIME"
            )

        if 'deactivation_reason' not in columns:
            cursor.execute(
                "ALTER TABLE users ADD COLUMN deactivation_reason TEXT"
            )

        conn.commit()


def ensure_employee_schema():
    db_path = DATABASE_PATH

    if not os.path.exists(db_path):
        return

    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(employees)")
        columns = [row[1] for row in cursor.fetchall()]

        if 'phone' not in columns:
            cursor.execute("ALTER TABLE employees ADD COLUMN phone TEXT")

        if 'address' not in columns:
            cursor.execute("ALTER TABLE employees ADD COLUMN address TEXT")

        if 'date_of_joining' not in columns:
            cursor.execute("ALTER TABLE employees ADD COLUMN date_of_joining TEXT")

        if 'profile_picture' not in columns:
            cursor.execute("ALTER TABLE employees ADD COLUMN profile_picture TEXT")

        if 'employee_id' not in columns:
            cursor.execute("ALTER TABLE employees ADD COLUMN employee_id TEXT")

        conn.commit()


def ensure_audit_schema():
    db_path = DATABASE_PATH

    if not os.path.exists(db_path):
        return

    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(audit_logs)")
        columns = [row[1] for row in cursor.fetchall()]

        if 'details' not in columns:
            cursor.execute(
                "ALTER TABLE audit_logs ADD COLUMN details TEXT"
            )

        conn.commit()


Base.metadata.create_all(bind=engine)
ensure_invitation_schema()
ensure_user_schema()
ensure_employee_schema()
ensure_audit_schema()

app = FastAPI(
    title="Enterprise Employee Management System",
    version="1.0.0"
)
# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.exception_handler(HTTPException)
def http_exception_handler(request: Request, exc: HTTPException):
    code = None
    if exc.headers and exc.headers.get("X-Error-Code"):
        code = exc.headers.get("X-Error-Code")
    elif exc.status_code == 403 and str(exc.detail).lower() == "account suspended":
        code = "ACCOUNT_SUSPENDED"
    elif exc.status_code == 403 and str(exc.detail).lower() == "admin access required":
        code = "ADMIN_ACCESS_REQUIRED"
    else:
        code = f"HTTP_{exc.status_code}"

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": str(exc.detail),
            "detail": str(exc.detail),
            "code": code,
        },
    )


@app.exception_handler(RequestValidationError)
def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": "Validation error",
            "detail": exc.errors(),
            "code": "VALIDATION_ERROR",
        },
    )


# =========================
# ROUTES
# =========================
app.include_router(employee_router)
app.include_router(role_request_router)
app.include_router(audit_router)
app.include_router(analytics_router)
app.include_router(auth_router)
app.include_router(activity_router)
app.include_router(invitation_router)
app.include_router(member_router)
app.include_router(reactivation_router)
app.include_router(notification_router)
app.include_router(attendance_router)
app.include_router(attendance_access_router)
app.include_router(leave_router)
app.include_router(export_router)
app.include_router(suspension_router)
app.include_router(session_router)

# =========================
# DATABASE SESSION
# =========================
db: Session = SessionLocal()

existing_employees = db.query(Employee).count()


# =========================
# SAFE SEEDING (FIXED)
# =========================
if existing_employees < 1:

    db.query(Employee).delete()

    employees = [
        Employee(
            name="Emma Wilson",
            department="Engineering",
            designation="Backend Developer",
            email="emma@example.com",
            status="Active",
            company_id="COMP001"
        ),
        Employee(
            name="David Miller",
            department="Finance",
            designation="Financial Analyst",
            email="david@example.com",
            status="Active",
            company_id="COMP001"
        ),
        Employee(
            name="Sophia Brown",
            department="HR",
            designation="HR Executive",
            email="sophia@example.com",
            status="Inactive",
            company_id="COMP002"
        ),
        Employee(
            name="James Anderson",
            department="Engineering",
            designation="Frontend Developer",
            email="james@example.com",
            status="Active",
            company_id="COMP002"
        ),
        Employee(
            name="Olivia Taylor",
            department="Marketing",
            designation="Marketing Specialist",
            email="olivia@example.com",
            status="Active",
            company_id="COMP003"
        ),
        Employee(
            name="Daniel Thomas",
            department="Sales",
            designation="Sales Executive",
            email="daniel@example.com",
            status="Inactive",
            company_id="COMP001"
        ),
        Employee(
            name="Ava Martinez",
            department="Support",
            designation="Support Engineer",
            email="ava@example.com",
            status="Active",
            company_id="COMP002"
        ),
        Employee(
            name="William Harris",
            department="Engineering",
            designation="DevOps Engineer",
            email="william@example.com",
            status="Active",
            company_id="COMP003"
        ),
        Employee(
            name="Mia Clark",
            department="Finance",
            designation="Accountant",
            email="mia@example.com",
            status="Active",
            company_id="COMP001"
        ),
        Employee(
            name="Benjamin Lewis",
            department="Operations",
            designation="Operations Manager",
            email="benjamin@example.com",
            status="Inactive",
            company_id="COMP002"
        ),
        Employee(
            name="Charlotte Walker",
            department="Engineering",
            designation="UI/UX Designer",
            email="charlotte@example.com",
            status="Active",
            company_id="COMP003"
        ),
        Employee(
            name="Elijah Hall",
            department="Marketing",
            designation="SEO Specialist",
            email="elijah@example.com",
            status="Active",
            company_id="COMP001"
        ),
        Employee(
            name="Amelia Allen",
            department="HR",
            designation="Recruiter",
            email="amelia@example.com",
            status="Active",
            company_id="COMP002"
        ),
        Employee(
            name="Lucas Young",
            department="Engineering",
            designation="Full Stack Developer",
            email="lucas@example.com",
            status="Inactive",
            company_id="COMP003"
        ),
        Employee(
            name="Harper King",
            department="Support",
            designation="Technical Support",
            email="harper@example.com",
            status="Active",
            company_id="COMP001"
        )
    ]

    db.add_all(employees)
    db.commit()

# Seed a default admin user if no users exist (helps local development)
from app.models.user_model import User
try:
    existing_users = db.query(User).count()
except Exception as e:
    print("Skipping admin seed due to DB schema/state issue:", e)
    existing_users = None

if existing_users is not None and existing_users < 1:
    admin_user = User(
        name="Admin User",
        email="admin@example.com",
        password="admin",
        role="admin",
        company_id="COMP001",
        is_active=True
    )
    db.add(admin_user)
    db.commit()
    print("Seeded default admin: admin@example.com / password: admin")

db.close()


# =========================
# ROOT
# =========================
@app.get("/")
def home():
    return {
        "message": "Enterprise Employee Management System Backend Running"
    }