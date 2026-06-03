from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from app.config.database import (
    Base,
    engine,
    SessionLocal
)

from app.models.employee_model import Employee
from app.models.role_request_model import RoleRequest

from app.routes.employee_routes import (
    router as employee_router
)

from app.routes.role_request_routes import (
    router as role_request_router
)

# Create database tables
Base.metadata.create_all(bind=engine)

# FastAPI App
app = FastAPI(
    title="Enterprise Employee Management System",
    version="1.0.0"
)

# CORS
origins = [
    "http://localhost:5173",
    "http://localhost:5174"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Include Routes
app.include_router(employee_router)
app.include_router(role_request_router)

# Seed Employee Data
db: Session = SessionLocal()

existingEmployees = db.query(Employee).count()

if existingEmployees < 15:

    # Delete old employees
    db.query(Employee).delete()

    employees = [

        Employee(
            name="Emma Wilson",
            department="Engineering",
            designation="Backend Developer",
            email="emma@example.com",
            status="Active"
        ),

        Employee(
            name="David Miller",
            department="Finance",
            designation="Financial Analyst",
            email="david@example.com",
            status="Active"
        ),

        Employee(
            name="Sophia Brown",
            department="HR",
            designation="HR Executive",
            email="sophia@example.com",
            status="Inactive"
        ),

        Employee(
            name="James Anderson",
            department="Engineering",
            designation="Frontend Developer",
            email="james@example.com",
            status="Active"
        ),

        Employee(
            name="Olivia Taylor",
            department="Marketing",
            designation="Marketing Specialist",
            email="olivia@example.com",
            status="Active"
        ),

        Employee(
            name="Daniel Thomas",
            department="Sales",
            designation="Sales Executive",
            email="daniel@example.com",
            status="Inactive"
        ),

        Employee(
            name="Ava Martinez",
            department="Support",
            designation="Support Engineer",
            email="ava@example.com",
            status="Active"
        ),

        Employee(
            name="William Harris",
            department="Engineering",
            designation="DevOps Engineer",
            email="william@example.com",
            status="Active"
        ),

        Employee(
            name="Mia Clark",
            department="Finance",
            designation="Accountant",
            email="mia@example.com",
            status="Active"
        ),

        Employee(
            name="Benjamin Lewis",
            department="Operations",
            designation="Operations Manager",
            email="benjamin@example.com",
            status="Inactive"
        ),

        Employee(
            name="Charlotte Walker",
            department="Engineering",
            designation="UI/UX Designer",
            email="charlotte@example.com",
            status="Active"
        ),

        Employee(
            name="Elijah Hall",
            department="Marketing",
            designation="SEO Specialist",
            email="elijah@example.com",
            status="Active"
        ),

        Employee(
            name="Amelia Allen",
            department="HR",
            designation="Recruiter",
            email="amelia@example.com",
            status="Active"
        ),

        Employee(
            name="Lucas Young",
            department="Engineering",
            designation="Full Stack Developer",
            email="lucas@example.com",
            status="Inactive"
        ),

        Employee(
            name="Harper King",
            department="Support",
            designation="Technical Support",
            email="harper@example.com",
            status="Active"
        )
    ]

    db.add_all(employees)
    db.commit()

db.close()

# Root Route
@app.get("/")
def home():
    return {
        "message": "Enterprise Employee Management System Backend Running"
    }