from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel

from ..mixins.timestamp import TimestampMixin

if TYPE_CHECKING:
    from .user import User
    from .project import Project


class Proposal(TimestampMixin, SQLModel, table=True):
    __tablename__ = "proposal"

    proposer_id: str = Field(
        foreign_key="user.id",
        max_length=26,
    )
    proposed_project_id: str = Field(
        primary_key=True,
        foreign_key="project.id",
        max_length=26,
    )
    proposer: "User" = Relationship(back_populates="proposals")
    proposed_project: "Project" = Relationship(back_populates="proposal")
