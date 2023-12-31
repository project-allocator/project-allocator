import json


from ..models import (
    Config,
    ConfigRead,
    ConfigUpdate,
)


def parse_config(config: Config):
    # Need to convert to read model to allow any types during parsing.
    config = ConfigRead.model_validate(config)
    match config.key:
        case "admin_emails":
            config.value = json.loads(config.value)
        case "max_shortlists" | "max_allocations":
            config.value = int(config.value)
        case "proposals_shutdown" | "shortlists_shutdown":
            config.value = config.value == "true"
    return config


def serialize_config(key: str, config: ConfigUpdate):
    match key:
        case "admin_emails":
            config.value = json.dumps(config.value)
        case "max_shortlists" | "max_allocations":
            config.value = str(config.value)
        case "proposals_shutdown" | "shortlists_shutdown":
            config.value = "true" if config.value else "false"
