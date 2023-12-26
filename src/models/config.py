from typing import Any
from sqlmodel import Field, SQLModel

from ..mixins.timestamp import TimestampMixin


class ConfigBase(SQLModel):
    key: str
    value: Any  # any type to allow input to be parsed


# No need to inherit ConfigBase as all the fields are overridden.
class Config(TimestampMixin, SQLModel, table=True):
    __tablename__ = "config"

    key: str = Field(primary_key=True)
    value: str  # must be stringified in database


class ConfigRead(ConfigBase):
    pass
