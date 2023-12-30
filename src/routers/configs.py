from typing import Annotated
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session
import json

from ..dependencies import get_session
from ..models import Config, ConfigRead, ConfigUpdate

router = APIRouter(tags=["config"])


def serialize_config(key: str, config: ConfigUpdate):
    match key:
        case "admin_emails":
            config.value = json.dumps(config.value)
        case "max_shortlists" | "max_allocations":
            config.value = str(config.value)
        case "proposals_shutdown" | "shortlists_shutdown" | "resets_shutdown":
            config.value = "true" if config.value else "false"


def parse_config(config: Config):
    match config.key:
        case "admin_emails":
            config.value = json.loads(config.value)
        case "max_shortlists" | "max_allocations":
            config.value = int(config.value)
        case "proposals_shutdown" | "shortlists_shutdown" | "resets_shutdown":
            config.value = config.value == "true"


@router.get(
    "/configs/{key}",
    response_model=ConfigRead,
)
async def read_config(
    key: str,
    session: Annotated[Session, Depends(get_session)],
):
    config = session.get(Config, key)
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")

    parse_config(config)
    return config


@router.put(
    "/configs/{key}",
    response_model=ConfigRead,
)
async def update_config(
    key: str,
    # Cannot use any type for config_data
    # because Body() cannot hold basic types and composite types at the same time.
    config_data: ConfigUpdate,
    session: Annotated[Session, Depends(get_session)],
):
    config = session.get(Config, key)
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")

    serialize_config(key, config_data)
    config.value = config_data.value
    session.add(config)
    session.commit()

    parse_config(config)
    return config
