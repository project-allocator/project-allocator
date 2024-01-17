import json
from typing import Any

from ..models import Config, ConfigRead


def parse_config(config: Config) -> ConfigRead:
    # Need to convert to read model to allow any types during parsing.
    config = ConfigRead.model_validate(config)
    config.value = parse_config_value(config.type, config.value)
    return config


def parse_config_value(type: str, value: str) -> Any:
    match type:
        case "json":
            return json.loads(value)
        case "number":
            return int(value)
        case "boolean":
            return value == "true"


def serialize_config_value(type: str, value: Any) -> str:
    match type:
        case "json":
            return json.dumps(value)
        case "number":
            return str(value)
        case "boolean":
            return "true" if value else "false"
