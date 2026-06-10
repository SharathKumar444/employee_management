import os
import sqlite3

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config.database import Base, engine, SessionLocal
from app.models.employee_model import Employee
from app.models.role_request_model import RoleRequest
from app.models.audit_log_model import AuditLog
from app.models.user_model import User
from app.models.invitation_model import Invitation

from app.routes.employee_routes import router as employee_router
from app.routes.role_request_routes import router as role_request_router
from app.routes.audit_routes import router as audit_router
from app.routes.analytics_routes import router as analytics_router
from app.routes.auth_routes import router as auth_router
from app.routes.invitation_routes import router as invitation_router
from app.routes.member_routes import router as member_router
from app.routes.reactivation_routes import router as reactivation_router
from app.routes.notification_routes import router as notification_router


def ensure_invitation_schema():
    db_path = os.path.join(
        os.path.dirname(__file__),
        '..',
        'employee.db'
    )
    db_path = os.path.normpath(db_path)

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
    db_path = os.path.join(
        os.path.dirname(__file__),
        '..',
        'employee.db'
    )
    db_path = os.path.normpath(db_path)

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

        conn.commit()


Base.metadata.create_all(bind=engine)
ensure_invitation_schema()
ensure_user_schema()

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


# =========================
# ROUTES
# =========================
app.include_router(employee_router)
app.include_router(role_request_router)
app.include_router(audit_router)
app.include_router(analytics_router)
app.include_router(auth_router)
app.include_router(invitation_router)
app.include_router(member_router)
app.include_router(reactivation_router)
app.include_router(notification_router)

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


db.close()


# =========================
# ROOT
# =========================
@app.get("/")
def home():
    return {
        "message": "Enterprise Employee Management System Backend Running"
    }