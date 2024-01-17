import json

from fastapi import HTTPException

from ..models import (
    Project,
    ProjectDetailCreate,
    ProjectDetailRead,
    ProjectDetailTemplate,
    ProjectDetailUpdate,
    ProjectReadWithDetails,
)


def parse_project(project: Project) -> ProjectReadWithDetails:
    # Need to convert to read model to allow any types during parsing.
    project = ProjectReadWithDetails.model_validate(project)
    project_details = []
    for detail in project.details:
        detail = parse_project_detail(detail.template, detail)
        project_details.append(detail)
    project.details = project_details
    return project


def parse_project_detail(template: ProjectDetailTemplate, detail: ProjectDetailRead) -> ProjectDetailRead:
    detail = detail.model_copy(deep=True)
    match template.type:
        case "number" | "slider":
            detail.value = int(detail.value)
        case "switch":
            detail.value = detail.value == "true"
        case "checkbox" | "categories":
            detail.value = json.loads(detail.value)
    return detail


def serialize_project_detail(
    template: ProjectDetailTemplate, detail: ProjectDetailCreate | ProjectDetailUpdate
) -> ProjectDetailCreate | ProjectDetailUpdate:
    check_project_detail(template, detail)
    detail = detail.model_copy(deep=True)
    match template.type:
        case "number" | "slider":
            detail.value = str(detail.value)
        case "switch":
            detail.value = "true" if detail.value else "false"
        case "checkbox" | "categories":
            detail.value = json.dumps(detail.value)
    return detail


def check_project_detail(template: ProjectDetailTemplate, detail: ProjectDetailCreate | ProjectDetailUpdate):
    match template.type:
        case "slider":
            if not (0 <= detail.value <= 100):
                raise HTTPException(status_code=400, detail="Invalid project detail value")
        case "select" | "radio":
            if detail.value not in template.options:
                raise HTTPException(status_code=400, detail="Invalid project detail value")
        case "checkbox":
            if not all(option in template.options for option in detail.value):
                raise HTTPException(status_code=400, detail="Invalid project detail value")
