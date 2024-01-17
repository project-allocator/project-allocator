from typing import Optional

from sqlmodel import Field, Relationship, SQLModel

from ..mixins.timestamp import TimestampMixin


class AllocationBase(SQLModel):
    # True if user has accepted allocation.
    # None means user has not made any response.
    accepted: Optional[bool] = None

    # True if admin has blocked users from accepting/rejecting allocation.
    locked: bool = False


# Although allocation is one-to-many relationship,
# we use an intermediate table so that it can be easily extended to many-to-many relationship.
# This also helps prevent the issues of direct circular references between User and Project models.
class Allocation(TimestampMixin, AllocationBase, table=True):
    __tablename__ = "allocation"

    allocatee_id: str = Field(
        primary_key=True,
        foreign_key="user.id",
        max_length=26,
        default=None,
    )
    allocated_project_id: str = Field(
        foreign_key="project.id",
        max_length=26,
        default=None,
    )
    allocatee: "User" = Relationship(back_populates="allocation")
    allocated_project: "Project" = Relationship(back_populates="allocations")


class AllocationRead(AllocationBase):
    allocatee: "UserRead"
    allocated_project: "ProjectRead"
    pass


from .project import Project, ProjectRead
from .user import User, UserRead
