"""create project detail table

Revision ID: 0d86aabed612
Revises: 7a959237829d
Create Date: 2023-12-21 19:52:34.252800

"""
import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "0d86aabed612"
down_revision = "7a959237829d"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "project_detail",
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("value", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("project_id", sqlmodel.sql.sqltypes.AutoString(length=26), nullable=False),
        sa.Column("template_id", sqlmodel.sql.sqltypes.AutoString(length=26), nullable=False),
        # fmt: off
        sa.ForeignKeyConstraint(["project_id"], ["project.id"], ondelete="CASCADE", onupdate="CASCADE"),
        sa.ForeignKeyConstraint(["template_id"], ["project_detail_template.id"], ondelete="CASCADE", onupdate="CASCADE"),
        sa.PrimaryKeyConstraint("project_id", "template_id"),
    )


def downgrade() -> None:
    op.drop_table("project_detail")
