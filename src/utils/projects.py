import json

from ..models import (
    Project,
    ProjectReadWithDetails,
    ProjectDetailRead,
    ProjectDetailCreate,
    ProjectDetailUpdate,
    ProjectDetailTemplate,
)


def parse_project(project: Project) -> ProjectReadWithDetails:
    # Need to keep copy of templates as they are lost in read models.
    templates = [detail.template for detail in project.details]
    # Need to convert to read model to allow any types during parsing.
    project = ProjectReadWithDetails.model_validate(project)
    project_details = []
    for template, detail in zip(templates, project.details):
        detail = parse_project_detail(template, detail)
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
    detail = detail.model_copy(deep=True)
    match template.type:
        case "number" | "slider":
            detail.value = str(detail.value)
        case "switch":
            detail.value = "true" if detail.value else "false"
        case "checkbox" | "categories":
            detail.value = json.dumps(detail.value)
    return detail
