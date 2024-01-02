import random

from .models import (
    User,
    Project,
    Allocation,
    Shortlist,
)


# Randomly allocates students to projects using `max_allocations`.
# Allocates remaining students without allocation to a random project, which may or may not ignore `max_allocations`.
# Ignores the shortlists.
def allocate_projects_random(
    students: list[User],
    projects: list[Project],
    shortlists: list[Shortlist],
    max_allocations: int,
) -> list[Allocation]:
    # Only allocate students to approved projects
    approved_projects = [project for project in projects if project.approved]
    non_allocatees = [student for student in students if student.allocation == None]
    random.shuffle(non_allocatees)

    allocations = []

    # Allocate students to projects according to `max_allocations`.
    for approved_project in approved_projects:
        allocations += [
            Allocation(allocatee=allocatee, allocated_project=approved_project)
            for allocatee in non_allocatees[:max_allocations]
        ]
        non_allocatees = non_allocatees[max_allocations:]

    # Randomly allocate students without allocation to a random project.
    allocatees = [allocation.allocatee for allocation in allocations]
    non_allocatees = [student for student in students if student not in allocatees]
    for non_allocatee in non_allocatees:
        allocations.append(
            Allocation(
                allocatee=non_allocatee,
                allocated_project=random.choice(approved_projects),
            )
        )

    return allocations


# Allocates students to projects by prioritizing students with highest preference in their shortlist.
# Allocates remaining students without allocation to a random project, which may or may not ignore `max_allocations`.
def allocate_projects_shortlist(
    students: list[User],
    projects: list[Project],
    shortlists: list[Shortlist],
    max_allocations: int,
) -> list[Allocation]:
    # Only allocate students to approved projects
    approved_projects = [project for project in projects if project.approved]

    allocations = []

    # Allocate students with highest shortlist preference to projects.
    for approved_project in approved_projects:
        # fmt: off
        project_shortlists = [shortlist for shortlist in shortlists if shortlist.shortlisted_project == approved_project]
        project_shortlists.sort(key=lambda shortlist: shortlist.preference)
        project_shortlisters = [shortlist.shortlister for shortlist in project_shortlists]

        allocations += [
            Allocation(allocatee=allocatee, allocated_project=approved_project)
            for allocatee in project_shortlisters[: min(max_allocations, len(project_shortlisters))]
        ]

    # Randomly allocate students without allocation to a random project.
    allocatees = [allocation.allocatee for allocation in allocations]
    non_allocatees = [student for student in students if student not in allocatees]
    for non_allocatee in non_allocatees:
        allocations.append(
            Allocation(
                allocatee=non_allocatee,
                allocated_project=random.choice(approved_projects),
            )
        )

    return allocations


# Write your own version of allocation code by following the examples above.
# You can also return HTTP errors by raising exception e.g. `raise HTTPException(status_code=401, detail="Error message here.")`
def allocate_projects_custom(
    students: list[User],
    projects: list[Project],
    shortlists: list[Shortlist],
    max_allocations: int,
) -> list[Allocation]:
    return []


# Set this variable to the custom function of your choice.
# Make sure that the custom function accepts three arguments: lists of users, projects and shortlists.
# allocate_projects = allocate_projects_custom
allocate_projects = allocate_projects_random
