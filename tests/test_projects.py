import datetime
from fastapi.testclient import TestClient
from sqlmodel import Session
from src.config import config
from src.factories import ProjectFactory
from src.models import Project, User


def test_read_approved_projects(student_client: TestClient, session: Session):
    # Insert 10 random projects to the database.
    projects = [ProjectFactory.build() for _ in range(10)]
    session.add_all(projects)
    session.commit()

    response = student_client.get("/api/projects/approved")
    data = response.json()
    assert response.status_code == 200
    # Only approved projects are returned
    assert len(data) == len([project for project in projects if project.approved])
    # fmt: off
    assert set([project["title"] for project in data]) \
        == set([project.title for project in projects if project.approved])


def test_read_non_approved_projects(admin_client: TestClient, session: Session):
    projects = [ProjectFactory.build() for _ in range(10)]
    session.add_all(projects)
    session.commit()

    response = admin_client.get("/api/projects/non-approved")
    data = response.json()
    assert response.status_code == 200
    # Only non-approved (rejected or no response) projects are returned
    assert len(data) == len([project for project in projects if not project.approved])
    # fmt: off
    assert set([project["title"] for project in data]) \
        == set([project.title for project in projects if not project.approved])


def test_read_project(student_client: TestClient, session: Session):
    project = ProjectFactory.build()
    project.approved = True
    session.add(project)
    session.commit()

    response = student_client.get(f"/api/projects/{project.id}")
    data = response.json()
    assert response.status_code == 200
    assert data["title"] == project.title


def test_create_project(staff_client: TestClient, session: Session):
    project = {
        "title": "New Title",
        "description": "New Description",
        "categories": ["new-category"],
    }
    # We need to use ProjectFactory to randomly generate custom project details according to config.yaml.
    custom_project = ProjectFactory.build()
    for detail in config["projects"]["details"]:
        custom_detail = getattr(custom_project, detail["name"])
        # We need to format datetime objects to string because JSON does not support datetime.
        if isinstance(custom_detail, datetime.datetime):
            custom_detail = custom_detail.strftime("%Y-%m-%dT%H:%M:%S")
        project[detail["name"]] = custom_detail

    response = staff_client.post("/api/projects", json=project)
    data = response.json()
    assert response.status_code == 200
    assert data["title"] == "New Title"
    assert data["description"] == "New Description"

    project = session.get(Project, data["id"])
    assert project.title == "New Title"
    assert project.description == "New Description"


def test_update_project(
    staff_user: User,
    staff_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build()
    project.approved = True
    project.proposer = staff_user
    session.add(project)
    session.commit()

    response = staff_client.put(
        f"/api/projects/{project.id}",
        json={"title": "New Title", "description": "New Description"},
    )
    data = response.json()
    assert response.status_code == 200
    assert data["title"] == "New Title"
    assert data["description"] == "New Description"

    session.refresh(project)
    assert project.title == "New Title"
    assert project.description == "New Description"


def test_delete_project(
    staff_user: User,
    staff_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build()
    project.approved = True
    project.proposer = staff_user
    session.add(project)
    session.commit()

    response = staff_client.delete(f"/api/projects/{project.id}")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    project = session.get(Project, project.id)
    assert project is None
