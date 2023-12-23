from sqlmodel import Field, SQLModel

from ..mixins.timestamp import TimestampMixin


class Config(TimestampMixin, SQLModel, table=True):
    __tablename__ = "config"

    key: str = Field(primary_key=True)
    value: str
