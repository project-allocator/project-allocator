from fastapi.testclient import TestClient
from sqlmodel import Session, select
from io import StringIO
import random
import json
import csv

from src.models import (
    User,
    Project,
    ProjectDetail,
    ProjectDetailTemplate,
    Proposal,
    Allocation,
    Shortlist,
    Notification,
    Config,
)
from src.factories import (
    UserFactory,
    ProjectFactory,
    ProjectDetailTemplateFactory,
    NotificationFactory,
)
from src.utils.projects import parse_project


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


def test_read_conflicting_projects(admin_client: TestClient, session: Session):
    students = UserFactory.build_batch(50, role="student")
    projects = ProjectFactory.build_batch(10, approved=True)
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


def test_export_json_csv(admin_client: TestClient, session: Session):
    students = UserFactory.build_batch(50, role="student")
    staff = UserFactory.build_batch(2, role="admin") + UserFactory.build_batch(10, role="staff")
    templates = ProjectDetailTemplateFactory.build_batch(10)
    projects = ProjectFactory.build_batch(10, details__templates=templates)
    approved_projects = [project for project in projects if project.approved]
    allocations = [
        Allocation(
            allocatee=student,
            allocated_project=random.choice(approved_projects),
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

    session.add_all(students)
    session.add_all(staff)
    session.add_all(templates)
    session.add_all(projects)
    session.add_all(allocations)
    session.add_all(proposals)
    session.commit()

    # Test json export.
    response = admin_client.get("/api/admins/export/json")
    # Response is a stringified json so must be parsed.
    data = json.loads(response.json())
    assert response.status_code == 200
    assert len(data["users"]) == len(students) + len(staff) + 3  # 3 existing users
    assert len(data["projects"]) == len(projects)

    user_fields = [
        "id",
        "email",
        "name",
        "role",
    ]
    project_fields = [
        "id",
        "title",
        "description",
        "approved",
        "details",
        "proposal",
        "allocations",
    ]

    assert all(set(user_fields) == set(user.keys()) for user in data["users"])
    assert all(set(project_fields) == set(project.keys()) for project in data["projects"])
    assert all(len(project["details"]) == len(templates) for project in data["projects"])
    assert all(project["proposal"] != {} for project in data["projects"])
    assert sum(len(project["allocations"]) for project in data["projects"]) == len(allocations)

    # Test csv export.
    response = admin_client.get("/api/admins/export/csv")
    data = response.json()
    assert response.status_code == 200

    reader = csv.reader(StringIO(data))
    assert len(list(reader)) == len(projects) + 1  # 1 header line
    assert all(len(row) == (8 + len(templates)) for row in reader)  # 8 project/user fields


def test_import_json(admin_client: TestClient, session: Session):
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

    session.add_all(students)
    session.add_all(staff)
    session.add_all(templates)
    session.add_all(projects)
    session.add_all(allocations)
    session.add_all(proposals)
    session.commit()

    users = session.exec(select(User)).all()
    projects = session.exec(select(Project)).all()
    users_data = [user.model_dump() for user in users]
    projects_data = []
    for project in projects:
        project_data = parse_project(project)
        project_data = project_data.model_dump()
        project_data["proposal"] = project.proposal.model_dump()
        project_data["allocations"] = [allocation.model_dump() for allocation in project.allocations]
        projects_data.append(project_data)

    for user in users:
        session.delete(user)
    # Keep project detail templates in the session.
    # for template in templates:
    #     session.delete(template)
    for project in projects:
        session.delete(project)
    for allocation in allocations:
        session.delete(allocation)
    for proposal in proposals:
        session.delete(proposal)
    session.commit()

    # Using default=str to serialize datetime.
    data = {"users": users_data, "projects": projects_data}
    data = json.loads(json.dumps(data, default=str))
    response = admin_client.post("/api/admins/import/json", json=data)
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    users = session.exec(select(User)).all()
    projects = session.exec(select(Project)).all()
    assert len(users) == len(users_data)
    assert len(projects) == len(projects_data)
    assert all(len(project.details) == len(templates) for project in projects)
    assert all(project.proposal is not None for project in projects)
    assert sum(len(project.allocations) for project in projects) == len(allocations)


def test_reset_database(admin_client: TestClient, session: Session):
    students = UserFactory.build_batch(50, role="student")
    staff = UserFactory.build_batch(2, role="admin") + UserFactory.build_batch(10, role="staff")
    templates = ProjectDetailTemplateFactory.build_batch(10)
    projects = ProjectFactory.build_batch(10, details__templates=templates)
    approved_projects = [project for project in projects if project.approved]
    allocations = [
        Allocation(
            allocatee=student,
            allocated_project=random.choice(approved_projects),
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
        [
            Shortlist(
                shortlister=student,
                shortlisted_project=project,
                preference=preference,
            )
            for preference, project in enumerate(projects)
        ]
        for student in students
    ]
    shortlists = sum(shortlists, [])  # flatten list of lists
    notifications = [NotificationFactory.build(user=user) for user in students + staff]

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
    assert len(templates) == len(templates)
    assert len(project_details) == 0
    assert len(projects) == 0
    assert len(allocations) == 0
    assert len(proposals) == 0
    assert len(shortlists) == 0
    assert len(notifications) == 0
    assert configs == old_configs  # configs should not be deleted
