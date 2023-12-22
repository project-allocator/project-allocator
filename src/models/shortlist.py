from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel

from ..mixins.timestamp import TimestampMixin

if TYPE_CHECKING:
    from .user import User
    from .project import Project


class Shortlist(TimestampMixin, SQLModel, table=True):
    __tablename__ = "shortlist"

    # Student's preference for the shortlisted project
    # where preference of 0 has the highest preference.
    preference: int

    shortlister_id: Optional[str] = Field(
        primary_key=True,
        foreign_key="user.id",
        max_length=26,
        default=None,
    )
    shortlisted_project_id: Optional[str] = Field(
        primary_key=True,
        foreign_key="project.id",
        max_length=26,
        default=None,
    )
    shortlister: "User" = Relationship(back_populates="shortlists")
    shortlisted_project: "Project" = Relationship(back_populates="shortlists")
