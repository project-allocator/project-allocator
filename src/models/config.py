from sqlmodel import Field, SQLModel

from ..mixins.timestamp import TimestampMixin


class ConfigBase(SQLModel):
    key: str
    value: str


class Config(TimestampMixin, ConfigBase, table=True):
    __tablename__ = "config"

    key: str = Field(primary_key=True)


class ConfigRead(ConfigBase):
    pass
