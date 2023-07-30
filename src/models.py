from typing import List, Optional
from datetime import datetime
from pydantic import create_model
from sqlalchemy import Column, JSON, ForeignKey
from sqlmodel import Field, Relationship, SQLModel

from .config import config

################################################################################
#                                 User Models                                  #
################################################################################


class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    name: str
    role: str

    # True if user has accepted allocation
    accepted: Optional[bool]


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    created_at: datetime = Field(default=datetime.utcnow())
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    proposed: List["Project"] = Relationship(
        back_populates="proposer",
        sa_relationship_kwargs={"foreign_keys": "[Project.proposer_id]"},
    )
    # Set user_alter to True to avoid circular dependency error when dropping table
    # https://dev.to/whchi/disable-sqlmodel-foreign-key-constraint-55kp
    # fmt: off
    allocated_id: Optional[int] = Field(
        default=None,
        sa_column=Column(ForeignKey("project.id", use_alter=True, name="fk_allocation")),
    )
    allocated: "Project" = Relationship(
        back_populates="allocatees",
        sa_relationship_kwargs={"foreign_keys": "[User.allocated_id]"},
    )
    shortlists: List["Shortlist"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    notifications: List["Notification"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class UserRead(UserBase):
    id: int


class UserUpdate(UserBase):
    pass


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
        for detail in config["projects"]["details"]
    },
)


class Project(ProjectBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    created_at: datetime = Field(default=datetime.utcnow())
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Set user_alter to True to avoid circular dependency error when dropping table
    # https://dev.to/whchi/disable-sqlmodel-foreign-key-constraint-55kp
    proposer_id: Optional[int] = Field(
        default=None,
        sa_column=Column(ForeignKey("user.id", use_alter=True, name="fk_proposal")),
    )
    proposer: User = Relationship(
        back_populates="proposed",
        sa_relationship_kwargs={"foreign_keys": "[Project.proposer_id]"},
    )
    allocatees: List["User"] = Relationship(
        back_populates="allocated",
        sa_relationship_kwargs={"foreign_keys": "[User.allocated_id]"},
    )
    shortlists: List["Shortlist"] = Relationship(
        back_populates="project",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class ProjectRead(ProjectBase):
    id: int


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    pass


################################################################################
#                             Shortlist Models                                 #
################################################################################


class Shortlist(SQLModel, table=True):
    preference: int

    created_at: datetime = Field(default=datetime.utcnow())
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    user_id: Optional[int] = Field(
        default=None,
        foreign_key="user.id",
        primary_key=True,
    )
    project_id: Optional[int] = Field(
        default=None,
        foreign_key="project.id",
        primary_key=True,
    )
    user: User = Relationship(back_populates="shortlists")
    project: Project = Relationship(back_populates="shortlists")


################################################################################
#                                Status Models                                 #
################################################################################


class Status(SQLModel, table=True):
    key: str = Field(primary_key=True)
    value: str

    created_at: datetime = Field(default=datetime.utcnow())
    updated_at: datetime = Field(default_factory=datetime.utcnow)


################################################################################
#                             Notification Models                              #
################################################################################


class NotificationBase(SQLModel):
    title: str
    description: str
    seen: bool = False


class Notification(NotificationBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    created_at: datetime = Field(default=datetime.utcnow())
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    user: User = Relationship(back_populates="notifications")


class NotificationRead(NotificationBase):
    id: int
