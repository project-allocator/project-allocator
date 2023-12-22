import factory

from ..models import User


class UserFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = User

    email = factory.Faker("safe_email")
    name = factory.Faker("name")
    role = factory.Faker("random_element", elements=["admin", "staff", "student"])
