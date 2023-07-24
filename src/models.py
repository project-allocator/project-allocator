# TODO: Split models in separate files
# SQLModel suffers from circular import issues, which does not work well with polyfactory.
# In the future, consider using SQLAlchemy and pydantic individually to solve this issue.
# https://sqlmodel.tiangolo.com/tutorial/code-structure/
# https://fastapi.tiangolo.com/tutorial/sql-databases/
from typing import List, Optional
from datetime import datetime
from pydantic import create_model
from sqlmodel import JSON, Column, Field, Relationship, SQLModel

from .config import config

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

    proposed: List["Project"] = Relationship(
        back_populates="proposer",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    shortlists: List["Shortlist"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class UserRead(UserBase):
    id: int


################################################################################
#                               Project Models                                 #
################################################################################


# Create ProjectBase Pydantic model dynamically according to the YAML config
# https://stackoverflow.com/questions/74186458/how-to-dynamically-define-an-sqlmodel-class
ProjectBase = create_model(
    "ProjectBase",
    __base__=SQLModel,
    title=(str, ...),
    description=(str, ...),
    categories=(List[str], Field(sa_column=Column(JSON))),
    **{
        detail["name"]: {
            "textfield": (str, ...),
            "textarea": (str, ...),
            "number": (int, ...),
            "slider": (int, ...),
            "date": (datetime, ...),
            "time": (datetime, ...),
            "switch": (bool, ...),
            "select": (str, ...),
            "checkbox": (List[str], Field(sa_column=Column(JSON))),
            "radio": (str, ...),
        }[detail["type"]]
        for detail in config["project"]["details"]
    },
)


class Project(ProjectBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default=datetime.utcnow())
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    proposer_id: Optional[int] = Field(default=None, foreign_key="user.id")
    proposer: User = Relationship(back_populates="proposed")
    shortlists: List["Shortlist"] = Relationship(
        back_populates="project",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class ProjectCreate(ProjectBase):
    pass


class ProjectRead(ProjectBase):
    id: int


class ProjectUpdate(ProjectBase):
    pass


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
