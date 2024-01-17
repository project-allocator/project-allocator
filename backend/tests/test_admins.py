import csv
import json
import random
from io import StringIO

from fastapi.testclient import TestClient
from sqlmodel import Session, delete, select
from src.factories import NotificationFactory, ProjectDetailTemplateFactory, ProjectFactory, UserFactory
from src.models import (
    Allocation,
    Config,
    Notification,
    Project,
    ProjectDetail,
    ProjectDetailTemplate,
    Proposal,
    Shortlist,
    User,
)


def test_check_missing_users(admin_client: TestClient):
    emails = [
        "alice@example.com",
        "bob@example.com",
        "charlie@example.com",
        "david@example.com",
    ]

    response = admin_client.post("/api/admins/missing-users", json=emails)
    data = response.json()
    assert response.status_code == 200

    assert len(data) == 1
    assert data[0] == "david@example.com"


def test_read_conflicting_projects(admin_client: TestClient, staff_user: User, session: Session):
    students = UserFactory.build_batch(50, role="student")
    projects = ProjectFactory.build_batch(10, approved=True)
    proposals = [Proposal(proposer=staff_user, proposed_project=project) for project in projects]
    allocations = [
        Allocation(
            allocatee=student,
            allocated_project=random.choice(projects),
            accepted=random.choice([True, False, None]),
        )
        for student in students
    ]
    session.add_all(students)
    session.add_all(projects)
    session.add_all(proposals)
    session.add_all(allocations)
    session.commit()

    # fmt: off
    conflicting_projects = [
        project for project in projects
        if not all([allocation.accepted for allocation in project.allocations])
    ]

    response = admin_client.get("/api/admins/conflicting-projects")
    data = response.json()
    assert response.status_code == 200

    assert len(data) == len(conflicting_projects)
    assert set([project["id"] for project in data]) == set([project.id for project in conflicting_projects])


def test_export_csv(admin_client: TestClient, session: Session):
    students = UserFactory.build_batch(50, role="student")
    staff = UserFactory.build_batch(2, role="admin") + UserFactory.build_batch(10, role="staff")
    templates = ProjectDetailTemplateFactory.build_batch(10)
    projects = ProjectFactory.build_batch(10, approved=True, details__templates=templates)
    proposals = [
        Proposal(
            proposer=random.choice(staff),
            proposed_project=project,
        )
        for project in projects
    ]
    allocations = [
        Allocation(
            allocatee=student,
            allocated_project=random.choice(projects),
            accepted=random.choice([True, False, None]),
        )
        for student in students
    ]

    session.add_all(students)
    session.add_all(staff)
    session.add_all(templates)
    session.add_all(projects)
    session.add_all(proposals)
    session.add_all(allocations)
    session.commit()

    # Test csv export.
    response = admin_client.get("/api/admins/export/csv")
    data = response.json()
    assert response.status_code == 200

    reader = csv.reader(StringIO(data))
    assert len(list(reader)) == len(projects) + 1  # 1 header line
    assert all(len(row) == (8 + len(templates)) for row in reader)  # 8 project/user fields


