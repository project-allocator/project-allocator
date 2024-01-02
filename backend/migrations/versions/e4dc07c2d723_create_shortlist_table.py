"""create shortlist table

Revision ID: e4dc07c2d723
Revises: 8e5c30c5e254
Create Date: 2023-12-21 19:52:58.613465

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision = "e4dc07c2d723"
down_revision = "8e5c30c5e254"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "shortlist",
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("preference", sa.Integer(), nullable=False),
        sa.Column("shortlister_id", sqlmodel.sql.sqltypes.AutoString(length=26), nullable=False),
        sa.Column("shortlisted_project_id", sqlmodel.sql.sqltypes.AutoString(length=26), nullable=False),
        sa.ForeignKeyConstraint(["shortlisted_project_id"], ["project.id"]),
        sa.ForeignKeyConstraint(["shortlister_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("shortlister_id", "shortlisted_project_id"),
        sa.UniqueConstraint("preference", "shortlister_id"),
    )


def downgrade() -> None:
    op.drop_table("shortlist")
