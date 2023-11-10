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

    # True if user has accepted allocation.
    # None means user has not made any response.
    accepted: Optional[bool] = Field(default=None)


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    created_at: datetime = Field(
        nullable=False,
        default_factory=datetime.utcnow,
    )
    updated_at: datetime = Field(
        nullable=False,
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )

    # Specify foreign keys using 'sa_relationship_kwargs'
    # as there are multiple relationships mapping from Project to User model.
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
    # Specify foreign keys using 'sa_relationship_kwargs'
    # as there are multiple relationships mapping from Project to User model.
    allocated: "Project" = Relationship(
        back_populates="allocatees",
        sa_relationship_kwargs={"foreign_keys": "[User.allocated_id]"},
    )
    # Specify cascade options using 'sa_relationship_kwargs'
    # as shortlists and notifications should be deleted when user gets deleted.
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


# We can only update user role.
# The field is left optional to preserve the semantics of partial updates.
class UserUpdate(SQLModel):
    role: Optional[str] = None


# Schema used for importing data from JSON.
# Administrators can specify the allocated project using the existing project IDs.
class UserImport(UserBase):
    id: int
    allocated_id: Optional[int]


################################################################################
#                               Project Models                                 #
################################################################################


# Define project details as custom fields according to config.yaml
# https://stackoverflow.com/questions/74186458/how-to-dynamically-define-an-sqlmodel-class
project_details = {
    detail["name"]: {
        "textfield": (str, ...),
        "textarea": (str, ...),
        "number": (int, ...),
        "slider": (int, ...),
        "date": (datetime, ...),
        "time": (datetime, ...),
        "switch": (bool, ...),
        "select": (str, ...),
        "radio": (str, ...),
        # Use JSON format to store a list of strings.
        # PostgreSQL's list type is not supported by Pydantic.
        "checkbox": (List[str], Field(sa_column=Column(JSON))),
    }[detail["type"]]
    # Project details are found in config.yaml under 'projects' > 'details'
    for detail in config["projects"]["details"]
}

# Create ProjectBase Pydantic model dynamically using custom_fields
ProjectBase = create_model(
    "ProjectBase",
    __base__=SQLModel,
    title=(str, ...),
    description=(str, ...),
    # Use JSON format to store a list of strings.
    # PostgreSQL's list type is not supported by Pydantic.
    categories=(List[str], Field(sa_column=Column(JSON))),
    # True if admin has approved proposal.
    # None means admin has not made any response yet.
    approved=(Optional[bool], Field(default=None)),
    **project_details,
)


class Project(ProjectBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    created_at: datetime = Field(
        nullable=False,
        default_factory=datetime.utcnow,
    )
    updated_at: datetime = Field(
        nullable=False,
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )

    # Set user_alter to True to avoid circular dependency error when dropping table
    # https://dev.to/whchi/disable-sqlmodel-foreign-key-constraint-55kp
    proposer_id: Optional[int] = Field(
        default=None,
        sa_column=Column(ForeignKey("user.id", use_alter=True, name="fk_proposal")),
    )
    # Specify foreign keys using 'sa_relationship_kwargs'
    # as there are multiple relationships mapping from User to Project model.
    proposer: User = Relationship(
        back_populates="proposed",
        sa_relationship_kwargs={"foreign_keys": "[Project.proposer_id]"},
    )
    # Specify foreign keys using 'sa_relationship_kwargs'
    # as there are multiple relationships mapping from User to Project model.
    allocatees: List["User"] = Relationship(
        back_populates="allocated",
        sa_relationship_kwargs={"foreign_keys": "[User.allocated_id]"},
    )
    # Specify cascade options using 'sa_relationship_kwargs'
    # as shortlists and notifications should be deleted when user gets deleted.
    shortlists: List["Shortlist"] = Relationship(
        back_populates="project",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class ProjectRead(ProjectBase):
    id: int


class ProjectCreate(ProjectBase):
    pass


# Create ProjectUpdate Pydantic model dynamically using custom_fields
# We wrap all field types with optional so that we can partially update projects.
ProjectUpdate = create_model(
    "ProjectUpdate",
    __base__=SQLModel,
    title=(Optional[str], ...),
    description=(Optional[str], ...),
    categories=(Optional[List[str]], Field(sa_column=Column(JSON))),
    approved=(Optional[bool], Field(default=None)),
    **{
        name: (
            # We make the field type optional.
            Optional[meta[0]],
            # Need to provide default value None while preserving sa_column argument for Field().
            # fmt: off
            (lambda field: setattr(field, "default", None))(Field() if meta[1] == ... else meta[1]),
        )
        for (name, meta) in project_details.items()
    },
)


# Schema used for importing data from JSON.
# Administrators can now specify the proposer using the existing user IDs.
class ProjectImport(ProjectBase):
    id: int
    proposer_id: int


################################################################################
#                             Shortlist Models                                 #
################################################################################


class Shortlist(SQLModel, table=True):
    # Student's preference for the shortlisted project.
    # Preference of 0 has the highest preference.
    preference: int

    created_at: datetime = Field(
        nullable=False,
        default_factory=datetime.utcnow,
    )
    updated_at: datetime = Field(
        nullable=False,
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )

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
    value: bool

    created_at: datetime = Field(default=datetime.utcnow())
    updated_at: datetime = Field(default_factory=datetime.utcnow)


################################################################################
#                             Notification Models                              #
################################################################################


class NotificationBase(SQLModel):
    title: str
    description: str
    seen: bool = Field(default=False)


class Notification(NotificationBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    created_at: datetime = Field(
        nullable=False,
        default_factory=datetime.utcnow,
    )
    updated_at: datetime = Field(
        nullable=False,
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )

    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    user: User = Relationship(back_populates="notifications")


class NotificationRead(NotificationBase):
    id: int


class NotificationUpdate(SQLModel):
    # TODO: This id is used by mark_notifications endpoint.
    id: int
    seen: Optional[bool] = None
