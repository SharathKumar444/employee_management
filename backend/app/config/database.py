from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# =========================
# DATABASE CONFIGURATION
# =========================

DATABASE_URL = "sqlite:///./employee.db"

# =========================
# ENGINE
# =========================
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # required only for SQLite
)

# =========================
# SESSION LOCAL
# =========================
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# =========================
# BASE MODEL CLASS
# =========================
Base = declarative_base()

# =========================
# FASTAPI DB DEPENDENCY
# =========================
def get_db():
    """
    Dependency that provides DB session per request
    and ensures proper closing after request ends.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()