"""create proposal table

Revision ID: 86e089995401
Revises: 0d86aabed612
Create Date: 2023-12-21 19:52:41.071698

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision = "86e089995401"
down_revision = "0d86aabed612"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "proposal",
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("proposer_id", sqlmodel.sql.sqltypes.AutoString(length=26), nullable=False),
        sa.Column("proposed_project_id", sqlmodel.sql.sqltypes.AutoString(length=26), nullable=False),
        sa.ForeignKeyConstraint(["proposed_project_id"], ["project.id"]),
        sa.ForeignKeyConstraint(["proposer_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("proposed_project_id"),
    )


def downgrade() -> None:
    op.drop_table("proposal")
