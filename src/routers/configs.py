from typing import Annotated
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
import json

from ..dependencies import get_session
from ..models import Config, ConfigRead, ConfigCreate, ConfigUpdate

router = APIRouter(tags=["config"])


def serialize_configs(configs: list[ConfigCreate | ConfigUpdate]):
    for config in configs:
        match config.key:
            case "admin_emails":
                config.value = json.dumps(config.value)
            case "max_shortlists" | "max_allocations":
                config.value = str(config.value)
            case "proposals_shutdown" | "shortlists_shutdown" | "undos_shutdown":
                config.value = "true" if config.value else "false"


def parse_configs(configs: list[Config]):
    for config in configs:
        match config.key:
            case "admin_emails":
                config.value = json.loads(config.value)
            case "max_shortlists" | "max_allocations":
                config.value = int(config.value)
            case "proposals_shutdown" | "shortlists_shutdown" | "undos_shutdown":
                config.value = config.value == "true"


@router.get(
    "/configs",
    response_model=list[ConfigRead],
)
async def read_configs(session: Annotated[Session, Depends(get_session)]):
    configs = session.exec(select(Config)).all()

    parse_configs(configs)
    return configs
