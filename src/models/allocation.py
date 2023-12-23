from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel

from ..mixins.timestamp import TimestampMixin

if TYPE_CHECKING:
    from .user import User
    from .project import Project


class Allocation(TimestampMixin, SQLModel, table=True):
    __tablename__ = "allocation"

    # True if user has accepted allocation.
    # None means user has not made any response.
    accepted: Optional[bool] = None

    allocatee_id: str = Field(
        primary_key=True,
        foreign_key="user.id",
        max_length=26,
    )
    allocated_project_id: str = Field(
        foreign_key="project.id",
        max_length=26,
    )

    allocatee: "User" = Relationship(back_populates="allocation")
    allocated_project: "Project" = Relationship(back_populates="allocations")
