from fastapi.testclient import TestClient
from sqlmodel import Session, select
import random
import json
import csv
from io import StringIO

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
    conflicting_projects = [project for project in projects if not all([allocation.accepted for allocation in project.allocations])]

    response = admin_client.get("/api/admins/conflicting-projects")
    data = response.json()
    assert response.status_code == 200

    assert len(data) == len(conflicting_projects)
    assert set([project["id"] for project in data]) == set([project.id for project in conflicting_projects])


def test_read_unallocated_users(
    student_user: User,
    admin_client: TestClient,
    session: Session,
):
    allocatees = UserFactory.build_batch(50, role="student") + [student_user]
    non_allocatees = UserFactory.build_batch(10, role="student")
    projects = ProjectFactory.build_batch(10, approved=True)
    allocations = [
        Allocation(
            allocatee=allocatee,
            allocated_project=random.choice(projects),
            accepted=random.choice([True, False, None]),
        )
        for allocatee in allocatees
    ]
    session.add_all(allocatees)
    session.add_all(non_allocatees)
    session.add_all(projects)
    session.add_all(allocations)
    session.commit()

    response = admin_client.get("/api/admins/unallocated-users")
    data = response.json()
    assert response.status_code == 200

    assert len(data) == len(non_allocatees)
    assert set([student["id"] for student in data]) == set([non_allocatee.id for non_allocatee in non_allocatees])


def test_export_json_and_csv(admin_client: TestClient, session: Session):
    students = UserFactory.build_batch(50, role="student")
    staff = UserFactory.build_batch(2, role="admin") + UserFactory.build_batch(10, role="staff")
    templates = ProjectDetailTemplateFactory.build_batch(10)
    projects = ProjectFactory.build_batch(10, details__templates=templates)
    # fmt: off
    approved_projects = [project for project in projects if project.approved]
    allocations = [Allocation(allocatee=student, allocated_project=random.choice(approved_projects)) for student in students]
    proposals = [Proposal(proposer=random.choice(staff), proposed_project=project) for project in projects]

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
        "created_at",
        "updated_at",
    ]
    project_fields = [
        "id",
        "title",
        "description",
        "approved",
        "created_at",
        "updated_at",
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
    projects = ProjectFactory.build_batch(10, details__templates=templates)
    # We construct proposals and allocations manually instead of using SQLModel models
    # because the foreign keys are not updated until we commit the session.
    # fmt: off
    approved_projects = [project for project in projects if project.approved]
    allocations = [{"allocatee_id": student.id, "allocated_project_id": random.choice(approved_projects).id} for student in students]
    proposals = [{"proposer_id": random.choice(staff).id, "proposed_project_id": project.id} for project in projects]

    user_fields = ["id", "email", "name", "role"]
    project_fields = ["id", "title", "description", "approved"]
    project_detail_fields = ["key", "type", "value", "project_id"]
    users_data = [user.model_dump(include=user_fields) for user in students + staff]
    projects_data = []
    for project in projects:
        project_data = project.model_dump(include=project_fields)
        project_data["details"] = [detail.model_dump(include=project_detail_fields) for detail in project.details]
        project_data["proposal"] = next(proposal for proposal in proposals if proposal["proposed_project_id"] == project.id)
        project_data["allocations"] = [allocation for allocation in allocations if allocation["allocated_project_id"] == project.id]
        projects_data.append(project_data)

    response = admin_client.post(
        "/api/admins/import/json",
        json={"users": users_data, "projects": projects_data},
    )
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    users = session.exec(select(User)).all()
    projects = session.exec(select(Project)).all()
    assert len(users) == len(users_data) + 3  # 3 existing users
    assert len(projects) == len(projects_data)
    assert all(len(project.details) == len(templates) for project in projects)
    assert all(project.proposal is not None for project in projects)
    assert sum(len(project.allocations) for project in projects) == len(allocations)


def test_reset_database(admin_client: TestClient, session: Session):
    students = UserFactory.build_batch(50, role="student")
    staff = UserFactory.build_batch(2, role="admin") + UserFactory.build_batch(10, role="staff")
    templates = ProjectDetailTemplateFactory.build_batch(10)
    projects = ProjectFactory.build_batch(10, details__templates=templates)
    # fmt: off
    approved_projects = [project for project in projects if project.approved]
    allocations = [Allocation(allocatee=student, allocated_project=random.choice(approved_projects)) for student in students]
    proposals = [Proposal(proposer=random.choice(staff), proposed_project=project) for project in projects]
    shortlists = [[Shortlist(shortlister=student, shortlisted_project=project, preference=preference) for preference, project in enumerate(projects)] for student in students]
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

    assert len(users) == len(old_admins) # admins should not be deleted
    assert len(templates) == len(templates)
    assert len(project_details) == 0
    assert len(projects) == 0
    assert len(allocations) == 0
    assert len(proposals) == 0
    assert len(shortlists) == 0
    assert len(notifications) == 0
    assert configs == old_configs # configs should not be deleted
