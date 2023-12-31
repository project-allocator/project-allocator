import json

from src.models.project import ProjectDetailTemplate


from ..models import (
    Project,
    ProjectReadWithDetails,
    ProjectDetailRead,
    ProjectDetailCreate,
    ProjectDetailUpdate,
)


def parse_project_details(project: Project):
    templates = [detail.template for detail in project.details]
    # Need to convert to read model to allow any types during parsing.
    project = ProjectReadWithDetails.model_validate(project)
    for template, detail in zip(templates, project.details):
        parse_project_detail(template, detail)
    return project


def parse_project_detail(template: ProjectDetailTemplate, detail: ProjectDetailRead):
    match template.type:
        case "number" | "slider":
            detail.value = int(detail.value)
        case "switch":
            detail.value = detail.value == "true"
        case "checkbox" | "categories":
            detail.value = json.loads(detail.value)


def serialize_project_detail(template: ProjectDetailTemplate, detail: ProjectDetailCreate | ProjectDetailUpdate):
    match template.type:
        case "number" | "slider":
            detail.value = str(detail.value)
        case "switch":
            detail.value = "true" if detail.value else "false"
        case "checkbox" | "categories":
            detail.value = json.dumps(detail.value)
