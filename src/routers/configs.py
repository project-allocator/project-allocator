from typing import Annotated, Any
from fastapi import APIRouter, Body, Depends, HTTPException
from sqlmodel import Session, select
import json

from ..dependencies import get_session
from ..models import Config, ConfigRead

router = APIRouter(tags=["config"])


def serialize_config_value(key: str, value: Any) -> str:
    match key:
        case "admin_emails":
            return json.dumps(value)
        case "max_shortlists" | "max_allocations":
            return str(value)
        case "proposals_shutdown" | "shortlists_shutdown" | "resets_shutdown":
            return "true" if value else "false"


def parse_config_value(key: str, value: str) -> Any:
    match key:
        case "admin_emails":
            return json.loads(value)
        case "max_shortlists" | "max_allocations":
            return int(value)
        case "proposals_shutdown" | "shortlists_shutdown" | "resets_shutdown":
            return value == "true"


@router.get(
    "/configs",
    response_model=list[ConfigRead],
)
async def read_configs(session: Annotated[Session, Depends(get_session)]):
    configs = session.exec(select(Config)).all()

    for config in configs:
        config.value = parse_config_value(config.key, config.value)
    return configs


@router.put(
    "/configs/{key}",
    response_model=ConfigRead,
)
async def update_config(
    key: str,
    value: Any,  # top-level any becomes Query() parameter by default
    session: Annotated[Session, Depends(get_session)],
):
    config = session.get(Config, key)
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")

    config.value = serialize_config_value(key, value)
    session.add(config)
    session.commit()

    config = ConfigRead.model_validate(config)
    config.value = parse_config_value(config.key, config.value)
    return config
