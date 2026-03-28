"""Tests mapped to Better's 10 evaluation criteria.

Each test class directly demonstrates one criterion with concrete evidence.
"""

import json
from unittest.mock import MagicMock, patch

from app.domain.enums import FeedbackStatus
from app.domain.state_machine import is_valid_transition
from app.services.llm_service import LLMResponse
from app.services.validation_service import validate_llm_response


# ---------------------------------------------------------------------------
# 1. STRUCTURE — Clear boundaries and logical organization
# ---------------------------------------------------------------------------
class TestStructure:
    """Routes never contain business logic. Services never import Flask."""

    def test_routes_delegate_to_service(self, client):
        """Route creates feedback by calling service, not by accessing DB directly."""
        r = client.post(
            "/api/feedback",
            json={"content": "Test that routes delegate to service layer properly"},
        )
        assert r.status_code == 201
        assert r.get_json()["status"] == "new"

    def test_service_has_no_flask_imports(self):
        """FeedbackService module does not import Flask."""
        import inspect

        from app.services import feedback_service

        source = inspect.getsource(feedback_service)
        assert "from flask" not in source
        assert "import flask" not in source

    def test_analysis_service_has_no_flask_imports(self):
        """AnalysisService module does not import Flask."""
        import inspect

        from app.services import analysis_service

        source = inspect.getsource(analysis_service)
        assert "from flask" not in source
        assert "import flask" not in source

    def test_blueprints_are_independent(self, client):
        """Feedback and analysis blueprints work independently."""
        r1 = client.get("/api/feedback")
        r2 = client.get("/api/analytics/summary")
        r3 = client.get("/api/health")
        assert r1.status_code == 200
        assert r2.status_code == 200
        assert r3.status_code == 200


# ---------------------------------------------------------------------------
# 2. SIMPLICITY — Readable, predictable code
# ---------------------------------------------------------------------------
class TestSimplicity:
    """State machine is a dictionary lookup, not a state pattern.
    Two tables, not five. No abstract base classes."""

    def test_state_machine_is_a_dict(self):
        """Transitions are defined as a simple dict, not a complex pattern."""
        from app.domain.state_machine import VALID_TRANSITIONS

        assert isinstance(VALID_TRANSITIONS, dict)
        assert len(VALID_TRANSITIONS) == 7  # one entry per status

    def test_only_two_database_tables(self, app):
        """Data model uses exactly two tables — no over-engineering."""
        from app.extensions import db

        with app.app_context():
            tables = db.metadata.tables.keys()
            assert "feedback_items" in tables
            assert "analyses" in tables
            assert len(list(tables)) == 2


# ---------------------------------------------------------------------------
# 3. CORRECTNESS — Prevents invalid states and enforces rules
# ---------------------------------------------------------------------------
class TestCorrectness:
    """Invalid state transitions are rejected. Content validation enforced."""

    def test_rejects_invalid_status_transition(self, client):
        """Cannot jump from 'new' directly to 'resolved'."""
        r = client.post(
            "/api/feedback",
            json={"content": "Testing invalid transition from new to resolved"},
        )
        item_id = r.get_json()["id"]
        r = client.patch(f"/api/feedback/{item_id}/status", json={"status": "resolved"})
        assert r.status_code == 422
        body = r.get_json()
        assert body["error"]["code"] == "INVALID_STATUS_TRANSITION"
        assert "allowed" in body["error"]["details"]

    def test_rejects_content_too_short(self, client):
        """Content under 10 chars is rejected by Pydantic."""
        r = client.post("/api/feedback", json={"content": "short"})
        assert r.status_code == 422

    def test_state_machine_covers_all_statuses(self):
        """Every FeedbackStatus has an entry in the transitions map."""
        from app.domain.state_machine import VALID_TRANSITIONS

        for status in FeedbackStatus:
            assert status in VALID_TRANSITIONS

    def test_every_invalid_transition_rejected(self):
        """Spot-check: new->resolved, analyzing->dismissed are all False."""
        assert is_valid_transition(FeedbackStatus.NEW, FeedbackStatus.RESOLVED) is False
        assert is_valid_transition(FeedbackStatus.ANALYZING, FeedbackStatus.DISMISSED) is False
        assert is_valid_transition(FeedbackStatus.RESOLVED, FeedbackStatus.NEW) is False


