import factory
from faker import Faker

from ..models import Notification

_fake = Faker()


class NotificationFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = Notification

    title = factory.Faker("sentence")
    description = factory.Faker("paragraph")

    @factory.lazy_attribute
    def read_at(self):
        return _fake.random_element(elements=[_fake.date_time_between(start_date="-1y", end_date="now"), None])
