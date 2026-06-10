"""add reactivation columns and user deactivated_by
Revision ID: 20260610_0001
Revises: 
Create Date: 2026-06-10 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20260610_0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # add columns to reactivation_requests
    op.add_column('reactivation_requests', sa.Column('reason', sa.Text(), nullable=True))
    op.add_column('reactivation_requests', sa.Column('admin_reviewer', sa.String(), nullable=True))
    op.add_column('reactivation_requests', sa.Column('review_comment', sa.Text(), nullable=True))
    op.add_column('reactivation_requests', sa.Column('reviewed_at', sa.DateTime(), nullable=True))

    # add column to users
    op.add_column('users', sa.Column('deactivated_by', sa.String(), nullable=True))


def downgrade():
    # Note: SQLite has limited ALTER support. Downgrade will drop and recreate tables if needed.
    conn = op.get_bind()
    # reactivation_requests: recreate without added columns
    conn.execute('''
    CREATE TABLE IF NOT EXISTS _reactivation_requests_backup AS SELECT id, user_id, company_id, status, created_at FROM reactivation_requests;
    DROP TABLE reactivation_requests;
    CREATE TABLE reactivation_requests (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL,
      company_id VARCHAR NOT NULL,
      status VARCHAR,
      created_at DATETIME
    );
    INSERT INTO reactivation_requests (id, user_id, company_id, status, created_at) SELECT id, user_id, company_id, status, created_at FROM _reactivation_requests_backup;
    DROP TABLE _reactivation_requests_backup;
    ''')

    # users: recreate without deactivated_by
    conn.execute('''
    CREATE TABLE IF NOT EXISTS _users_backup AS SELECT id, name, email, password, role, company_id, is_active FROM users;
    DROP TABLE users;
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      name VARCHAR,
      email VARCHAR UNIQUE,
      password VARCHAR,
      role VARCHAR,
      company_id VARCHAR NOT NULL,
      is_active BOOLEAN
    );
    INSERT INTO users (id, name, email, password, role, company_id, is_active) SELECT id, name, email, password, role, company_id, is_active FROM _users_backup;
    DROP TABLE _users_backup;
    ''')
