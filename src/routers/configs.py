from typing import Annotated
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session

from ..utils.configs import parse_config, serialize_config
from ..dependencies import get_session
from ..models import Config, ConfigRead, ConfigUpdate

router = APIRouter(tags=["config"])


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

    serialize_config(key, config_data)
    config.value = config_data.value
    session.add(config)
    session.commit()

    return parse_config(config)
