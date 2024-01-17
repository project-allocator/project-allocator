from typing import Any, Optional

import ulid
from sqlalchemy import JSON, Column
from sqlmodel import Field, Relationship, SQLModel

from ..mixins.timestamp import TimestampMixin


class ProjectBase(SQLModel):
    title: str
    description: str


class Project(TimestampMixin, ProjectBase, table=True):
    __tablename__ = "project"

    id: Optional[str] = Field(
        primary_key=True,
        max_length=26,
        default_factory=lambda: str(ulid.new()),
    )

    # True if admin has approved proposal.
    # None means admin has not made any response yet.
    approved: Optional[bool] = None

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

    # TODO: Should not be included in create or update model
    approved: Optional[bool]


class ProjectReadWithDetails(ProjectRead):
    details: list["ProjectDetailReadWithTemplate"]  # include template


class ProjectReadWithProposal(ProjectRead):
    proposal: "ProposalRead"


class ProjectReadWithAllocations(ProjectRead):
    allocations: list["AllocationRead"]


class ProjectCreate(ProjectBase):
    pass


class ProjectCreateWithDetails(ProjectCreate):
    details: list["ProjectDetailCreate"]


class ProjectUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    details: list["ProjectDetail"] = []


class ProjectUpdateWithDetails(ProjectUpdate):
    details: list["ProjectDetailUpdate"] = []


class ProjectDetailBase(SQLModel):
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
    template_id: str = Field(
        primary_key=True,
        foreign_key="project_detail_template.id",
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
    type: str
    required: bool
    options: list[str] = Field(sa_column=Column(JSON), default=[])

    # Used by the frontend to describe the detail.
    title: str
    description: str
    message: str  # error message


class ProjectDetailTemplate(TimestampMixin, ProjectDetailTemplateBase, table=True):
    __tablename__ = "project_detail_template"

    id: Optional[str] = Field(
        primary_key=True,
        max_length=26,
        default_factory=lambda: str(ulid.new()),
    )


class ProjectDetailTemplateRead(ProjectDetailTemplateBase):
    id: str


class ProjectDetailTemplateCreate(ProjectDetailTemplateBase):
    pass


# Type is excluded as it should not be changed.
class ProjectDetailTemplateUpdate(ProjectDetailTemplateBase):
    type: Optional[str] = None
    required: Optional[bool] = None
    options: Optional[list[str]] = None

    title: Optional[str] = None
    description: Optional[str] = None
    message: Optional[str] = None


from .allocation import Allocation, AllocationRead
from .proposal import Proposal, ProposalRead
from .shortlist import Shortlist
