from typing import Optional, Any
from sqlalchemy import Column, JSON
from sqlmodel import Field, Relationship, SQLModel
import ulid

from ..mixins.timestamp import TimestampMixin


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


class ProjectReadWithDetails(ProjectRead):
    details: list["ProjectDetailReadWithTemplate"] = []  # include template


class ProjectReadWithProposal(ProjectRead):
    proposal: "ProposalRead"


class ProjectReadWithAllocations(ProjectRead):
    allocations: list["AllocationRead"] = []


class ProjectCreate(ProjectBase):
    pass


class ProjectCreateWithDetails(ProjectCreate):
    details: list["ProjectDetailCreate"] = []


class ProjectUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    details: list["ProjectDetail"] = []

    # True if admin has approved proposal.
    # None means admin has not made any response yet.
    approved: Optional[bool] = None


class ProjectUpdateWithDetails(ProjectUpdate):
    details: list["ProjectDetailUpdate"] = []


class ProjectDetailBase(SQLModel):
    key: str = Field(
        primary_key=True,
        foreign_key="project_detail_template.key",
    )
    value: Any  # any type to allow input to be parsed


class ProjectDetail(TimestampMixin, ProjectDetailBase, table=True):
    __tablename__ = "project_detail"

    value: str  # must be stringified in database

    project_id: str = Field(
        primary_key=True,
        foreign_key="project.id",
        max_length=26,
        default=None,
    )
    project: "Project" = Relationship(back_populates="details")

    template: "ProjectDetailTemplate" = Relationship()


class ProjectDetailRead(ProjectDetailBase):
    pass


class ProjectDetailReadWithTemplate(ProjectDetailRead):
    template: "ProjectDetailTemplateRead"


class ProjectDetailCreate(ProjectDetailBase):
    pass


class ProjectDetailUpdate(ProjectDetailBase):
    pass


class ProjectDetailTemplateBase(SQLModel):
    key: str = Field(primary_key=True)
    type: str
    required: bool
    options: list[str] = Field(sa_column=Column(JSON), default=[])

    # Used by the frontend to describe the detail.
    title: str
    description: str
    message: str  # error message


class ProjectDetailTemplate(TimestampMixin, ProjectDetailTemplateBase, table=True):
    __tablename__ = "project_detail_template"


class ProjectDetailTemplateRead(ProjectDetailTemplateBase):
    pass


from .proposal import Proposal, ProposalRead
from .allocation import Allocation, AllocationRead
from .shortlist import Shortlist