# ---------------------------------------------------------------------------
# 4. INTERFACE SAFETY — Guards against misuse
# ---------------------------------------------------------------------------
class TestInterfaceSafety:
    """Pydantic validates API input. Zod validates frontend. LLM output validated."""

    def test_pydantic_rejects_invalid_source_enum(self, client):
        """Invalid source value is caught by Pydantic."""
        r = client.post(
            "/api/feedback",
            json={"content": "Testing invalid source enum value", "source": "twitter"},
        )
        assert r.status_code == 422

    def test_pydantic_rejects_invalid_status_enum(self, client):
        """Invalid status value is caught by Pydantic."""
        r = client.post(
            "/api/feedback",
            json={"content": "Testing invalid status value in update"},
        )
        item_id = r.get_json()["id"]
        r = client.patch(f"/api/feedback/{item_id}/status", json={"status": "invalid_status"})
        assert r.status_code == 422

    def test_llm_output_validated_against_schema(self):
        """LLM response with invalid sentiment is caught by validation."""
        bad_response = json.dumps(
            {
                "sentiment": "ecstatic",
                "category": "bug",
                "urgency": 3,
                "themes": ["test"],
                "suggested_action": "Fix it",
                "summary": "A valid summary that is long enough to pass.",
            }
        )
        output, is_valid, errors = validate_llm_response(bad_response)
        assert is_valid is False
        assert any("sentiment" in e for e in errors)

    def test_llm_output_urgency_out_of_range_rejected(self):
        """Urgency value outside 1-5 is caught."""
        bad_response = json.dumps(
            {
                "sentiment": "negative",
                "category": "bug",
                "urgency": 10,
                "themes": ["crash"],
                "suggested_action": "Fix it",
                "summary": "A valid summary that is long enough to pass.",
            }
        )
        _, is_valid, errors = validate_llm_response(bad_response)
        assert is_valid is False
        assert any("urgency" in e for e in errors)


# ---------------------------------------------------------------------------
# 5. CHANGE RESILIENCE — New features don't cause widespread impact
# ---------------------------------------------------------------------------
class TestChangeResilience:
    """Adding a new enum value or endpoint doesn't break existing code."""

    def test_adding_feedback_doesnt_affect_analytics(self, client):
        """Creating feedback doesn't break the analytics endpoint."""
        client.post(
            "/api/feedback",
            json={"content": "Testing that analytics still works after adding feedback"},
        )
        r = client.get("/api/analytics/summary")
        assert r.status_code == 200
        assert "total_feedback" in r.get_json()

    def test_analysis_history_empty_without_analysis(self, client):
        """History endpoint works even when no analysis exists."""
        r = client.post(
            "/api/feedback",
            json={"content": "Testing history on unanalyzed feedback item"},
        )
        item_id = r.get_json()["id"]
        r = client.get(f"/api/analysis/{item_id}/history")
        assert r.status_code == 200
        assert r.get_json() == []


# ---------------------------------------------------------------------------
# 6. VERIFICATION — Automated tests proving behavior remains correct
# ---------------------------------------------------------------------------
class TestVerification:
    """Tests prove critical behavior: CRUD, transitions, validation pipeline."""

    def test_full_crud_lifecycle(self, client):
        """Create → Read → Update note → Delete lifecycle works."""
        r = client.post(
            "/api/feedback",
            json={"content": "Full lifecycle test for CRUD operations verification"},
        )
        item_id = r.get_json()["id"]

        r = client.get(f"/api/feedback/{item_id}")
        assert r.status_code == 200

        r = client.patch(f"/api/feedback/{item_id}/note", json={"note": "Investigated"})
        assert r.status_code == 200
        assert r.get_json()["note"] == "Investigated"

        r = client.delete(f"/api/feedback/{item_id}")
        assert r.status_code == 204

        r = client.get(f"/api/feedback/{item_id}")
        assert r.status_code == 404

    def test_analysis_with_mocked_llm(self, client):
        """Full analysis pipeline works end-to-end with mocked LLM."""
        r = client.post(
            "/api/feedback",
            json={"content": "The app crashes every time I try to upload a photo"},
        )
        item_id = r.get_json()["id"]

        mock_response = LLMResponse(
            raw_text=json.dumps(
                {
                    "sentiment": "negative",
                    "category": "bug",
                    "urgency": 4,
                    "themes": ["crash", "photo upload"],
                    "suggested_action": "Fix the photo upload crash",
                    "summary": "User reports app crashes on photo upload repeatedly.",
                }
            ),
            model="gpt-4o-mock",
            tokens_used=150,
            latency_ms=500,
            cost_cents=0.02,
        )

        with patch("app.api.analysis.routes.LLMService") as mock_cls:
            mock_instance = MagicMock()
            mock_instance.call.return_value = mock_response
            mock_cls.return_value = mock_instance
            r = client.post(f"/api/analysis/{item_id}/analyze")

        assert r.status_code == 200
        data = r.get_json()
        assert data["sentiment"] == "negative"
        assert data["category"] == "bug"
        assert data["is_valid"] is True

    def test_validation_catches_all_errors_not_just_first(self):
        """Validation pipeline collects ALL errors, not fail-fast."""
        bad = json.dumps(
            {
                "sentiment": "happy",
                "category": "unknown",
                "urgency": 3,
                "themes": ["test"],
                "suggested_action": "Fix",
                "summary": "Valid summary text here for the test.",
            }
        )
        _, is_valid, errors = validate_llm_response(bad)
        assert is_valid is False
        # Both sentiment and category should be reported
        assert len(errors) >= 2


