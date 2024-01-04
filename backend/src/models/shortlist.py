from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

from ..mixins.timestamp import TimestampMixin


class ShortlistBase(SQLModel):
    # Student's preference for the shortlisted project
    # where preference of 0 has the highest preference.
    preference: int


class Shortlist(TimestampMixin, ShortlistBase, table=True):
    __tablename__ = "shortlist"

    # Preference cannot overlap for the same shortlister.
    __table_args__ = (UniqueConstraint("preference", "shortlister_id"),)

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


from .user import User
from .project import Project
