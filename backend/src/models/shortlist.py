from typing import TYPE_CHECKING
from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

from ..mixins.timestamp import TimestampMixin

if TYPE_CHECKING:
    from .user import User
    from .project import Project


class Shortlist(TimestampMixin, SQLModel, table=True):
    __tablename__ = "shortlist"

    # Preference cannot overlap for the same shortlister.
    __table_args__ = (UniqueConstraint("preference", "shortlister_id"),)

    # Student's preference for the shortlisted project
    # where preference of 0 has the highest preference.
    preference: int

    shortlister_id: str = Field(
        primary_key=True,
        foreign_key="user.id",
        max_length=26,
    )
    shortlisted_project_id: str = Field(
        primary_key=True,
        foreign_key="project.id",
        max_length=26,
    )
    shortlister: "User" = Relationship(back_populates="shortlists")
    shortlisted_project: "Project" = Relationship(back_populates="shortlists")
