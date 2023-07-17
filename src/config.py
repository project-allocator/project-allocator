from os.path import dirname, abspath
import yaml

ROOT_DIR = dirname(dirname(abspath(__file__)))

with open(f"{ROOT_DIR}/config.yaml") as f:
    config = yaml.safe_load(f)
