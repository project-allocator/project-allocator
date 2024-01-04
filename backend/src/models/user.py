from typing import Optional
from sqlmodel import Field, Relationship, SQLModel
import ulid

from ..mixins.timestamp import TimestampMixin


class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    name: str
    role: str  # admin, staff, or student


class User(TimestampMixin, UserBase, table=True):
    __tablename__ = "user"

    id: Optional[str] = Field(
        primary_key=True,
        max_length=26,
        default_factory=lambda: str(ulid.new()),
    )

    # Specify cascade options using 'sa_relationship_kwargs'
    # as these tables should be deleted when user gets deleted.
    allocation: Optional["Allocation"] = Relationship(
        back_populates="allocatee",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    proposals: list["Proposal"] = Relationship(
        back_populates="proposer",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    shortlists: list["Shortlist"] = Relationship(
        back_populates="shortlister",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    notifications: list["Notification"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class UserRead(UserBase):
    id: str


class UserReadWithAllocation(UserRead):
    allocation: Optional["AllocationRead"]


# We can only update user role.
# The field is left optional to preserve the semantics of partial updates.
class UserUpdate(SQLModel):
    role: Optional[str] = None


# Import dependant Pydantic models at the end of the module
# to prevent circular import errors.
from .allocation import Allocation, AllocationRead
from .proposal import Proposal
from .shortlist import Shortlist
from .notification import Notification
