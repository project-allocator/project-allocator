from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from ..dependencies import get_session
from ..logger import LoggerRoute
from ..models import Config, ConfigRead, ConfigUpdate
from ..utils.configs import parse_config, serialize_config_value

router = APIRouter(tags=["config"], route_class=LoggerRoute)


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

    return parse_config(config)


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
    if config_data.value is None:
        raise HTTPException(status_code=400, detail="Config value cannot be empty")

    config.value = serialize_config_value(config.type, config_data.value)
    session.add(config)
    session.commit()

    return parse_config(config)
