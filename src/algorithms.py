import random
import math

from .models import (
    User,
    Project,
    Allocation,
    Shortlist,
)


# Randomly allocate students to projects using `allocations_per_project` given in config.yaml
def allocate_projects_random(
    users: list[User],
    projects: list[Project],
    shortlists: list[Shortlist],
    allocations_per_project: int,
):
    # Only allocate students to approved projects
    projects = [project for project in projects if project.approved]
    non_allocatees = [user for user in users if user.role == "student" and user.allocation == None]
    random.shuffle(non_allocatees)

    for project in projects:
        # Reset students allocated previously
        project.allocations = []
        project.allocations += [
            Allocation(allocatee=allocatee, allocated_project=project)
            for allocatee in non_allocatees[:allocations_per_project]
        ]
        non_allocatees = non_allocatees[allocations_per_project:]

    return {"ok": True}


# Randomly allocate students to projects but make sure every student gets allocated to a project
# Ignores the value of `allocations_per_project` given in config.yaml
def allocate_projects_random_adaptive(
    users: list[User],
    projects: list[Project],
    shortlists: list[Shortlist],
    allocations_per_project: int,
):
    # Only allocate students to approved projects
    projects = list(filter(lambda project: project.approved, projects))
    non_allocatees = list(filter(lambda user: user.role == "student" and user.allocated == None, users))
    random.shuffle(non_allocatees)
    # Find the number of students per project based on the number of projects available.
    allocations_per_project = math.ceil(len(non_allocatees) / len(projects))
    for project in projects:
        # Reset students allocated previously
        project.allocatees = []
        project.allocatees += non_allocatees[:allocations_per_project]
        non_allocatees = non_allocatees[allocations_per_project:]
    return {"ok": True}


# Allocate students by prioritizing students who shortlisted projects with highest preference.
# Randomly allocate the rest of students if any project has members less than `student_per_project` given in config.yaml
def allocate_projects_shortlist(
    projects: list[Project],
    shortlists: list[Shortlist],
    users: list[User],
    allocations_per_project: int,
):
    # Only allocate students to approved projects
    projects = [project for project in projects if project.approved]

    # Allocate shortlisted students to projects
    for project in projects:
        project_shortlists = [shortlist for shortlist in shortlists if shortlist.shortlisted_project == project]
        project_shortlists.sort(key=lambda shortlist: shortlist.preference, reverse=True)
        project_shortlisters = [shortlist.shortlister for shortlist in project_shortlists]

        # Reset students allocated previously
        project.allocations = []
        project.allocations = [
            Allocation(allocatee=allocatee, allocated_project=project)
            for allocatee in project_shortlisters[: min(allocations_per_project, len(project_shortlisters))]
        ]

    # Allocate missing students to projects
    for project in projects:
        unallocated_users = [user for user in users if user.role == "student" and user.allocation == None]

        # If project does not have enough students, allocate the rest
        missing_students = allocations_per_project - len(project.allocations)
        if missing_students > 0:
            project.allocations += [
                Allocation(allocatee=user, allocated_project=project)
                for user in random.sample(unallocated_users, min(missing_students, len(unallocated_users)))
            ]

    return {"ok": True}


# Write your own version of allocation code by following the examples above.
# You can also return HTTP errors by raising exception e.g. `raise HTTPException(status_code=401, detail="Error message here.")`
def allocate_projects_custom():
    pass


# Set this variable to the custom function of your choice.
# Make sure that the custom function accepts three arguments: lists of users, projects and shortlists.
# allocate_projects = allocate_projects_custom
allocate_projects = allocate_projects_random
