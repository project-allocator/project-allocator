"""create allocation table

Revision ID: 8e5c30c5e254
Revises: 86e089995401
Create Date: 2023-12-21 19:52:44.764155

"""
import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "8e5c30c5e254"
down_revision = "86e089995401"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "allocation",
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("accepted", sa.Boolean(), nullable=True),
        sa.Column("locked", sa.Boolean(), nullable=False),
        sa.Column("allocatee_id", sqlmodel.sql.sqltypes.AutoString(length=26), nullable=False),
        sa.Column("allocated_project_id", sqlmodel.sql.sqltypes.AutoString(length=26), nullable=False),
        sa.ForeignKeyConstraint(["allocated_project_id"], ["project.id"], ondelete="CASCADE", onupdate="CASCADE"),
        sa.ForeignKeyConstraint(["allocatee_id"], ["user.id"], ondelete="CASCADE", onupdate="CASCADE"),
        sa.PrimaryKeyConstraint("allocatee_id"),
    )


def downgrade() -> None:
    op.drop_table("allocation")
