from fastapi.testclient import TestClient
from sqlmodel import Session
import random

from src.models import User, Allocation
from src.factories import UserFactory, ProjectFactory


# TODO: Maybe add proposals to each project.
def test_allocate_projects(admin_client: TestClient, session: Session):
    students = UserFactory.build_batch(50, role="student")
    staff = UserFactory.build_batch(2, role="admin") + UserFactory.build_batch(10, role="staff")
    projects = ProjectFactory.build_batch(10, approved=True)
    session.add_all(students)
    session.add_all(staff)
    session.add_all(projects)
    session.commit()

    response = admin_client.post("/api/projects/allocatees")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    # The exact effect depends on the implementation of the custom algorithm.
    for student in students:
        session.refresh(student)
        assert student.allocation is not None


def test_deallocate_projects(admin_client: TestClient, session: Session):
    students = UserFactory.build_batch(50, role="student")
    staff = UserFactory.build_batch(2, role="admin") + UserFactory.build_batch(10, role="staff")
    projects = ProjectFactory.build_batch(10, approved=True)
    # fmt: off
    approved_projects = [project for project in projects if project.approved]
    allocations = [Allocation(allocatee=student, allocated_project=random.choice(approved_projects)) for student in students]
    session.add_all(students)
    session.add_all(staff)
    session.add_all(projects)
    session.add_all(allocations)
    session.commit()

    response = admin_client.delete("/api/projects/allocatees")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    for student in students:
        assert student.allocation is None
    for project in projects:
        assert len(project.allocations) == 0


def test_set_allocation_status(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build(approved=True)
    allocation = Allocation(allocatee=student_user, allocated_project=project, accepted=None)
    session.add(project)
    session.add(allocation)
    session.commit()

    accepted = random.choice([True, False])
    response = student_client.post("/api/users/me/allocated/status", json={"accepted": accepted})
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    session.refresh(student_user)
    assert student_user.allocation.accepted is accepted


def test_set_allocation_status(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build(approved=True)
    allocation = Allocation(allocatee=student_user, allocated_project=project, accepted=random.choice([True, False]))
    session.add(project)
    session.add(allocation)
    session.commit()

    accepted = random.choice([True, False])
    response = student_client.delete("/api/users/me/allocated/status")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    session.refresh(student_user)
    assert student_user.allocation.accepted is None


def test_read_allocatees(
    staff_client: TestClient,
    session: Session,
):
    students = UserFactory.build_batch(5, role="student")
    project = ProjectFactory.build(approved=True)
    allocations = [Allocation(allocatee=student, allocated_project=project) for student in students]
    session.add_all(students)
    session.add(project)
    session.add_all(allocations)
    session.commit()

    response = staff_client.get(f"/api/projects/{project.id}/allocatees")
    data = response.json()
    assert response.status_code == 200

    assert len(data) == len(students)
    assert set([student["id"] for student in data]) == set([student.id for student in students])


def test_add_allocatees(
    admin_client: TestClient,
    session: Session,
):
    students = UserFactory.build_batch(5, role="student")
    project = ProjectFactory.build(approved=True)
    session.add_all(students)
    session.add(project)
    session.commit()

    response = admin_client.post(
        f"/api/projects/{project.id}/allocatees",
        json=[
            {
                "id": student.id,
                "email": student.email,
                "name": student.name,
                "role": student.role,
            }
            for student in students
        ],
    )
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    session.refresh(project)
    assert len(project.allocations) == len(students)
    # fmt: off
    assert set([allocation.allocatee.id for allocation in project.allocations]) == set([student.id for student in students])


def test_remove_allocatee(
    admin_client: TestClient,
    session: Session,
):
    students = UserFactory.build_batch(5, role="student")
    project = ProjectFactory.build(approved=True)
    allocations = [Allocation(allocatee=student, allocated_project=project) for student in students]
    session.add_all(students)
    session.add(project)
    session.add_all(allocations)
    session.commit()

    response = admin_client.delete(f"/api/projects/{project.id}/allocatees/{students[0].id}")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    session.refresh(project)
    assert len(project.allocations) == len(students) - 1


def test_read_allocated(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    response = student_client.get("/api/users/me/allocated")
    data = response.json()
    assert response.status_code == 404

    project = ProjectFactory.build(approved=True)
    allocation = Allocation(allocatee=student_user, allocated_project=project)
    session.add(project)
    session.add(allocation)
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
    project = ProjectFactory.build(approved=True)
    allocation = Allocation(allocatee=student_user, allocated_project=project)
    session.add(project)
    session.add(allocation)
    session.commit()

    response = student_client.get(f"/api/users/me/allocated/{project.id}")
    data = response.json()
    assert response.status_code == 200
    assert data is True


def test_is_accepted(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build(approved=True)
    allocation = Allocation(allocatee=student_user, allocated_project=project, accepted=True)
    session.add(project)
    session.add(allocation)
    session.commit()

    response = student_client.get("/api/users/me/allocated/accepted")
    data = response.json()
    assert response.status_code == 200
    assert data is True
