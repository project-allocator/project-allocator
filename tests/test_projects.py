from fastapi.testclient import TestClient
from sqlmodel import Session
import random

from src.models import User, Project, Proposal, Allocation
from src.factories import ProjectFactory, ProjectDetailTemplateFactory


def test_read_project_detail_templates(
    admin_client: TestClient,
    session: Session,
):
    templates = ProjectDetailTemplateFactory.build_batch(10)
    session.add_all(templates)
    session.commit()

    response = admin_client.get("/api/projects/details/templates")
    data = response.json()
    assert response.status_code == 200

    assert len(data) == len(templates)
    # fmt: off
    assert set([template["key"] for template in data]) \
        == set([template.key for template in templates])


def test_read_projects(
    staff_user: User,
    admin_client: TestClient,
    session: Session,
):
    projects = ProjectFactory.build_batch(10)
    proposals = [Proposal(proposer=staff_user, proposed_project=project) for project in projects]
    session.add_all(projects)
    session.add_all(proposals)
    session.commit()

    response = admin_client.get("/api/projects")
    data = response.json()
    assert response.status_code == 200

    approved_projects = [project for project in projects if project.approved]
    assert len(data) == len(approved_projects)
    # fmt: off
    assert set([project["title"] for project in data]) \
        == set([approved_project.title for approved_project in approved_projects])
    
    response = admin_client.get("/api/projects", params={"approved": False})
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
    templates = ProjectDetailTemplateFactory.build_batch(10)
    project = ProjectFactory.build(details__templates=templates, approved=True)
    proposal = Proposal(proposer=staff_user, proposed_project=project)
    session.add_all(templates)
    session.add(project)
    session.add(proposal)
    session.commit()

    response = student_client.get(f"/api/projects/{project.id}")
    data = response.json()
    assert response.status_code == 200

    assert data["title"] == project.title
    assert data["description"] == project.description
    assert data["approved"] == project.approved
    assert len(data["details"]) == len(project.details) == len(templates)


def test_create_project(
    staff_user: User,
    staff_client: TestClient,
    session: Session,
):
    templates = ProjectDetailTemplateFactory.build_batch(10)
    session.add_all(templates)
    session.commit()

    project = ProjectFactory.build(details__templates=templates)

    response = staff_client.post(
        "/api/projects",
        json={
            **project.model_dump(include=["title", "description"]),
            "details": [detail.model_dump(include=["key", "value"]) for detail in project.details],
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
    templates = ProjectDetailTemplateFactory.build_batch(10)
    project = ProjectFactory.build(details__templates=templates)
    proposal = Proposal(proposer=staff_user, proposed_project=project)
    session.add_all(templates)
    session.add(proposal)
    session.add(project)
    session.commit()

    new_project = ProjectFactory.build(details__templates=templates)

    response = staff_client.put(
        f"/api/projects/{project.id}",
        json={
            **new_project.model_dump(include=["title", "description"]),
            "details": [detail.model_dump(include=["key", "value"]) for detail in new_project.details],
        },
    )
    data = response.json()
    assert response.status_code == 200

    assert data["title"] == new_project.title
    assert data["description"] == new_project.description
    assert data["approved"] == project.approved  # must be unchanged
    assert len(data["details"]) == len(new_project.details)

    session.refresh(project)

    assert project.title == new_project.title
    assert project.description == new_project.description
    assert project.approved == project.approved  # must be unchanged
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


def test_set_project_status(
    staff_user: User,
    admin_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build(approved=None)
    proposal = Proposal(proposer=staff_user, proposed_project=project)
    session.add(project)
    session.add(proposal)
    session.commit()

    approved = random.choice([True, False])
    response = admin_client.post(f"/api/projects/{project.id}/status", json={"approved": approved})
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    session.refresh(project)
    assert project.approved is approved


def test_reset_project_status(
    staff_user: User,
    admin_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build(approved=random.choice([True, False]))
    proposal = Proposal(proposer=staff_user, proposed_project=project)
    session.add(project)
    session.add(proposal)
    session.commit()

    response = admin_client.delete(f"/api/projects/{project.id}/status")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    session.refresh(project)
    assert project.approved is None


def test_is_project_allocated(student_client: TestClient, student_user: User, session: Session):
    project = ProjectFactory.build()
    allocation = Allocation(allocatee=student_user, allocated_project=project)
    session.add(project)
    session.add(allocation)
    session.commit()

    response = student_client.get(f"/api/users/me/projects/{project.id}/allocated")
    data = response.json()
    assert response.status_code == 200
    assert data is True


def test_is_project_accepted(student_client: TestClient, student_user: User, session: Session):
    project = ProjectFactory.build()
    allocation = Allocation(allocatee=student_user, allocated_project=project)
    session.add(project)
    session.add(allocation)
    session.commit()

    response = student_client.get(f"/api/users/me/projects/{project.id}/accepted")
    data = response.json()
    assert response.status_code == 200
    assert data is allocation.accepted
