"""create notifications table
Revision ID: 20260610_0002
Revises: 20260610_0001
Create Date: 2026-06-10 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20260610_0002'
down_revision = '20260610_0001'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('recipient_user_id', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('payload', sa.Text(), nullable=True),
        sa.Column('is_read', sa.Boolean(), server_default=sa.text('0')),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )


def downgrade():
    op.drop_table('notifications')
