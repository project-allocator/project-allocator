from typing import Any, Optional

from sqlmodel import Field, SQLModel

from ..mixins.timestamp import TimestampMixin


class ConfigBase(SQLModel):
    key: str = Field(primary_key=True)
    type: str
    value: Any  # any type to allow input to be parsed


# No need to inherit ConfigBase as all the fields are overridden.
class Config(TimestampMixin, ConfigBase, table=True):
    __tablename__ = "config"

    value: str  # must be stringified in database


class ConfigRead(ConfigBase):
    pass


# We can only update config value.
# This field is left optional to preserve the semantics of partial updates.
class ConfigUpdate(SQLModel):
    value: Optional[Any] = None  # any type to allow input to be parsed
