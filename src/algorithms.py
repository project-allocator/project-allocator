import random
import math
from typing import List

from .config import config
from .models import Project, Shortlist, User

# Number of students per project.
# You can add custom configuration entries to config.yaml and load them here.
students_per_project = config["projects"]["allocations"]["students"]

# Randomly allocate students to projects using `students_per_project` given in config.yaml
# fmt:off
def allocate_projects_random(
    users: List[User],
    projects: List[Project],
    shortlists: List[Shortlist],
):
    # Only allocate students to approved projects
    projects = list(filter(lambda project: project.approved, projects))
    non_allocatees = list(filter(lambda user: user.role == "student" and user.allocated == None, users))
    random.shuffle(non_allocatees)
    for project in projects:
        # Reset students allocated previously
        project.allocatees = []
        project.allocatees += non_allocatees[:students_per_project]
        non_allocatees = non_allocatees[students_per_project:]
    return {"ok": True}


# Randomly allocate students to projects but make sure every student gets allocated to a project
# Ignores the value of `students_per_project` given in config.yaml
# fmt:off
def allocate_projects_random_adaptive(
    users: List[User],
    projects: List[Project],
    shortlists: List[Shortlist],
):
    # Only allocate students to approved projects
    projects = list(filter(lambda project: project.approved, projects))
    non_allocatees = list(filter(lambda user: user.role == "student" and user.allocated == None, users))
    random.shuffle(non_allocatees)
    # Find the number of students per project based on the number of projects available.
    students_per_project = math.ceil(len(non_allocatees) / len(projects))
    for project in projects:
        # Reset students allocated previously
        project.allocatees = []
        project.allocatees += non_allocatees[:students_per_project]
        non_allocatees = non_allocatees[students_per_project:]
    return {"ok": True}


# Allocate students by prioritizing students who shortlisted projects with highest preference.
# Randomly allocate the rest of students if any project has members less than `student_per_project` given in config.yaml
# fmt:off
def allocate_projects_shortlist(
    projects: List[Project], 
    shortlists: List[Shortlist],
    users: List[User],
):    
    # Only allocate students to approved projects
    projects = list(filter(lambda project: project.approved, projects))
    # Allocate shortlisted students to projects
    for project in projects:
        project_shortlists = list(filter(lambda shortlist: shortlist.project_id == project.id, shortlists))
        project_shortlists.sort(key=lambda shortlist: shortlist.preference, reverse=True)
        project_shortlisters = list(map(lambda shortlist: shortlist.user, project_shortlists))
        # Reset students allocated previously
        project.allocatees = []
        project.allocatees = project_shortlisters[: min(students_per_project, len(project_shortlisters))]
    # Allocate missing students to projects
    for project in projects:
        # Changes in SQLModel models are automatically reflected in the related models
        # In this case, adding `user` to `project.allocatees` automatically sets `user.allocated` to `project`,
        # and so filtering users by `user.allocated` is valid here.
        unallocated_users = list(filter(lambda user: user.role == "student" and user.allocated == None, users))
        # If project does not have enough students, allocate the rest
        missing_students = students_per_project - len(project.allocatees)
        if missing_students > 0:
            project.allocatees += random.sample(unallocated_users, min(missing_students, len(unallocated_users)))
    # Reset student's acceptance status
    students = list(filter(lambda user: user.role == "student", users))
    for student in students:
        student.accepted = None
    return {"ok": True}

# Write your own version of allocation code by following the examples above.
# You can also return HTTP errors by raising exception e.g. `raise HTTPException(status_code=401, detail="Error message here.")`
def allocate_projects_custom():
    pass

# Set this variable to the custom function of your choice.
# Make sure that the custom function accepts three arguments: lists of users, projects and shortlists.
# allocate_projects = allocate_projects_custom
allocate_projects = allocate_projects_random