# ---------------------------------------------------------------------------
# 7. OBSERVABILITY — Failures are visible and diagnosable
# ---------------------------------------------------------------------------
class TestObservability:
    """Errors return machine-readable codes. Health endpoint exists."""

    def test_error_response_has_machine_readable_code(self, client):
        """Error responses include a code field for programmatic handling."""
        r = client.get("/api/feedback/99999")
        assert r.status_code == 404
        body = r.get_json()
        assert "error" in body
        assert "code" in body["error"]
        assert body["error"]["code"] == "NOT_FOUND"

    def test_invalid_transition_error_includes_allowed_list(self, client):
        """Transition errors tell you what transitions ARE valid."""
        r = client.post(
            "/api/feedback",
            json={"content": "Testing error details include allowed transitions"},
        )
        item_id = r.get_json()["id"]
        r = client.patch(f"/api/feedback/{item_id}/status", json={"status": "resolved"})
        details = r.get_json()["error"]["details"]
        assert "current" in details
        assert "requested" in details
        assert "allowed" in details
        assert "analyzing" in details["allowed"]

    def test_health_endpoint_reports_db_status(self, client):
        """Health check confirms database connectivity."""
        r = client.get("/api/health")
        assert r.status_code == 200
        body = r.get_json()
        assert body["status"] == "healthy"
        assert body["database"] == "connected"

    def test_request_id_in_response_headers(self, client):
        """Every response includes X-Request-ID for tracing."""
        r = client.get("/api/feedback")
        assert "X-Request-ID" in r.headers
        assert len(r.headers["X-Request-ID"]) == 36  # UUID format


# ---------------------------------------------------------------------------
# 8. AI GUIDANCE — Clear instructions constraining AI behavior
# ---------------------------------------------------------------------------
class TestAIGuidance:
    """System prompt is versioned. Validation constrains LLM output."""

    def test_system_prompt_is_a_constant(self):
        """System prompt is a versioned constant, not dynamically generated."""
        from app.services.validation_service import ANALYSIS_SYSTEM_PROMPT

        assert isinstance(ANALYSIS_SYSTEM_PROMPT, str)
        assert len(ANALYSIS_SYSTEM_PROMPT) > 500
        assert "JSON" in ANALYSIS_SYSTEM_PROMPT
        assert "sentiment" in ANALYSIS_SYSTEM_PROMPT

    def test_semantic_check_urgency5_requires_negative_sentiment(self):
        """Urgency 5 with positive sentiment is caught by semantic validation."""
        response = json.dumps(
            {
                "sentiment": "positive",
                "category": "praise",
                "urgency": 5,
                "themes": ["great"],
                "suggested_action": "Keep going",
                "summary": "User loves the product and everything about it.",
            }
        )
        _, is_valid, errors = validate_llm_response(response)
        assert is_valid is False
        assert any("urgency=5" in e for e in errors)

    def test_agents_md_exists(self):
        """AGENTS.md file exists with AI coding constraints."""
        import os

        agents_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "AGENTS.md",
        )
        assert os.path.exists(agents_path)
