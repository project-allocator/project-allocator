import random

from fastapi.testclient import TestClient
from sqlmodel import Session

from src.factories import ProjectFactory, UserFactory
from src.models import Allocation, Proposal, User


def test_read_allocated_project(
    staff_user: User,
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    response = student_client.get("/api/users/me/allocated_project")
    data = response.json()
    assert response.status_code == 404

    project = ProjectFactory.build(approved=True)
    proposal = Proposal(proposer=staff_user, proposed_project=project)
    allocation = Allocation(
        allocatee=student_user,
        allocated_project=project,
        accepted=random.choice([True, False, None]),
    )
    session.add(project)
    session.add(proposal)
    session.add(allocation)
    session.commit()

    response = student_client.get("/api/users/me/allocated_project")
    data = response.json()
    assert response.status_code == 200
    assert data["id"] == project.id


def test_read_allocatees(
    staff_user: User,
    staff_client: TestClient,
    session: Session,
):
    students = UserFactory.build_batch(5, role="student")
    project = ProjectFactory.build(approved=True)
    proposal = Proposal(proposer=staff_user, proposed_project=project)
    allocations = [
        Allocation(
            allocatee=student,
            allocated_project=project,
            accepted=random.choice([True, False, None]),
        )
        for student in students
    ]
    session.add_all(students)
    session.add(project)
    session.add(proposal)
    session.add_all(allocations)
    session.commit()

    response = staff_client.get(f"/api/projects/{project.id}/allocatees")
    data = response.json()
    assert response.status_code == 200

    assert len(data) == len(students)
    assert set([student["id"] for student in data]) == set([student.id for student in students])


def test_read_non_allocatees(
    staff_user: User,
    student_user: User,
    admin_client: TestClient,
    session: Session,
):
    allocatees = UserFactory.build_batch(50, role="student") + [student_user]
    non_allocatees = UserFactory.build_batch(10, role="student")
    projects = ProjectFactory.build_batch(10, approved=True)
    proposals = [Proposal(proposer=staff_user, proposed_project=project) for project in projects]
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
    session.add_all(proposals)
    session.add_all(allocations)
    session.commit()

    response = admin_client.get("/api/projects/non-allocatees")
    data = response.json()
    assert response.status_code == 200

    assert len(data) == len(non_allocatees)
    assert set([student["id"] for student in data]) == set([non_allocatee.id for non_allocatee in non_allocatees])


def test_add_allocatees(
    staff_user: User,
    admin_client: TestClient,
    session: Session,
):
    students = UserFactory.build_batch(5, role="student")
    project = ProjectFactory.build(approved=True)
    proposal = Proposal(proposer=staff_user, proposed_project=project)
    session.add_all(students)
    session.add(project)
    session.add(proposal)
    session.commit()

    response = admin_client.post(
        f"/api/projects/{project.id}/allocatees",
        json=[student.id for student in students],
    )
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    session.refresh(project)
    assert len(project.allocations) == len(students)
    # fmt: off
    assert set([allocation.allocatee.id for allocation in project.allocations]) \
        == set([student.id for student in students])


def test_remove_allocatee(
    staff_user: User,
    admin_client: TestClient,
    session: Session,
):
    students = UserFactory.build_batch(5, role="student")
    project = ProjectFactory.build(approved=True)
    proposal = Proposal(proposer=staff_user, proposed_project=project)
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


def test_allocate_projects(
    staff_user: User,
    admin_client: TestClient,
    session: Session,
):
    students = UserFactory.build_batch(50, role="student")
    staff = UserFactory.build_batch(2, role="admin") + UserFactory.build_batch(10, role="staff")
    projects = ProjectFactory.build_batch(10, approved=True)
    proposals = [Proposal(proposer=staff_user, proposed_project=project) for project in projects]
    session.add_all(students)
    session.add_all(staff)
    session.add_all(projects)
    session.add_all(proposals)
    session.commit()

    response = admin_client.post("/api/projects/allocate")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    # The exact effect depends on the implementation of the custom algorithm.
    for student in students:
        session.refresh(student)
        assert student.allocation is not None


def test_deallocate_projects(
    staff_user: User,
    admin_client: TestClient,
    session: Session,
):
    students = UserFactory.build_batch(50, role="student")
    staff = UserFactory.build_batch(2, role="admin") + UserFactory.build_batch(10, role="staff")
    projects = ProjectFactory.build_batch(10, approved=True)
    approved_projects = [project for project in projects if project.approved]
    proposals = [Proposal(proposer=staff_user, proposed_project=project) for project in projects]
    allocations = [
        Allocation(
            allocatee=student,
            allocated_project=random.choice(approved_projects),
        )
        for student in students
    ]
    session.add_all(students)
    session.add_all(staff)
    session.add_all(projects)
    session.add_all(proposals)
    session.add_all(allocations)
    session.commit()

    response = admin_client.post("/api/projects/deallocate")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    for student in students:
        assert student.allocation is None
    for project in projects:
        assert len(project.allocations) == 0


def test_accept_allocation(
    staff_user: User,
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build(approved=True)
    proposal = Proposal(proposer=staff_user, proposed_project=project)
    allocation = Allocation(allocatee=student_user, allocated_project=project, accepted=None)
    session.add(project)
    session.add(proposal)
    session.add(allocation)
    session.commit()

    response = student_client.post("/api/users/me/allocation/accept")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    assert allocation.accepted is True


def test_reject_allocation(
    staff_user: User,
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    project = ProjectFactory.build(approved=True)
    proposal = Proposal(proposer=staff_user, proposed_project=project)
    allocation = Allocation(allocatee=student_user, allocated_project=project, accepted=random.choice([True, False]))
    session.add(project)
    session.add(proposal)
    session.add(allocation)
    session.commit()

    response = student_client.post("/api/users/me/allocation/reject")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    assert allocation.accepted is False


def test_lock_allocations(
    staff_user: User,
    admin_client: TestClient,
    session: Session,
):
    students = UserFactory.build_batch(50, role="student")
    projects = ProjectFactory.build_batch(10, approved=True)
    proposals = [Proposal(proposer=staff_user, proposed_project=project) for project in projects]
    allocations = [Allocation(allocatee=student, allocated_project=random.choice(projects)) for student in students]
    session.add_all(students)
    session.add_all(projects)
    session.add_all(proposals)
    session.add_all(allocations)
    session.commit()

    response = admin_client.post("/api/allocations/lock")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    assert all(allocation.locked for allocation in allocations)


def test_unlock_allocations(
    staff_user: User,
    admin_client: TestClient,
    session: Session,
):
    students = UserFactory.build_batch(50, role="student")
    projects = ProjectFactory.build_batch(10, approved=True, proposer=staff_user)
    proposals = [Proposal(proposer=staff_user, proposed_project=project) for project in projects]
    allocations = [Allocation(allocatee=student, allocated_project=random.choice(projects)) for student in students]
    session.add_all(students)
    session.add_all(projects)
    session.add_all(proposals)
    session.add_all(allocations)
    session.commit()

    response = admin_client.post("/api/allocations/unlock")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    assert all(not allocation.locked for allocation in allocations)
