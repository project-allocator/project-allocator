"""create status table

Revision ID: 39ab8c5ca99f
Revises: 89adfce2b3a3
Create Date: 2023-12-21 19:53:10.572582

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision = "39ab8c5ca99f"
down_revision = "89adfce2b3a3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "status",
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("key", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("value", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.PrimaryKeyConstraint("key"),
    )


def downgrade() -> None:
    op.drop_table("status")
