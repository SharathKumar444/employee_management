"""create reinstatement requests table
Revision ID: 20260620_0002
Revises: 20260620_0001
Create Date: 2026-06-20 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20260620_0002'
down_revision = '20260620_0001'
branch_labels = None
depends_on = None


def upgrade():
    # Create reinstatement_requests table
    op.create_table(
        'reinstatement_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.String(), nullable=False),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('status', sa.String(), nullable=True, server_default='Pending'),
        sa.Column('admin_reviewer', sa.String(), nullable=True),
        sa.Column('review_comment', sa.Text(), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('reinstatement_requests')
