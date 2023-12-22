from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel
import ulid

from ..mixins.timestamp import TimestampMixin

if TYPE_CHECKING:
    from .allocation import Allocation
    from .proposal import Proposal
    from .shortlist import Shortlist
    from .notification import Notification


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
    allocation: "Allocation" = Relationship(
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


# We can only update user role.
# The field is left optional to preserve the semantics of partial updates.
class UserUpdate(SQLModel):
    role: Optional[str] = None


# Schema used for importing data from JSON.
# Administrators can specify the allocated project using the existing project IDs.
class UserImport(UserBase):
    id: str
    allocated_id: Optional[str]
