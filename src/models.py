from typing import List, Optional
from datetime import datetime
from sqlmodel import Field, Relationship, SQLModel


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str
    role: str

    projects: List["Project"] = Relationship(back_populates="user")
    shortlists: List["Shortlist"] = Relationship(back_populates="user")

    created_at: datetime = Field(default=datetime.utcnow())
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str

    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    user: User = Relationship(back_populates="projects")
    shortlists: List["Shortlist"] = Relationship(back_populates="project")

    created_at: datetime = Field(default=datetime.utcnow())
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# TODO: Many to many with extra fields
# https://sqlmodel.tiangolo.com/tutorial/many-to-many/link-with-extra-fields
class Shortlist(SQLModel, table=True):
    preference: int

    user_id: Optional[int] = Field(
        default=None, foreign_key="user.id", primary_key=True
    )
    project_id: Optional[int] = Field(
        default=None, foreign_key="project.id", primary_key=True
    )
    user: User = Relationship(back_populates="shortlists")
    project: Project = Relationship(back_populates="shortlists")

    created_at: datetime = Field(default=datetime.utcnow())
    updated_at: datetime = Field(default_factory=datetime.utcnow)
