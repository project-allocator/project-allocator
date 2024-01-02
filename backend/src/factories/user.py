import factory
from faker import Faker

from ..models import User

_fake = Faker()


class UserFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = User

    @factory.lazy_attribute
    def email(self):
        # Use lazy attribute to respect the unique constraint.
        return _fake.unique.safe_email()

    # email = factory.Faker("safe_email", unique=True)
    name = factory.Faker("name")
    role = factory.Faker("random_element", elements=["admin", "staff", "student"])
