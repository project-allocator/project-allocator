from fastapi.testclient import TestClient
from sqlmodel import Session

from src.models import User, Project, Proposal
from src.factories import ProjectFactory, ProjectDetailConfigFactory


def test_read_approved_projects(
    staff_user: User,
    student_client: TestClient,
    session: Session,
):
    projects = ProjectFactory.build_batch(10)
    proposals = [Proposal(proposer=staff_user, proposed_project=project) for project in projects]
    session.add_all(projects)
    session.add_all(proposals)
    session.commit()

    response = student_client.get("/api/projects/approved")
    data = response.json()
    assert response.status_code == 200

    approved_projects = [project for project in projects if project.approved]
    assert len(data) == len(approved_projects)
    # fmt: off
    assert set([project["title"] for project in data]) \
        == set([approved_project.title for approved_project in approved_projects])


def test_read_non_approved_projects(
    staff_user: User,
    admin_client: TestClient,
    session: Session,
):
    projects = ProjectFactory.build_batch(10)
    proposals = [Proposal(proposer=staff_user, proposed_project=project) for project in projects]
    session.add_all(projects)
    session.add_all(proposals)
    session.commit()

    response = admin_client.get("/api/projects/non-approved")
    data = response.json()
    assert response.status_code == 200

    non_approved_projects = [project for project in projects if not project.approved]
    assert len(data) == len(non_approved_projects)
    # fmt: off
    assert set([project["title"] for project in data]) \
        == set([non_approved_project.title for non_approved_project in non_approved_projects])


def test_read_project(
    staff_user: User,
    student_client: TestClient,
    session: Session,
):
    project_detail_configs = ProjectDetailConfigFactory.build_batch(5)
    project = ProjectFactory.build(details__configs=project_detail_configs, approved=True)
    proposal = Proposal(proposer=staff_user, proposed_project=project)
    session.add_all(project_detail_configs)
    session.add(project)
    session.add(proposal)
    session.commit()

    response = student_client.get(f"/api/projects/{project.id}")
    data = response.json()
    assert response.status_code == 200

    assert data["title"] == project.title
    assert data["description"] == project.description
    assert data["approved"] == project.approved
    assert len(data["details"]) == len(project.details) == len(project_detail_configs)


def test_create_project(
    staff_user: User,
    staff_client: TestClient,
    session: Session,
):
    project_detail_configs = ProjectDetailConfigFactory.build_batch(5)
    session.add_all(project_detail_configs)
    session.commit()

    project = ProjectFactory.build(details__configs=project_detail_configs)

    # fmt: off
    response = staff_client.post(
        "/api/projects",
        json={
            **project.model_dump(include=["title", "description"]),
            "details": [project_detail.model_dump(include=["key", "type", "value"]) for project_detail in project.details],
        },
    )
    data = response.json()
    assert response.status_code == 200

    assert data["title"] == project.title
    assert data["description"] == project.description
    assert data["approved"] == None  # must be None
    assert len(data["details"]) == len(project.details)

    project = session.get(Project, data["id"])

    assert project.id == data["id"]
    assert project.title == project.title
    assert project.description == project.description
    assert project.approved == None  # must be None
    assert len(project.details) == len(project.details)
    assert project.proposal.proposer == staff_user


def test_update_project(
    staff_user: User,
    staff_client: TestClient,
    session: Session,
):
    project_detail_configs = ProjectDetailConfigFactory.build_batch(5)
    project = ProjectFactory.build(details__configs=project_detail_configs)
    proposal = Proposal(proposer=staff_user, proposed_project=project)
    session.add_all(project_detail_configs)
    session.add(proposal)
    session.add(project)
    session.commit()

    new_project = ProjectFactory.build(details__configs=project_detail_configs)

    # fmt: off
    response = staff_client.put(
        f"/api/projects/{project.id}",
        json={
            **new_project.model_dump(include=["title", "description"]),
            "approved": True,
            "details": [project_detail.model_dump(include=["key", "type", "value"]) for project_detail in project.details],
        },
    )
    data = response.json()
    assert response.status_code == 200

    assert data["title"] == new_project.title
    assert data["description"] == new_project.description
    assert data["approved"] == None  # must be None
    assert len(data["details"]) == len(new_project.details)

    session.refresh(project)

    assert project.title == new_project.title
    assert project.description == new_project.description
    assert project.approved == None  # must be None
    assert len(project.details) == len(new_project.details)


def test_delete_project(
    staff_user: User,
    staff_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build(approved=True)
    proposal = Proposal(proposer=staff_user, proposed_project=project)
    session.add(project)
    session.add(proposal)
    session.commit()

    response = staff_client.delete(f"/api/projects/{project.id}")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    project = session.get(Project, project.id)

    assert project is None
