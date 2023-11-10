from fastapi.testclient import TestClient
from sqlmodel import Session
from src.factories import ProjectFactory, UserFactory
from src.models import User


def test_read_proposed(
    staff_user: User,
    staff_client: TestClient,
    session: Session,
):
    projects = [ProjectFactory.build() for _ in range(5)]
    for project in projects:
        project.proposer = staff_user
    session.add_all(projects)
    session.commit()

    response = staff_client.get("/api/users/me/proposed")
    data = response.json()
    assert response.status_code == 200
    assert len(data) == len(projects)
    # fmt: off
    assert set([project["title"] for project in data]) \
        == set([project.title for project in projects])


def test_is_proposed(
    staff_user: User,
    staff_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build()
    project.proposer = staff_user
    session.add(project)
    session.commit()

    response = staff_client.get(f"/api/users/me/proposed/{project.id}")
    data = response.json()
    assert response.status_code == 200
    assert data is True

    proposer = UserFactory.build()
    proposer.role = "staff"
    project.proposer = proposer
    session.add(project)
    session.commit()

    response = staff_client.get(f"/api/users/me/proposed/{project.id}")
    data = response.json()
    assert response.status_code == 200
    assert data is False


def test_approve_proposal(
    staff_user: User,
    admin_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build()
    project.approved = False
    project.proposer = staff_user
    session.add(project)
    session.commit()

    response = admin_client.post(f"/api/projects/{project.id}/approved")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    session.refresh(project)
    assert project.approved is True


def test_reject_proposal(
    staff_user: User,
    admin_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build()
    project.approved = True
    project.proposer = staff_user
    session.add(project)
    session.commit()

    response = admin_client.post(f"/api/projects/{project.id}/reject")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    session.refresh(project)
    assert project.approved is False


def test_undo_proposal(
    staff_user: User,
    admin_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build()
    project.approved = True
    project.proposer = staff_user
    session.add(project)
    session.commit()

    response = admin_client.post(f"/api/projects/{project.id}/undo")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    session.refresh(project)
    assert project.approved is None
