import factory
from faker import Faker
import json

from ..models import Project, ProjectDetail, ProjectDetailTemplate

_fake = Faker()


class ProjectFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = Project

    title = factory.Faker("sentence")
    description = factory.Faker("paragraph")
    approved = factory.Faker("boolean")

    # Default value for project detail templates passed to details post-generation hook.
    # The part before '__' must be the same as the relationship name.
    details__templates = []

    @factory.post_generation
    def details(self, create, extracted, **kwargs):
        # We only use the build strategy of factory_boy for seeding and testing
        # which makes create and extracted unnecessary.
        assert not create
        assert not extracted

        self.details = [
            ProjectDetailFactory.build(
                key=template.key,
                value__type=template.type,
                value__options=template.options,
                project=self,
                template=template,
            )
            for template in kwargs["templates"]
        ]


class ProjectDetailFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = ProjectDetail

    value__type = None
    value__options = []

    # This factory is used by ProjectFactory.
    @factory.post_generation
    def value(self, create, extracted, **kwargs):
        assert not create
        assert not extracted

        match kwargs["type"]:
            case "textfield":
                self.value = _fake.sentence()
            case "textarea":
                self.value = _fake.paragraph()
            case "number" | "slider":
                self.value = str(_fake.random_int(min=0, max=1000000))
            case "date" | "time":
                self.value = str(_fake.date_time())
            case "switch":
                self.value = "true" if _fake.boolean() else "false"
            case "select" | "radio":
                self.value = _fake.random_element(elements=kwargs["options"])
            case "checkbox":
                self.value = json.dumps(_fake.random_elements(elements=kwargs["options"], unique=True))
            case "categories":
                self.value = json.dumps(_fake.words(nb=5, unique=True))


class ProjectDetailTemplateFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = ProjectDetailTemplate

    @factory.lazy_attribute
    def key(self):
        # Use lazy attribute to respect the unique constraint.
        return _fake.unique.slug()

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
        if self.type not in ["select", "checkbox", "radio", "categories"]:
            return []

        return _fake.words(nb=5, unique=True)

    title = factory.Faker("sentence")
    description = factory.Faker("paragraph")
    message = factory.Faker("sentence")
