from typing import Optional, Any, TYPE_CHECKING
from sqlalchemy import Column, JSON
from sqlmodel import Field, Relationship, SQLModel
import ulid

from ..mixins.timestamp import TimestampMixin

if TYPE_CHECKING:
    from .allocation import Allocation
    from .proposal import Proposal
    from .shortlist import Shortlist


class ProjectBase(SQLModel):
    title: str
    description: str

    # True if admin has approved proposal.
    # None means admin has not made any response yet.
    approved: Optional[bool] = None


class Project(TimestampMixin, ProjectBase, table=True):
    __tablename__ = "project"

    id: Optional[str] = Field(
        primary_key=True,
        max_length=26,
        default_factory=lambda: str(ulid.new()),
    )

    # Specify cascade options using 'sa_relationship_kwargs'
    # as these tables should be deleted when user gets deleted.
    details: list["ProjectDetail"] = Relationship(
        back_populates="project",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    allocations: list["Allocation"] = Relationship(
        back_populates="allocated_project",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    proposal: "Proposal" = Relationship(
        back_populates="proposed_project",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    shortlists: list["Shortlist"] = Relationship(
        back_populates="shortlisted_project",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class ProjectRead(ProjectBase):
    id: str


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    details: list["ProjectDetail"] = []

    # True if admin has approved proposal.
    # None means admin has not made any response yet.
    approved: Optional[bool] = None


class ProjectDetailBase(SQLModel):
    key: str
    type: str
    value: Any  # any type to allow input to be parsed


class ProjectDetail(TimestampMixin, SQLModel, table=True):
    __tablename__ = "project_detail"

    key: str = Field(primary_key=True)
    type: str
    value: str  # must be stringified in database

    project_id: str = Field(
        primary_key=True,
        foreign_key="project.id",
        max_length=26,
        default=None,
    )
    project: "Project" = Relationship(back_populates="details")


class ProjectDetailRead(ProjectDetailBase):
    pass


class ProjectDetailCreate(ProjectDetailBase):
    pass


class ProjectDetailUpdate(ProjectDetailBase):
    pass


class ProjectReadWithDetails(ProjectRead):
    details: list["ProjectDetailRead"] = []


class ProjectCreateWithDetails(ProjectCreate):
    details: list["ProjectDetailCreate"] = []


class ProjectUpdateWithDetails(ProjectUpdate):
    details: list["ProjectDetailUpdate"] = []


class ProjectDetailTemplateBase(SQLModel):
    key: str
    type: str
    required: bool
    options: list[str] = []

    # Used by the frontend to describe the detail.
    title: str
    description: str
    message: str  # error message


class ProjectDetailTemplate(TimestampMixin, ProjectDetailTemplateBase, table=True):
    __tablename__ = "project_detail_template"

    key: str = Field(primary_key=True)
    options: list[str] = Field(sa_column=Column(JSON), default=[])


class ProjectDetailTemplateRead(ProjectDetailTemplateBase):
    pass
