import datetime
import random
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from src.config import config
from src.factories import ProjectFactory, UserFactory
from src.models import Project, Status, User
import json


def test_are_proposals_shutdown(student_client: TestClient, session: Session):
    status = session.get(Status, "proposals.shutdown")
    status.value = True
    session.add(status)
    session.commit()

    response = student_client.get("/api/proposals/shutdown")
    data = response.json()
    assert response.status_code == 200
    assert data is True


def test_are_shortlists_shutdown(student_client: TestClient, session: Session):
    status = session.get(Status, "shortlists.shutdown")
    status.value = True
    session.add(status)
    session.commit()

    response = student_client.get("/api/shortlists/shutdown")
    data = response.json()
    assert response.status_code == 200
    assert data is True


def test_are_undos_shutdown(student_client: TestClient, session: Session):
    status = session.get(Status, "undos.shutdown")
    status.value = True
    session.add(status)
    session.commit()

    response = student_client.get("/api/undos/shutdown")
    data = response.json()
    assert response.status_code == 200
    assert data is True


def test_set_proposals_shutdown(admin_client: TestClient, session: Session):
    # Status for proposal shutdowns is False by default
    response = admin_client.post("/api/proposals/shutdown")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    status = session.get(Status, "proposals.shutdown")
    assert status.value is True


def test_unset_proposals_shutdown(admin_client: TestClient, session: Session):
    status = session.get(Status, "proposals.shutdown")
    status.value = True
    session.add(status)
    session.commit()

    response = admin_client.delete("/api/proposals/shutdown")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    status = session.get(Status, "proposals.shutdown")
    assert status.value is False


def test_set_shortlists_shutdown(admin_client: TestClient, session: Session):
    # Status for shortlist shutdowns is False by default
    response = admin_client.post("/api/shortlists/shutdown")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    status = session.get(Status, "shortlists.shutdown")
    assert status.value is True


def test_unset_shortlists_shutdown(admin_client: TestClient, session: Session):
    status = session.get(Status, "shortlists.shutdown")
    status.value = True
    session.add(status)
    session.commit()

    response = admin_client.delete("/api/shortlists/shutdown")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    status = session.get(Status, "shortlists.shutdown")
    assert status.value is False


def test_set_undos_shutdown(admin_client: TestClient, session: Session):
    # Status for undo shutdowns is False by default
    response = admin_client.post("/api/projects/undos/shutdown")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    status = session.get(Status, "undos.shutdown")
    assert status.value is True


def test_unset_undos_shutdown(admin_client: TestClient, session: Session):
    status = session.get(Status, "undos.shutdown")
    status.value = True
    session.add(status)
    session.commit()

    response = admin_client.delete("/api/projects/undos/shutdown")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    status = session.get(Status, "undos.shutdown")
    assert status.value is False


def test_export_json(admin_client: TestClient, session: Session):
    students = [UserFactory.build() for _ in range(50)]
    staff = [UserFactory.build() for _ in range(10)]
    projects = [ProjectFactory.build() for _ in range(10)]
    for student in students:
        student.role = "student"
        student.allocated = random.choice(projects)
    for project in projects:
        project.proposer = random.choice(staff)
    session.add_all(students)
    session.add_all(staff)
    session.add_all(projects)
    session.commit()

    response = admin_client.get("/api/export/json")
    data = json.loads(response.json())
    print(data[0])
    assert response.status_code == 200
    assert len(data) == 10
    assert "proposer" in data[0].keys() and "allocatees" in data[0].keys()


def test_export_csv(admin_client: TestClient, session: Session):
    students = [UserFactory.build() for _ in range(50)]
    staff = [UserFactory.build() for _ in range(10)]
    projects = [ProjectFactory.build() for _ in range(10)]
    for student in students:
        student.role = "student"
        student.allocated = random.choice(projects)
    for project in projects:
        project.proposer = random.choice(staff)
    session.add_all(students)
    session.add_all(staff)
    session.add_all(projects)
    session.commit()

    response = admin_client.get("/api/export/csv")
    data = response.json()
    assert response.status_code == 200

    lines = data.split("\n")
    assert len(lines) == 10 + 2  # 10 projects + 2 header lines
    assert len(lines[0].split(",")) >= 3


def test_import_json(staff_user: User, admin_client: TestClient, session: Session):
    # fmt: off
    users = [
        {"id": 4, "email": "david@example.com", "name": "David Smith", "role": "student"},
        {"id": 5, "email": "elizabeth@example.com", "name": "Elizabeth Smith", "role": "student"},
    ]
    projects = [
        {"id": 1, "title": "Project 1", "description": "Description 1", "categories": ["category-1"], "proposer_id": staff_user.id},
        {"id": 2, "title": "Project 2", "description": "Description 2", "categories": ["category-2"], "proposer_id": staff_user.id},
    ]
    for project in projects:
        # We need to use ProjectFactory to randomly generate custom project details according to config.yaml.
        custom_project = ProjectFactory.build()
        for detail in config["projects"]["details"]:
            custom_detail = getattr(custom_project, detail["name"])
            # We need to format datetime objects to string because JSON does not support datetime.
            if isinstance(custom_detail, datetime.datetime):
                custom_detail = custom_detail.strftime("%Y-%m-%dT%H:%M:%S")
            project[detail["name"]] = custom_detail

    # fmt: on
    response = admin_client.post(
        "/api/import/json",
        json={"users": users, "projects": projects},
    )
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    users = session.exec(select(User)).all()
    projects = session.exec(select(Project)).all()
    assert len(users) == 3 + 2  # 3 existing users + 2 new users
    assert len(projects) == 2  # 2 new projects


def test_check_missing_users(admin_client: TestClient, session: Session):
    emails = [
        "alice@example.com",
        "bob@example.com",
        "charlie@example.com",
        "david@example.com",
    ]
    response = admin_client.post("/api/users/missing", json=emails)
    data = response.json()
    assert response.status_code == 200
    assert len(data) == 1
    assert data[0] == "david@example.com"
