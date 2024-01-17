import json
from typing import Any

from ..models import Config, ConfigRead


def parse_config(config: Config) -> ConfigRead:
    # Need to convert to read model to allow any types during parsing.
    config = ConfigRead.model_validate(config)
    config.value = parse_config_value(config.key, config.value)
    return config


def parse_config_value(key: str, value: str) -> Any:
    match key:
        case "admin_emails":
            return json.loads(value)
        case "max_shortlists" | "max_allocations":
            return int(value)
        case "default_approved" | "proposals_shutdown" | "shortlists_shutdown":
            return value == "true"


def serialize_config_value(key: str, value: Any) -> str:
    match key:
        case "admin_emails":
            return json.dumps(value)
        case "max_shortlists" | "max_allocations":
            return str(value)
        case "default_approved" | "proposals_shutdown" | "shortlists_shutdown":
            return "true" if value else "false"
