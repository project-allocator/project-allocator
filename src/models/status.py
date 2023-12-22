from sqlmodel import Field, SQLModel

from ..mixins.timestamp import TimestampMixin


class Status(TimestampMixin, SQLModel, table=True):
    __tablename__ = "status"

    key: str = Field(primary_key=True)
    value: str
