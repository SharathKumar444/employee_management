"""add attendance access to users
Revision ID: 20260611_0001
Revises: 20260610_0002
Create Date: 2026-06-11 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20260611_0001'
down_revision = '20260610_0002'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'users',
        sa.Column('attendance_access', sa.Boolean(), nullable=False, server_default=sa.false())
    )


def downgrade():
    conn = op.get_bind()
    conn.execute('''
    CREATE TABLE IF NOT EXISTS _users_backup AS SELECT id, name, email, password, role, company_id, is_active, deactivated_by FROM users;
    DROP TABLE users;
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      name VARCHAR,
      email VARCHAR UNIQUE,
      password VARCHAR,
      role VARCHAR,
      company_id VARCHAR NOT NULL,
      is_active BOOLEAN,
      deactivated_by VARCHAR
    );
    INSERT INTO users (id, name, email, password, role, company_id, is_active, deactivated_by) SELECT id, name, email, password, role, company_id, is_active, deactivated_by FROM _users_backup;
    DROP TABLE _users_backup;
    ''')
