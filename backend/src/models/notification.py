from typing import Optional
from sqlmodel import Field, Relationship, SQLModel
from datetime import datetime
import ulid

from ..mixins.timestamp import TimestampMixin


class NotificationBase(SQLModel):
    title: str
    description: str

    read_at: Optional[datetime] = None


class Notification(TimestampMixin, NotificationBase, table=True):
    __tablename__ = "notification"

    id: Optional[str] = Field(
        primary_key=True,
        max_length=26,
        default_factory=lambda: str(ulid.new()),
    )

    user_id: str = Field(
        foreign_key="user.id",
        max_length=26,
        default=None,
    )
    user: "User" = Relationship(back_populates="notifications")


class NotificationRead(NotificationBase):
    id: str


class NotificationCreate(NotificationBase):
    pass


from .user import User
