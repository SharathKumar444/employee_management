"""create user sessions table
Revision ID: 20260625_0001
Revises: 20260620_0002
Create Date: 2026-06-25 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20260625_0001'
down_revision = '20260620_0002'
branch_labels = None
depends_on = None


def upgrade():
    # Create user_sessions table
    op.create_table(
        'user_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False, index=True),
        sa.Column('user_email', sa.String(), nullable=False),
        sa.Column('company_id', sa.String(), nullable=False, index=True),
        sa.Column('session_token', sa.String(), nullable=False, unique=True, index=True),
        sa.Column('browser_info', sa.String(), nullable=True),
        sa.Column('os_info', sa.String(), nullable=True),
        sa.Column('device_type', sa.String(), nullable=True),
        sa.Column('ip_address', sa.String(), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('login_time', sa.DateTime(), nullable=False),
        sa.Column('last_activity_time', sa.DateTime(), nullable=False),
        sa.Column('logout_time', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='active'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1', index=True),
        sa.Column('is_forced_logout', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('is_revoked', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('revoked_by', sa.String(), nullable=True),
        sa.Column('revoked_at', sa.DateTime(), nullable=True),
        sa.Column('revocation_reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('user_sessions')
