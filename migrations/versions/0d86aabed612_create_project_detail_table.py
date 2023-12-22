"""create project detail table

Revision ID: 0d86aabed612
Revises: 48b9b8fe4c7e
Create Date: 2023-12-21 19:52:34.252800

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision = "0d86aabed612"
down_revision = "48b9b8fe4c7e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "project_detail",
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("key", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("type", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("value", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("project_id", sqlmodel.sql.sqltypes.AutoString(length=26), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["project.id"]),
        sa.PrimaryKeyConstraint("key", "project_id"),
    )


def downgrade() -> None:
    op.drop_table("project_detail")
