# TODO: Create CLI for seeding the database
# https://typer.tiangolo.com/
import random
from typing import List
import typer
from rich import print
from rich.progress import track
from sqlmodel import SQLModel, Session

from .db import engine
from .models import Project, Shortlist, User
from .factories import ShortlistFactory, UserFactory, ProjectFactory

app = typer.Typer()


@app.callback()
def callback():
    pass


# TODO: Create all tables based on models
# TODO: Use alembic in the future
@app.command()
def create():
    print("❗[red]This command should not be run in production.")
    if not typer.confirm("Are you sure to create all tables in the database?"):
        return
    SQLModel.metadata.create_all(engine)
    print("✨[green]Successfully created all tables in the database.")


# TODO: Drop all tables based on models
# TODO: Use alembic in the future
@app.command()
def drop():
    print("❗[red]This command should not be run in production.")
    if not typer.confirm("Are you sure to delete all tables in the database?"):
        return
    SQLModel.metadata.drop_all(engine)
    print("✨[green]Successfully dropped all tables in the database.")


@app.command()
def reset():
    print("❗[red]This command should not be run in production.")
    if not typer.confirm("Are you sure to reset the database?"):
        return
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    print("✨[green]Successfully reset the database.")


@app.command()
def seed():
    print("❗[red]This command should not be run in production.")
    projects: List[Project] = []
    for _ in track(range(10), description="Seeding staff..."):
        # Nest session inside for loop  so the progress can be checked.
        with Session(engine) as session:
            staff: User = UserFactory.build()
            for _ in range(5):
                project = ProjectFactory.build()
                projects.append(project)
                staff.projects.append(project)
                session.add(project)
            session.add(staff)
            session.commit()
    for _ in track(range(200), description="Seeding students..."):
        # Nest session inside for loop so the progress can be checked.
        with Session(engine) as session:
            student: User = UserFactory.build()
            for project in random.sample(projects, 5):
                shortlist: Shortlist = ShortlistFactory.build()
                shortlist.user = student
                shortlist.project = project
                student.shortlists.append(shortlist)
                session.add(shortlist)
            session.add(student)
            session.commit()
    print("✨[green]Successfully seeded the database.")
