from .user import *
from .project import *
from .allocation import *
from .proposal import *
from .shortlist import *
from .status import *
from .notification import *

# # Define project details as custom fields according to config.yaml
# # https://stackoverflow.com/questions/74186458/how-to-dynamically-define-an-sqlmodel-class
# project_details = {
#     detail["name"]: {
#         "textfield": (str, ...),
#         "textarea": (str, ...),
#         "number": (int, ...),
#         "slider": (int, ...),
#         "date": (datetime, ...),
#         "time": (datetime, ...),
#         "switch": (bool, ...),
#         "select": (str, ...),
#         "radio": (str, ...),
#         # Use JSON format to store a list of strings.
#         # PostgreSQL's list type is not supported by Pydantic.
#         "checkbox": (List[str], Field(sa_column=Column(JSON))),
#         # Use JSON format to store a list of strings.
#         # PostgreSQL's list type is not supported by Pydantic.
#         "categories": (Optional[bool], Field(default=None)),
#     }[detail["type"]]
#     # Project details are found in config.yaml under 'projects' > 'details'
#     for detail in config["projects"]["details"]
# }
