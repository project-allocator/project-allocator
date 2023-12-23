import factory
from faker import Faker
import json

from ..models import Project, ProjectDetail, ProjectDetailConfig

_fake = Faker()


class ProjectFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = Project

    title = factory.Faker("sentence")
    description = factory.Faker("paragraph")
    approved = factory.Faker("boolean")

    # Default value for configs passed to details post-generation hook.
    details__configs = []

    @factory.post_generation
    def details(self, create, extracted, **kwargs):
        # We only use the build strategy of factory_boy for seeding and testing
        # which makes create and extracted unnecessary.
        assert not create
        assert not extracted

        self.details = [
            ProjectDetailFactory.build(
                key=config.key,
                type=config.type,
                options=config.options,
                project_id=self.id,
            )
            for config in kwargs["configs"]
        ]


class ProjectDetailFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = ProjectDetail

    # This factory is used by ProjectFactory.
    # Attributes such as key, type, options, project_id are provided by ProjectFactory.
    @factory.lazy_attribute
    def value(self):
        match self.type:
            case "textfield":
                return _fake.sentence()
            case "textarea":
                return _fake.paragraph()
            case "number" | "slider":
                return str(_fake.random_int(min=0, max=1000000))
            case "date" | "time":
                return str(_fake.date_time())
            case "switch":
                return "true" if _fake.boolean() else "false"
            case "select" | "radio":
                return _fake.random_element(elements=self.options)
            case "checkbox" | "categories":
                return json.dumps(_fake.random_elements(elements=self.options, unique=True))


class ProjectDetailConfigFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = ProjectDetailConfig

    key = factory.Sequence(lambda n: f"detail-{n}")
    type = factory.Faker(
        "random_element",
        elements=[
            "textfield",
            "textarea",
            "number",
            "slider",
            "date",
            "time",
            "switch",
            "select",
            "checkbox",
            "radio",
            "categories",
        ],
    )
    required = factory.Faker("boolean")

    @factory.lazy_attribute
    def options(self):
        if self.type in ["select", "checkbox", "radio", "categories"]:
            return _fake.words(nb=5, unique=True)

    title = factory.Faker("sentence")
    description = factory.Faker("paragraph")
    message = factory.Faker("sentence")
