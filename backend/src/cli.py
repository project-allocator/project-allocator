import random
from typing import Annotated

import typer
from rich import print
from rich.progress import track
from sqlmodel import Session

from .db import DATABASE_URL
from .factories import (
    NotificationFactory,
    ProjectDetailTemplateFactory,
    ProjectFactory,
    UserFactory,
)
from .models import Allocation, Proposal, Shortlist

app = typer.Typer()

db_app = typer.Typer()
app.add_typer(db_app, name="db")


@db_app.command()
def seed(yes: Annotated[bool, typer.Option(help="Skip confirmation.")] = False):
    if not yes:
        print("❗[red]This command should not be run in production.")
        if not typer.confirm("Are you sure to continue?"):
            return

    engine = create_engine(DATABASE_URL)
    with Session(engine) as session:
        templates = ProjectDetailTemplateFactory.build_batch(10)
        session.add_all(templates)

        users = []
        projects = []

        for _ in track(range(10), description="Seeding staff..."):
            staff = UserFactory.build(role="staff")
            session.add(staff)
            users.append(staff)

            # Propose 5 new projects for each staff.
            for _ in range(5):
                # Passing templates as details__templates to generate project details.
                project = ProjectFactory.build(details__templates=templates)
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
                shortlist = Shortlist(
                    preference=i, shortlister=student, shortlisted_project=project
                )
                session.add(shortlist)

            # Allocate 1 random shortlisted project for each student.
            random_shortlist = random.choice(student.shortlists)
            allocation = Allocation(
                allocatee=student,
                allocated_project=random_shortlist.shortlisted_project,
                accepted=random.choice([True, False, None]),
            )
            session.add(allocation)

        for user in track(users, description="Seeding notifications..."):
            for _ in range(5):
                notification = NotificationFactory.build(user=user)
                session.add(notification)

        session.commit()

    print("✨[green]Successfully seeded the database.")
