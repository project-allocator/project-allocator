"""create config table

Revision ID: 39ab8c5ca99f
Revises: 89adfce2b3a3
Create Date: 2023-12-21 19:53:10.572582

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel
from datetime import datetime


# revision identifiers, used by Alembic.
revision = "39ab8c5ca99f"
down_revision = "89adfce2b3a3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    table = op.create_table(
        "config",
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("key", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("value", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.PrimaryKeyConstraint("key"),
    )

    # Insert default config values as part of migration
    # to make sure these entries are always present.
    timestamp = datetime.now().isoformat()
    op.bulk_insert(
        table,
        [
            # These uses are made admins on signup.
            {
                "key": "admin_emails",
                "value": '["rbc@ic.ac.uk"]',
                "created_at": timestamp,
                "updated_at": timestamp,
            },
            # Maximum number of students allocated per project.
            {
                "key": "max_allocations",
                "value": "5",
                "created_at": timestamp,
                "updated_at": timestamp,
            },
            # Maximum number of students allocated per student.
            {
                "key": "max_shortlists",
                "value": "5",
                "created_at": timestamp,
                "updated_at": timestamp,
            },
            {
                "key": "proposals_shutdown",
                "value": "false",
                "created_at": timestamp,
                "updated_at": timestamp,
            },
            {
                "key": "shortlists_shutdown",
                "value": "false",
                "created_at": timestamp,
                "updated_at": timestamp,
            },
            {
                "key": "undos_shutdown",
                "value": "false",
                "created_at": timestamp,
                "updated_at": timestamp,
            },
        ],
    )


def downgrade() -> None:
    op.drop_table("config")
