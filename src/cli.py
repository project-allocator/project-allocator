from enum import Enum
import random
from typing import Annotated, List
import typer
from rich import print
from rich.progress import track
from sqlmodel import SQLModel, Session, select

from .db import engine
from .models import Project, Shortlist, Status, User
from .factories import UserFactory, ProjectFactory

app = typer.Typer()


@app.callback()
def callback():
    pass


@app.command()
def create(yes: Annotated[bool, typer.Option(help="Skip confirmation.")] = False):
    if not yes:
        print("❗[red]This command should not be run in production.")
        if not typer.confirm("Are you sure to create all tables in the database?"):
            return
    SQLModel.metadata.create_all(engine)
    print("✨[green]Successfully created all tables in the database.")


@app.command()
def drop(yes: Annotated[bool, typer.Option(help="Skip confirmation.")] = False):
    if not yes:
        print("❗[red]This command should not be run in production.")
        if not typer.confirm("Are you sure to delete all tables in the database?"):
            return
    SQLModel.metadata.drop_all(engine)
    print("✨[green]Successfully dropped all tables in the database.")


@app.command()
def reset(yes: Annotated[bool, typer.Option(help="Skip confirmation.")] = False):
    if not yes:
        print("❗[red]This command should not be run in production.")
        if not typer.confirm("Are you sure to reset the database?"):
            return
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    print("✨[green]Successfully reset the database.")


@app.command()
def seed(yes: Annotated[bool, typer.Option(help="Skip confirmation.")] = False):
    if not yes:
        print("❗[red]This command should not be run in production.")
        if not typer.confirm("Are you sure to seed the database?"):
            return
    projects: List[Project] = []
    for _ in track(range(10), description="Seeding staff..."):
        # We nest session inside for loop so the progress can be checked.
        with Session(engine) as session:
            staff: User = UserFactory.build()
            staff.role = "staff"
            for _ in range(5):
                project = ProjectFactory.build()
                projects.append(project)
                staff.proposed.append(project)
                session.add(project)
            session.add(staff)
            session.commit()
    for _ in track(range(200), description="Seeding students..."):
        # We nest session inside for loop so the progress can be checked.
        with Session(engine) as session:
            student: User = UserFactory.build()
            student.role = "student"
            for i, project in enumerate(random.sample(projects, 5)):
                shortlist = Shortlist(user=student, project=project, preference=i)
                session.add(shortlist)
                session.add(project)
            session.add(student)
            session.commit()
    print("Seeding status...")
    with Session(engine) as session:
        session.add(Status(key="proposals.shutdown", value=False))
        session.add(Status(key="shortlists.shutdown", value=False))
        session.add(Status(key="undos.shutdown", value=False))
        session.commit()
    print("✨[green]Successfully seeded the database.")


class Role(str, Enum):
    admin = "admin"
    staff = "staff"
    student = "student"


@app.command()
def role(
    email: Annotated[str, typer.Argument(help="The email of the user")],
    role: Annotated[Role, typer.Argument(help="The new role of the user")],
):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).one_or_none()
        if not user:
            print(f"❌[red]User with the given email {email} does not exist!")
            raise typer.Exit()
        user.role = role
        session.add(user)
        session.commit()
    print(f"✨[green]Successfully updated the user {email} to role '{role.value}'.")
