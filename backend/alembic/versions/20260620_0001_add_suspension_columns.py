"""add user suspension columns
Revision ID: 20260620_0001
Revises: 20260618_0001
Create Date: 2026-06-20 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20260620_0001'
down_revision = '20260618_0001'
branch_labels = None
depends_on = None


def upgrade():
    # Add suspension columns to users table
    op.add_column('users', sa.Column('suspension_status', sa.String(), default='active'))
    op.add_column('users', sa.Column('suspended_by', sa.String(), nullable=True))
    op.add_column('users', sa.Column('suspended_at', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('suspension_reason', sa.Text(), nullable=True))


def downgrade():
    # Note: SQLite has limited ALTER support. Downgrade will drop and recreate tables if needed.
    conn = op.get_bind()
    conn.execute('''
    CREATE TABLE IF NOT EXISTS _users_backup AS SELECT 
        id, name, email, password, role, company_id, is_active, attendance_access,
        deactivated_by, deactivated_at, deactivation_reason, last_login, last_logout, browser_info, ip_address
    FROM users;
    DROP TABLE users;
    CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        name VARCHAR,
        email VARCHAR UNIQUE,
        password VARCHAR,
        role VARCHAR,
        company_id VARCHAR NOT NULL,
        is_active BOOLEAN,
        attendance_access BOOLEAN,
        deactivated_by VARCHAR,
        deactivated_at DATETIME,
        deactivation_reason TEXT,
        last_login DATETIME,
        last_logout DATETIME,
        browser_info TEXT,
        ip_address VARCHAR
    );
    INSERT INTO users SELECT * FROM _users_backup;
    DROP TABLE _users_backup;
    ''')
