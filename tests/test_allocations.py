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


def test_accept_allocation(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build(approved=True)
    allocation = Allocation(allocatee=student_user, allocated_project=project, accepted=None)
    session.add(project)
    session.add(allocation)
    session.commit()

    response = student_client.post("/api/users/me/allocated/accepted")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    session.refresh(student_user)
    assert student_user.allocation.accepted is True


def test_decline_allocation(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build(approved=True)
    allocation = Allocation(allocatee=student_user, allocated_project=project, accepted=None)
    session.add(project)
    session.add(allocation)
    session.commit()

    response = student_client.post("/api/users/me/allocated/declined")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    session.refresh(student_user)
    assert student_user.allocation.accepted is False


def test_undo_allocation(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build(approved=True)
    allocation = Allocation(allocatee=student_user, allocated_project=project, accepted=random.choice([True, False]))
    session.add(project)
    session.add(allocation)
    session.commit()

    response = student_client.post("/api/users/me/allocated/undo")
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


def test_read_conflicting_projects(admin_client: TestClient, session: Session):
    students = UserFactory.build_batch(50, role="student")
    projects = ProjectFactory.build_batch(10, approved=True)
    allocations = [
        Allocation(
            allocatee=student,
            allocated_project=random.choice(projects),
            accepted=random.choice([True, False, None]),
        )
        for student in students
    ]
    session.add_all(students)
    session.add_all(projects)
    session.add_all(allocations)
    session.commit()

    # fmt: off
    conflicting_projects = [project for project in projects if not all([allocation.accepted for allocation in project.allocations])]

    response = admin_client.get("/api/projects/conflicting")
    data = response.json()
    assert response.status_code == 200

    assert len(data) == len(conflicting_projects)
    assert set([project["id"] for project in data]) == set([project.id for project in conflicting_projects])


def test_read_unallocated_users(
    student_user: User,
    admin_client: TestClient,
    session: Session,
):
    allocatees = UserFactory.build_batch(50, role="student") + [student_user]
    non_allocatees = UserFactory.build_batch(10, role="student")
    projects = ProjectFactory.build_batch(10, approved=True)
    allocations = [
        Allocation(
            allocatee=allocatee,
            allocated_project=random.choice(projects),
            accepted=random.choice([True, False, None]),
        )
        for allocatee in allocatees
    ]
    session.add_all(allocatees)
    session.add_all(non_allocatees)
    session.add_all(projects)
    session.add_all(allocations)
    session.commit()

    response = admin_client.get("/api/users/unallocated")
    data = response.json()
    assert response.status_code == 200

    assert len(data) == len(non_allocatees)
    assert set([student["id"] for student in data]) == set([non_allocatee.id for non_allocatee in non_allocatees])
