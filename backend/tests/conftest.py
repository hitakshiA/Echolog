import json
from unittest.mock import MagicMock, patch

import pytest

from app import create_app
from app.extensions import db as _db
from app.services.llm_service import LLMResponse


@pytest.fixture
def app():
    app = create_app("testing")
    with app.app_context():
        _db.create_all()
        yield app
        _db.session.remove()
        _db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def db(app):
    return _db


MOCK_LLM_RESPONSE = json.dumps(
    {
        "sentiment": "negative",
        "category": "bug",
        "urgency": 3,
        "themes": ["login", "timeout"],
        "suggested_action": "Fix the login timeout issue",
        "summary": "User reports the login page is broken and cannot access their account.",
    }
)


@pytest.fixture
def mock_llm():
    response = LLMResponse(
        raw_text=MOCK_LLM_RESPONSE,
        model="gpt-4o-mock",
        tokens_used=150,
        latency_ms=500,
        cost_cents=0.02,
    )
    with patch("app.services.analysis_service.LLMService") as mock_cls:
        mock_instance = MagicMock()
        mock_instance.call.return_value = response
        mock_cls.return_value = mock_instance
        yield mock_instance
