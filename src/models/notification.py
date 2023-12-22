from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel
from datetime import datetime
import ulid

from ..mixins.timestamp import TimestampMixin

if TYPE_CHECKING:
    from .user import User


class NotificationBase(SQLModel):
    title: str
    description: str
    read_at: Optional[datetime] = Field(nullable=True, default=None)


class Notification(TimestampMixin, NotificationBase, table=True):
    __tablename__ = "notification"

    id: Optional[str] = Field(
        primary_key=True,
        max_length=26,
        default_factory=lambda: str(ulid.new()),
    )

    user_id: Optional[str] = Field(
        foreign_key="user.id",
        max_length=26,
        default=None,
    )
    user: "User" = Relationship(back_populates="notifications")


class NotificationRead(NotificationBase):
    id: str


class NotificationUpdate(SQLModel):
    # TODO: id field is update model is usually not required
    # but this one is used by mark_notifications endpoint.
    id: str
    read_at: Optional[datetime]
