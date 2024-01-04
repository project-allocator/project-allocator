from typing import Any
from sqlmodel import Field, SQLModel

from ..mixins.timestamp import TimestampMixin


class ConfigBase(SQLModel):
    key: str = Field(primary_key=True)
    value: Any  # any type to allow input to be parsed


# No need to inherit ConfigBase as all the fields are overridden.
class Config(TimestampMixin, ConfigBase, table=True):
    __tablename__ = "config"

    value: str  # must be stringified in database


class ConfigRead(ConfigBase):
    pass


class ConfigUpdate(SQLModel):
    value: Any = None  # any type to allow input to be parsed