def test_export_import_json(admin_client: TestClient, session: Session):
    students = UserFactory.build_batch(50, role="student")
    staff = UserFactory.build_batch(2, role="admin") + UserFactory.build_batch(10, role="staff")
    templates = ProjectDetailTemplateFactory.build_batch(10)
    projects = ProjectFactory.build_batch(10, approved=True, details__templates=templates)
    allocations = [
        Allocation(
            allocatee=student,
            allocated_project=random.choice(projects),
            accepted=random.choice([True, False, None]),
        )
        for student in students
    ]
    proposals = [
        Proposal(
            proposer=random.choice(staff),
            proposed_project=project,
        )
        for project in projects
    ]
    shortlists = [
        Shortlist(
            shortlister=student,
            shortlisted_project=project,
            preference=preference,
        )
        for preference, project in enumerate(random.sample(projects, 5))
        for student in students
    ]
    notifications = [NotificationFactory.build_batch(5, user=user) for user in students + staff]
    notifications = sum(notifications, [])  # flatten list of lists
    configs = [Config(key="min-allocations", type="number", value="1")]  # new config

    session.add_all(students)
    session.add_all(staff)
    session.add_all(templates)
    session.add_all(projects)
    session.add_all(allocations)
    session.add_all(proposals)
    session.add_all(shortlists)
    session.add_all(notifications)
    session.add_all(configs)
    session.commit()

    # Export data as json.
    response = admin_client.get("/api/admins/export/json")
    data = json.loads(response.json())
    assert response.status_code == 200

    assert len(data["users"]) == len(students) + len(staff) + 3  # 3 default users
    assert len(data["projects"]) == len(projects)
    assert len(data["project_details"]) == len(projects) * len(templates)
    assert len(data["project_detail_templates"]) == len(templates)
    assert len(data["proposals"]) == len(projects)
    assert len(data["allocations"]) == len(allocations)
    assert len(data["shortlists"]) == len(shortlists)
    assert len(data["notifications"]) == len(notifications)
    assert len(data["configs"]) == len(configs) + 6  # 6 default configs

    session.exec(delete(User))
    session.exec(delete(Project))
    session.exec(delete(ProjectDetail))
    session.exec(delete(ProjectDetailTemplate))
    session.exec(delete(Proposal))
    session.exec(delete(Allocation))
    session.exec(delete(Shortlist))
    session.exec(delete(Notification))
    session.exec(delete(Config))
    session.commit()

    # Import data as json.
    response = admin_client.post("/api/admins/import/json", json=data)
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    users = session.exec(select(User)).all()
    projects = session.exec(select(Project)).all()
    project_details = session.exec(select(ProjectDetail)).all()
    project_detail_templates = session.exec(select(ProjectDetailTemplate)).all()
    proposals = session.exec(select(Proposal)).all()
    allocations = session.exec(select(Allocation)).all()
    shortlists = session.exec(select(Shortlist)).all()
    notifications = session.exec(select(Notification)).all()
    configs = session.exec(select(Config)).all()

    assert len(users) == len(users)
    assert len(projects) == len(projects)
    assert len(project_details) == len(projects) * len(templates)
    assert len(project_detail_templates) == len(templates)
    assert len(proposals) == len(projects)
    assert len(allocations) == len(allocations)
    assert len(shortlists) == len(shortlists)
    assert len(notifications) == len(notifications)
    assert len(configs) == len(configs)


def test_reset_database(admin_client: TestClient, session: Session):
    students = UserFactory.build_batch(50, role="student")
    staff = UserFactory.build_batch(2, role="admin") + UserFactory.build_batch(10, role="staff")
    templates = ProjectDetailTemplateFactory.build_batch(10)
    projects = ProjectFactory.build_batch(10, approved=True, details__templates=templates)
    allocations = [
        Allocation(
            allocatee=student,
            allocated_project=random.choice(projects),
            accepted=random.choice([True, False, None]),
        )
        for student in students
    ]
    proposals = [
        Proposal(
            proposer=random.choice(staff),
            proposed_project=project,
        )
        for project in projects
    ]
    shortlists = [
        Shortlist(
            shortlister=student,
            shortlisted_project=project,
            preference=preference,
        )
        for preference, project in enumerate(random.sample(projects, 5))
        for student in students
    ]
    notifications = [NotificationFactory.build_batch(5, user=user) for user in students + staff]
    notifications = sum(notifications, [])  # flatten list of lists

    session.add_all(students)
    session.add_all(staff)
    session.add_all(templates)
    session.add_all(projects)
    session.add_all(allocations)
    session.add_all(proposals)
    session.add_all(shortlists)
    session.add_all(notifications)
    session.commit()

    old_admins = session.exec(select(User).where(User.role == "admin")).all()
    old_templates = session.exec(select(ProjectDetailTemplate)).all()
    old_configs = session.exec(select(Config)).all()

    response = admin_client.post("/api/admins/database/reset")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    users = session.exec(select(User)).all()
    templates = session.exec(select(ProjectDetailTemplate)).all()
    project_details = session.exec(select(ProjectDetail)).all()
    projects = session.exec(select(Project)).all()
    allocations = session.exec(select(Allocation)).all()
    proposals = session.exec(select(Proposal)).all()
    shortlists = session.exec(select(Shortlist)).all()
    notifications = session.exec(select(Notification)).all()
    configs = session.exec(select(Config)).all()

    assert len(users) == len(old_admins)  # admins should not be deleted
    assert len(templates) == len(old_templates)  # templates should not be deleted
    assert len(project_details) == 0
    assert len(projects) == 0
    assert len(allocations) == 0
    assert len(proposals) == 0
    assert len(shortlists) == 0
    assert len(notifications) == 0
    assert configs == old_configs  # configs should not be deleted
