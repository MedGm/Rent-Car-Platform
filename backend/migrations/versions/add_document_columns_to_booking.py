"""Add document URL columns to booking

Revision ID: a3f8d1e2b4c5
Revises: 6c9d24a09857
Create Date: 2025-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a3f8d1e2b4c5'
down_revision = '91751e59cce8'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('bookings', sa.Column('cin_recto', sa.String(length=500), nullable=True))
    op.add_column('bookings', sa.Column('cin_verso', sa.String(length=500), nullable=True))
    op.add_column('bookings', sa.Column('license_recto', sa.String(length=500), nullable=True))
    op.add_column('bookings', sa.Column('license_verso', sa.String(length=500), nullable=True))


def downgrade():
    op.drop_column('bookings', 'license_verso')
    op.drop_column('bookings', 'license_recto')
    op.drop_column('bookings', 'cin_verso')
    op.drop_column('bookings', 'cin_recto')
