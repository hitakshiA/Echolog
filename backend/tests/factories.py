import factory

from app.domain.enums import FeedbackStatus
from app.domain.models import Analysis, FeedbackItem
from app.extensions import db


class FeedbackItemFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = FeedbackItem
        sqlalchemy_session = None
        sqlalchemy_session_persistence = "commit"

    content = factory.Faker("paragraph", nb_sentences=3)
    source = "support_ticket"
    status = FeedbackStatus.NEW

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        cls._meta.sqlalchemy_session = db.session
        return super()._create(model_class, *args, **kwargs)


class AnalysisFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = Analysis
        sqlalchemy_session = None
        sqlalchemy_session_persistence = "commit"

    feedback_item = factory.SubFactory(FeedbackItemFactory)
    feedback_item_id = factory.LazyAttribute(lambda o: o.feedback_item.id)
    sentiment = "negative"
    category = "bug"
    urgency = 3
    themes = ["login", "timeout"]
    suggested_action = "Fix the login timeout"
    summary = "User reports the login page is broken and cannot access their account."
    raw_llm_response = "{}"
    model = "gpt-4o-mock"
    tokens_used = 150
    latency_ms = 500
    cost_cents = 0.02
    is_valid = True
    validation_errors = None

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        cls._meta.sqlalchemy_session = db.session
        return super()._create(model_class, *args, **kwargs)
