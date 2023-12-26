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

    # True if user has accepted allocation.
    # None means user has not made any response.
    # TODO:
    # This field has been temporarily added to UserRead
    # to support /projects/{project_id}/read_allocatees endpoint.
    accepted: Optional[bool] = None


# We can only update user role.
# The field is left optional to preserve the semantics of partial updates.
class UserUpdate(SQLModel):
    role: Optional[str] = None
