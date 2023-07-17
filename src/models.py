from typing import List, Optional
from datetime import datetime
from sqlmodel import Field, Relationship, SQLModel

################################################################################
#                                 User Models                                  #
################################################################################


class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    name: str
    role: str


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default=datetime.utcnow())
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    proposed: List["Project"] = Relationship(back_populates="proposer")
    shortlists: List["Shortlist"] = Relationship(back_populates="user")


class UserRead(UserBase):
    id: int


################################################################################
#                               Project Models                                 #
################################################################################


class ProjectBase(SQLModel):
    title: str
    description: str

    user_id: Optional[int] = Field(default=None, foreign_key="user.id")


class Project(ProjectBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default=datetime.utcnow())
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    proposer: User = Relationship(back_populates="proposed")
    details: List["ProjectDetail"] = Relationship(back_populates="project")
    shortlists: List["Shortlist"] = Relationship(back_populates="project")


class ProjectCreate(ProjectBase):
    pass


class ProjectRead(ProjectBase):
    id: int


class ProjectUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None


################################################################################
#                            Project Detail Models                             #
################################################################################


class ProjectDetailBase(SQLModel):
    key: str
    value: str

    project_id: Optional[int] = Field(default=None, foreign_key="project.id")


class ProjectDetail(ProjectDetailBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default=datetime.utcnow())
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    project: Project = Relationship(back_populates="details")


class ProjectDetailCreate(ProjectDetailBase):
    pass


class ProjectDetailRead(ProjectDetailBase):
    id: int


class ProjectDetailUpdate(SQLModel):
    key: Optional[str] = None
    value: Optional[str] = None


################################################################################
#                             Shortlist Models                                 #
################################################################################


class ShortlistBase(SQLModel):
    preference: int


class Shortlist(ShortlistBase, table=True):
    created_at: datetime = Field(default=datetime.utcnow())
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    user_id: Optional[int] = Field(
        default=None, foreign_key="user.id", primary_key=True
    )
    project_id: Optional[int] = Field(
        default=None, foreign_key="project.id", primary_key=True
    )
    user: User = Relationship(back_populates="shortlists")
    project: Project = Relationship(back_populates="shortlists")
