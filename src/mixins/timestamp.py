from datetime import datetime
from sqlmodel import Field, SQLModel


class TimestampMixin(SQLModel):
    created_at: datetime = Field(
        nullable=False,
        default_factory=datetime.utcnow,
    )
    updated_at: datetime = Field(
        nullable=False,
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )
