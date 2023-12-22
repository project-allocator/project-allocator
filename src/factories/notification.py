import factory

from ..models import Notification


class NotificationFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = Notification

    title = factory.Faker("sentence")
    description = factory.Faker("paragraph")
    read_at = factory.Faker("date_time_between", start_date="-1y", end_date="now")
