import random
from fastapi.testclient import TestClient
from sqlmodel import Session
from src.factories import ProjectFactory, UserFactory
from src.models import Shortlist, User


def test_read_shortlisted(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    projects = [ProjectFactory.build() for _ in range(10)]
    shortlists = []
    for i, project in enumerate(random.sample(projects, 5)):
        # Students can only shortlist approved projects
        project.approved = True
        shortlists.append(Shortlist(user=student_user, project=project, preference=i))
    session.add_all(projects)
    session.add_all(shortlists)
    session.commit()

    response = student_client.get("/api/users/me/shortlisted")
    data = response.json()
    assert response.status_code == 200
    assert len(data) == len(shortlists)
    # fmt: off
    assert set([project["title"] for project in data]) \
        == set([shortlist.project.title for shortlist in shortlists])


def test_is_shortlisted(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build()
    project.approved = True
    shortlist = Shortlist(user=student_user, project=project, preference=0)
    session.add(project)
    session.add(shortlist)
    session.commit()

    response = student_client.get(f"/api/users/me/shortlisted/{project.id}")
    data = response.json()
    assert response.status_code == 200
    assert data is True


def test_set_shortlisted(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build()
    project.approved = True
    session.add(project)
    session.commit()

    response = student_client.post(f"/api/users/me/shortlisted/{project.id}")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    shortlist = session.get(Shortlist, (student_user.id, project.id))
    assert shortlist is not None
    assert shortlist.preference == 0


def test_unset_shortlisted(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build()
    project.approved = True
    shortlist = Shortlist(user=student_user, project=project, preference=0)
    session.add(project)
    session.add(shortlist)
    session.commit()

    response = student_client.delete(f"/api/users/me/shortlisted/{project.id}")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    shortlist = session.get(Shortlist, (student_user.id, project.id))
    assert shortlist is None


def test_reorder_shortlisted(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    projects = [ProjectFactory.build() for _ in range(10)]
    shortlists = []
    for i, project in enumerate(random.sample(projects, 5)):
        # Students can only shortlist approved projects
        project.approved = True
        shortlists.append(Shortlist(user=student_user, project=project, preference=i))
    session.add_all(projects)
    session.add_all(shortlists)
    session.commit()

    project_ids = [shortlist.project.id for shortlist in shortlists]
    random.shuffle(project_ids)
    response = student_client.put("/api/users/me/shortlisted", json=project_ids)
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    for shortlist in shortlists:
        session.refresh(shortlist)
    shortlists.sort(key=lambda shortlist: shortlist.preference)
    assert len(shortlists) == len(project_ids)
    assert [shortlist.project.id for shortlist in shortlists] == project_ids


def test_read_shortlisters(
    staff_user: User,
    staff_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build()
    project.approved = True
    project.proposer = staff_user
    users = [UserFactory.build() for _ in range(10)]
    shortlists = []
    for user in users:
        shortlists.append(Shortlist(user=user, project=project, preference=0))
    session.add(project)
    session.add_all(users)
    session.add_all(shortlists)
    session.commit()

    response = staff_client.get(f"/api/projects/{project.id}/shortlisters")
    data = response.json()
    assert response.status_code == 200
    assert len(data) == len(shortlists)
    assert set([user["email"] for user in data]) == set([user.email for user in users])
