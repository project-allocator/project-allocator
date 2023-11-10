import random
from fastapi.testclient import TestClient
from sqlmodel import Session
from src.factories import ProjectFactory, UserFactory
from src.models import User


def test_allocate_projects(admin_client: TestClient, session: Session):
    users = [UserFactory.build() for _ in range(50)]
    projects = [ProjectFactory.build() for _ in range(10)]
    for user in users:
        user.role = "student"
    # Check no allocation has been made yet.
    for project in projects:
        project.approved = True
        assert len(project.allocatees) == 0
    session.add_all(users)
    session.add_all(projects)
    session.commit()

    response = admin_client.post("/api/projects/allocatees")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    # The exact effect depends on the implementation of the custom algorithm
    # We only check that at least one allocation has been made
    changed = False
    for project in projects:
        session.refresh(project)
        if len(project.allocatees) > 0:
            changed = True
    assert changed is True


def test_deallocate_projects(admin_client: TestClient, session: Session):
    users = [UserFactory.build() for _ in range(50)]
    projects = [ProjectFactory.build() for _ in range(10)]
    # Randomly allocate projects to all users
    for user in users:
        user.role = "student"
        user.allocated = random.choice(projects)
    for project in projects:
        project.approved = True
    session.add_all(users)
    session.add_all(projects)
    session.commit()

    response = admin_client.delete("/api/projects/allocatees")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    for user in users:
        assert user.allocated is None


def test_accept_allocation(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    student_user.allocated = ProjectFactory.build()
    student_user.accepted = False
    session.add(student_user)
    session.commit()

    response = student_client.post("/api/users/me/allocated/accepted")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    session.refresh(student_user)
    assert student_user.accepted is True


def test_decline_allocation(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    student_user.allocated = ProjectFactory.build()
    student_user.accepted = True
    session.add(student_user)
    session.commit()

    response = student_client.post("/api/users/me/allocated/declined")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    session.refresh(student_user)
    assert student_user.accepted is False


def test_undo_allocation(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    student_user.allocated = ProjectFactory.build()
    student_user.accepted = True
    session.add(student_user)
    session.commit()

    response = student_client.post("/api/users/me/allocated/undo")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    session.refresh(student_user)
    assert student_user.accepted is None


def test_read_allocatees(
    staff_user: User,
    staff_client: TestClient,
    session: Session,
):
    users = [UserFactory.build() for _ in range(5)]
    for user in users:
        user.role = "student"
    project = ProjectFactory.build()
    project.proposer = staff_user
    project.allocatees = users
    session.add_all(users)
    session.add(project)
    session.commit()

    response = staff_client.get(f"/api/projects/{project.id}/allocatees")
    data = response.json()
    assert response.status_code == 200
    assert len(data) == len(users)
    assert set([user["id"] for user in data]) == set([user.id for user in users])


def test_is_accepted(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    student_user.allocated = ProjectFactory.build()
    student_user.accepted = True
    session.add(student_user)
    session.commit()

    response = student_client.get("/api/users/me/allocated/accepted")
    data = response.json()
    assert response.status_code == 200
    assert data is True


def test_add_allocatees(
    staff_user: User,
    admin_client: TestClient,
    session: Session,
):
    users = [UserFactory.build() for _ in range(5)]
    for user in users:
        user.role = "student"
    project = ProjectFactory.build()
    project.proposer = staff_user
    project.approved = True
    session.add_all(users)
    session.add(project)
    session.commit()

    response = admin_client.post(
        f"/api/projects/{project.id}/allocatees",
        json=[
            {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "role": user.role,
            }
            for user in users
        ],
    )
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    session.refresh(project)
    assert len(project.allocatees) == len(users)
    # fmt: off
    assert set([user.id for user in project.allocatees]) \
        == set([user.id for user in users])


def test_remove_allocatee(
    staff_user: User,
    admin_client: TestClient,
    session: Session,
):
    user = UserFactory.build()
    user.role = "student"
    project = ProjectFactory.build()
    project.proposer = staff_user
    project.approved = True
    project.allocatees = [user]
    session.add(user)
    session.add(project)
    session.commit()

    response = admin_client.delete(f"/api/users/{user.id}/allocated")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    session.refresh(project)
    assert len(project.allocatees) == 0


def test_read_allocated(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build()
    project.approved = True
    project.allocatees = [student_user]
    session.add(project)
    session.commit()

    response = student_client.get("/api/users/me/allocated")
    data = response.json()
    assert response.status_code == 200
    assert data["id"] == project.id


def test_is_allocated(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build()
    project.approved = True
    project.allocatees = [student_user]
    session.add(project)
    session.commit()

    response = student_client.get(f"/api/users/me/allocated/{project.id}")
    data = response.json()
    assert response.status_code == 200
    assert data is True


def test_read_conflicting_projects(admin_client: TestClient, session: Session):
    users = [UserFactory.build() for _ in range(50)]
    projects = [ProjectFactory.build() for _ in range(10)]
    for user in users:
        user.role = "student"
        user.accepted = random.choice([True, False, None])
        user.allocated = random.choice(projects)
    for project in projects:
        project.approved = True
    session.add_all(users)
    session.add_all(projects)
    session.commit()

    # fmt: off
    conflicting = [
        project for project in projects
        if not all([user.accepted for user in project.allocatees])
    ]
    response = admin_client.get("/api/projects/conflicting")
    data = response.json()
    assert response.status_code == 200
    assert len(data) == len(conflicting)
    # fmt: off
    assert set([project["id"] for project in data]) \
        == set([project.id for project in conflicting])


def test_read_unallocated_users(
    student_user: User,
    admin_client: TestClient,
    session: Session,
):
    users = [UserFactory.build() for _ in range(50)] + [student_user]
    projects = [ProjectFactory.build() for _ in range(10)]
    for user in users:
        user.role = "student"
        user.allocated = random.choice([None, random.choice(projects)])
    for project in projects:
        project.approved = True
    session.add_all(users)
    session.add_all(projects)
    session.commit()

    # fmt: off
    unallocated = [
        user for user in users
        if user.allocated is None
    ]
    response = admin_client.get("/api/users/unallocated")
    data = response.json()
    assert response.status_code == 200
    assert len(data) == len(unallocated)
    # fmt: off
    assert set([user["id"] for user in data]) \
        == set([user.id for user in unallocated])
