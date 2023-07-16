from polyfactory.factories.pydantic_factory import ModelFactory
from faker import Faker
from .models import Shortlist, User, Project

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

    @classmethod
    def email(cls) -> str:
        return cls.__faker__.safe_email()

    @classmethod
    def name(cls) -> str:
        return cls.__faker__.name()

    @classmethod
    def role(cls) -> str:
        return cls.__faker__.random_element(elements=("staff", "student"))


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
    user_id = None

    @classmethod
    def title(cls) -> str:
        return cls.__faker__.sentence()

    @classmethod
    def description(cls) -> str:
        return cls.__faker__.paragraph()


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
