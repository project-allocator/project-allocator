from fastapi.testclient import TestClient
from sqlmodel import Session, select
import random

from src.factories import UserFactory, ProjectFactory
from src.models import User, Shortlist, Config


def test_read_shortlisted(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    projects = ProjectFactory.build_batch(5, approved=True)
    shortlists = [
        Shortlist(shortlister=student_user, shortlisted_project=project, preference=preference)
        for preference, project in enumerate(projects)
    ]
    session.add_all(projects)
    session.add_all(shortlists)
    session.commit()

    response = student_client.get("/api/users/me/shortlisted")
    data = response.json()
    assert response.status_code == 200

    assert len(data) == len(shortlists)
    # fmt: off
    assert set([project["title"] for project in data]) \
        == set([shortlist.shortlisted_project.title for shortlist in shortlists])


def test_shortlist_project(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    session.merge(Config(key="max_shortlists", value="1"))  # override config

    projects = ProjectFactory.build_batch(2, approved=True)
    session.add_all(projects)
    session.commit()

    response = student_client.post(f"/api/users/me/shortlisted/{projects[0].id}")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    shortlist = session.get(Shortlist, (student_user.id, projects[0].id))
    assert shortlist is not None
    assert shortlist.preference == 0

    # Attempt to make more shortlists than allowed.
    response = student_client.post(f"/api/users/me/shortlisted/{projects[1].id}")
    data = response.json()
    assert response.status_code == 400

    shortlist = session.get(Shortlist, (student_user.id, projects[1].id))
    assert shortlist is None


def test_unshortlist_project(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build(approved=True)
    shortlist = Shortlist(shortlister=student_user, shortlisted_project=project, preference=0)
    session.add(project)
    session.add(shortlist)
    session.commit()

    response = student_client.delete(f"/api/users/me/shortlisted/{project.id}")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    shortlist = session.get(Shortlist, (student_user.id, project.id))
    assert shortlist is None


def test_reorder_shortlisted_projects(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    projects = ProjectFactory.build_batch(10, approved=True)
    shortlists = [
        Shortlist(shortlister=student_user, shortlisted_project=project, preference=preference)
        for preference, project in enumerate(projects)
    ]
    session.add_all(projects)
    session.add_all(shortlists)
    session.commit()

    project_ids = [shortlist.shortlisted_project.id for shortlist in shortlists]
    random.shuffle(project_ids)
    response = student_client.put("/api/users/me/shortlisted", json=project_ids)
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    shortlists = session.exec(select(Shortlist).where(Shortlist.shortlister == student_user)).all()
    shortlists.sort(key=lambda shortlist: shortlist.preference)
    assert len(shortlists) == len(project_ids)
    assert [shortlist.shortlisted_project.id for shortlist in shortlists] == project_ids


def test_read_shortlisters(
    staff_client: TestClient,
    session: Session,
):
    students = UserFactory.build_batch(5, role="student")
    project = ProjectFactory.build(approved=True)
    shortlists = [
        Shortlist(shortlister=student, shortlisted_project=project, preference=random.randint(0, 4))
        for student in students
    ]
    session.add_all(students)
    session.add(project)
    session.add_all(shortlists)
    session.commit()

    response = staff_client.get(f"/api/projects/{project.id}/shortlisters")
    data = response.json()
    assert response.status_code == 200

    assert len(data) == len(shortlists)
    assert set([student["email"] for student in data]) == set([student.email for student in students])


def test_is_project_shortlisted(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build(approved=True)
    shortlist = Shortlist(shortlister=student_user, shortlisted_project=project, preference=0)
    session.add(project)
    session.add(shortlist)
    session.commit()

    response = student_client.get(f"/api/users/me/projects/{project.id}/shortlisted")
    data = response.json()
    assert response.status_code == 200
    assert data is True
