from enum import Enum
import random
from typing import Annotated
import typer
from rich import print
from rich.progress import track
from sqlmodel import SQLModel, Session, select

from src.factories.project import ProjectDetailConfigFactory
from src.models.allocation import Allocation
from src.models.proposal import Proposal

from .db import engine
from .models import User, Shortlist, Status
from .factories import UserFactory, ProjectFactory, NotificationFactory


app = typer.Typer()


@app.callback()
def callback():
    pass


@app.command()
def seed(yes: Annotated[bool, typer.Option(help="Skip confirmation.")] = False):
    if not yes:
        print("❗[red]This command should not be run in production.")
        if not typer.confirm("Are you sure to seed the database?"):
            return

    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        session.add(Status(key="proposals.shutdown", value="false"))
        session.add(Status(key="shortlists.shutdown", value="false"))
        session.add(Status(key="undos.shutdown", value="false"))

        configs = ProjectDetailConfigFactory.build_batch(10)
        session.add_all(configs)

        users = []
        projects = []

        for _ in track(range(10), description="Seeding staff..."):
            staff = UserFactory.build(role="staff")
            session.add(staff)
            users.append(staff)

            # Propose 5 new projects for each staff.
            for _ in range(5):
                # Passing configs as details__configs to generate project details.
                project = ProjectFactory.build(details__configs=configs)
                projects.append(project)
                session.add(project)

                proposal = Proposal(proposer=staff, proposed_project=project)
                session.add(proposal)

        for _ in track(range(200), description="Seeding students..."):
            student = UserFactory.build(role="student")
            session.add(student)
            users.append(student)

            # Shortlist 5 random projects for each student.
            random_projects = random.sample(projects, 5)
            for i, project in enumerate(random_projects):
                shortlist = Shortlist(preference=i, shortlister=student, shortlisted_project=project)
                session.add(shortlist)

            # Allocate 1 random shortlisted project for each student.
            random_shortlist = random.choice(student.shortlists)
            allocation = Allocation(allocatee=student, allocated_project=random_shortlist.shortlisted_project)
            session.add(allocation)

        for user in track(users, description="Seeding notifications..."):
            for _ in range(5):
                notification = NotificationFactory.build(user=user)
                session.add(notification)

        session.commit()

    print("✨[green]Successfully seeded the database.")


class Role(str, Enum):
    admin = "admin"
    staff = "staff"
    student = "student"


@app.command()
def change_role(
    email: Annotated[str, typer.Argument(help="The email of the user")],
    new_role: Annotated[Role, typer.Argument(help="The new role of the user")],
):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).one_or_none()
        if not user:
            print(f"❌[red]User with the given email {email} does not exist!")
            raise typer.Exit()
        user.role = new_role
        session.add(user)
        session.commit()

    print(f"✨[green]Successfully updated the user {email} to role '{new_role.value}'.")
