from sqlmodel import Field, Relationship, SQLModel

from ..mixins.timestamp import TimestampMixin


class ProposalBase(SQLModel):
    pass


# Although proposal is one-to-many relationship,
# we use an intermediate table so that it can be easily extended to many-to-many relationship.
# This also helps prevent the issues of direct circular references between User and Project models.
class Proposal(TimestampMixin, ProposalBase, table=True):
    __tablename__ = "proposal"

    proposer_id: str = Field(
        foreign_key="user.id",
        max_length=26,
    )
    proposed_project_id: str = Field(
        primary_key=True,
        foreign_key="project.id",
        max_length=26,
    )
    proposer: "User" = Relationship(back_populates="proposals")
    proposed_project: "Project" = Relationship(back_populates="proposal")


class ProposalRead(ProposalBase):
    proposer: "UserRead"
    proposed_project: "ProjectRead"


from .user import User, UserRead
from .project import Project, ProjectRead
