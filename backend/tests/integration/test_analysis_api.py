import json
from unittest.mock import MagicMock, patch

from app.services.llm_service import LLMResponse

MOCK_ANALYSIS = json.dumps(
    {
        "sentiment": "negative",
        "category": "bug",
        "urgency": 3,
        "themes": ["login", "timeout"],
        "suggested_action": "Fix the login timeout issue",
        "summary": "User reports the login page is broken and cannot access their account.",
    }
)


def _create_feedback(client, content="The login page is broken and I cannot access my account"):
    r = client.post("/api/feedback", json={"content": content})
    return r.get_json()["id"]


class TestAnalyzeFeedback:
    def test_analyze_success(self, client):
        item_id = _create_feedback(client)

        mock_response = LLMResponse(
            raw_text=MOCK_ANALYSIS,
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
        assert data["urgency"] == 3
        assert data["themes"] == ["login", "timeout"]
        assert data["is_valid"] is True
        assert data["model"] == "gpt-4o-mock"

    def test_analyze_not_found(self, client):
        with patch("app.api.analysis.routes.LLMService") as mock_cls:
            mock_cls.return_value = MagicMock()
            r = client.post("/api/analysis/999/analyze")
        assert r.status_code == 404

    def test_analyze_invalid_llm_response(self, client):
        item_id = _create_feedback(client)

        mock_response = LLMResponse(
            raw_text="not valid json at all",
            model="gpt-4o-mock",
            tokens_used=50,
            latency_ms=200,
            cost_cents=0.01,
        )

        with patch("app.api.analysis.routes.LLMService") as mock_cls:
            mock_instance = MagicMock()
            mock_instance.call.return_value = mock_response
            mock_cls.return_value = mock_instance

            r = client.post(f"/api/analysis/{item_id}/analyze")

        assert r.status_code == 200
        data = r.get_json()
        assert data["is_valid"] is False

    def test_reanalyze_after_failure(self, client):
        item_id = _create_feedback(client)

        # First: fail
        bad_response = LLMResponse(
            raw_text="bad json",
            model="gpt-4o-mock",
            tokens_used=50,
            latency_ms=200,
            cost_cents=0.01,
        )
        with patch("app.api.analysis.routes.LLMService") as mock_cls:
            mock_instance = MagicMock()
            mock_instance.call.return_value = bad_response
            mock_cls.return_value = mock_instance
            client.post(f"/api/analysis/{item_id}/analyze")

        # Second: succeed (re-analyze from analysis_failed)
        good_response = LLMResponse(
            raw_text=MOCK_ANALYSIS,
            model="gpt-4o-mock",
            tokens_used=150,
            latency_ms=500,
            cost_cents=0.02,
        )
        with patch("app.api.analysis.routes.LLMService") as mock_cls:
            mock_instance = MagicMock()
            mock_instance.call.return_value = good_response
            mock_cls.return_value = mock_instance
            r = client.post(f"/api/analysis/{item_id}/analyze")

        assert r.status_code == 200
        assert r.get_json()["is_valid"] is True


class TestAnalysisHistory:
    def test_history_empty(self, client):
        item_id = _create_feedback(client)
        r = client.get(f"/api/analysis/{item_id}/history")
        assert r.status_code == 200
        assert r.get_json() == []

    def test_history_after_analyze(self, client):
        item_id = _create_feedback(client)

        mock_response = LLMResponse(
            raw_text=MOCK_ANALYSIS,
            model="gpt-4o-mock",
            tokens_used=150,
            latency_ms=500,
            cost_cents=0.02,
        )
        with patch("app.api.analysis.routes.LLMService") as mock_cls:
            mock_instance = MagicMock()
            mock_instance.call.return_value = mock_response
            mock_cls.return_value = mock_instance
            client.post(f"/api/analysis/{item_id}/analyze")

        r = client.get(f"/api/analysis/{item_id}/history")
        assert r.status_code == 200
        history = r.get_json()
        assert len(history) == 1
        assert history[0]["sentiment"] == "negative"

    def test_history_not_found(self, client):
        r = client.get("/api/analysis/999/history")
        assert r.status_code == 404
