from fastapi.testclient import TestClient
from sqlmodel import Session

from src.models import User, Proposal
from src.factories import ProjectFactory


def test_read_proposed_projects(
    staff_user: User,
    staff_client: TestClient,
    session: Session,
):
    projects = ProjectFactory.build_batch(5)
    proposals = [Proposal(proposer=staff_user, proposed_project=project) for project in projects]
    session.add_all(projects)
    session.add_all(proposals)
    session.commit()

    response = staff_client.get("/api/users/me/proposed")
    data = response.json()
    assert response.status_code == 200

    assert len(data) == len(projects)
    # fmt: off
    assert set([project["title"] for project in data]) \
        == set([project.title for project in projects])


def test_is_project_proposed(
    staff_user: User,
    admin_user: User,
    staff_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build()
    proposal = Proposal(proposer=staff_user, proposed_project=project)
    session.add(project)
    session.add(proposal)
    session.commit()

    response = staff_client.get(f"/api/users/me/projects/{project.id}/proposed")
    data = response.json()
    assert response.status_code == 200
    assert data is True

    proposal = Proposal(proposer=admin_user, proposed_project=project)
    session.merge(proposal)  # override previous proposal
    session.commit()

    response = staff_client.get(f"/api/users/me/projects/{project.id}/proposed")
    data = response.json()
    assert response.status_code == 200
    assert data is False
