"""
Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}
"""

from alembic import op
import sqlalchemy as sa

${imports if imports}

# revision identifiers, used by Alembic.
revision = '${up_revision}'
down_revision = ${repr(down_revision)}
branch_labels = ${repr(branch_labels)}
depends_on = ${repr(depends_on)}


def upgrade():
${up_ops if up_ops else '    pass'}


def downgrade():
${down_ops if down_ops else '    pass'}
