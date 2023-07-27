import random
from typing import List
from polyfactory.factories.pydantic_factory import ModelFactory
from faker import Faker

from .models import Shortlist, User, Project
from .config import config

################################################################################
#                                User Factory                                  #
################################################################################


class UserFactory(ModelFactory):
    __model__ = User
    __faker__ = Faker(locale="en_GB")

    # Ignore optional fields
    # otherwise they also get seeded by polyfactory.
    id = None
    created_at = None
    updated_at = None
    allocated_id = None

    @classmethod
    def email(cls) -> str:
        return cls.__faker__.safe_email()

    @classmethod
    def name(cls) -> str:
        return cls.__faker__.name()


################################################################################
#                             Project Factory                                  #
################################################################################


class ProjectFactory(ModelFactory):
    __model__ = Project
    __faker__ = Faker(locale="en_GB")

    # Ignore optional fields
    # otherwise they also get seeded by polyfactory.
    id = None
    created_at = None
    updated_at = None
    proposer_id = None

    @classmethod
    def title(cls) -> str:
        return cls.__faker__.sentence()

    @classmethod
    def description(cls) -> str:
        return cls.__faker__.paragraph()

    @classmethod
    def categories(cls) -> List[str]:
        return [cls.__faker__.word() for _ in range(5)]


# TODO: Dynamically customize factory methods according to the YAML config
# https://stackoverflow.com/questions/285061/how-do-you-programmatically-set-an-attribute
for detail in config["project"]["details"]:
    if detail["type"] in ["select", "checkbox", "radio"]:
        setattr(
            ProjectFactory,
            detail["name"],
            lambda: random.choice(detail["options"]),
        )
    if detail["type"] == "checkbox":
        setattr(
            ProjectFactory,
            detail["name"],
            lambda: random.sample(
                detail["options"],
                random.randint(0, len(detail["options"])),
            ),
        )


################################################################################
#                            Shortlist Factory                                 #
################################################################################


class ShortlistFactory(ModelFactory):
    __model__ = Shortlist
    __faker__ = Faker(locale="en_GB")

    # Ignore optional fields
    # otherwise they also get seeded by polyfactory.
    user_id = None
    project_id = None
    created_at = None
    updated_at = None

    @classmethod
    def preference(cls) -> int:
        return cls.__faker__.random_int(min=1, max=10)
