import json

import pytest

from app.services.validation_service import validate_llm_response


def _valid_response(**overrides):
    base = {
        "sentiment": "negative",
        "category": "bug",
        "urgency": 3,
        "themes": ["login", "timeout"],
        "suggested_action": "Fix the login timeout issue immediately",
        "summary": "User reports that the login page is broken and cannot access account.",
    }
    base.update(overrides)
    return json.dumps(base)


class TestJsonParsing:
    def test_valid_json(self):
        output, is_valid, errors = validate_llm_response(_valid_response())
        assert output is not None
        assert is_valid is True
        assert errors == []

    def test_invalid_json(self):
        output, is_valid, errors = validate_llm_response("not json at all")
        assert output is None
        assert is_valid is False
        assert len(errors) == 1
        assert "valid JSON" in errors[0]

    def test_empty_string(self):
        output, is_valid, errors = validate_llm_response("")
        assert output is None
        assert is_valid is False

    def test_markdown_wrapped_json(self):
        output, is_valid, errors = validate_llm_response("```json\n{}\n```")
        assert output is None
        assert is_valid is False


class TestSchemaValidation:
    def test_missing_sentiment(self):
        data = json.loads(_valid_response())
        del data["sentiment"]
        _, is_valid, errors = validate_llm_response(json.dumps(data))
        assert is_valid is False
        assert any("sentiment" in e for e in errors)

    def test_missing_category(self):
        data = json.loads(_valid_response())
        del data["category"]
        _, is_valid, errors = validate_llm_response(json.dumps(data))
        assert is_valid is False
        assert any("category" in e for e in errors)

    def test_missing_urgency(self):
        data = json.loads(_valid_response())
        del data["urgency"]
        _, is_valid, errors = validate_llm_response(json.dumps(data))
        assert is_valid is False
        assert any("urgency" in e for e in errors)

    def test_missing_themes(self):
        data = json.loads(_valid_response())
        del data["themes"]
        _, is_valid, errors = validate_llm_response(json.dumps(data))
        assert is_valid is False
        assert any("themes" in e for e in errors)

    def test_missing_suggested_action(self):
        data = json.loads(_valid_response())
        del data["suggested_action"]
        _, is_valid, errors = validate_llm_response(json.dumps(data))
        assert is_valid is False
        assert any("suggested_action" in e for e in errors)

    def test_missing_summary(self):
        data = json.loads(_valid_response())
        del data["summary"]
        _, is_valid, errors = validate_llm_response(json.dumps(data))
        assert is_valid is False
        assert any("summary" in e for e in errors)

    def test_invalid_sentiment_value(self):
        _, is_valid, errors = validate_llm_response(_valid_response(sentiment="happy"))
        assert is_valid is False
        assert any("sentiment" in e for e in errors)

    def test_invalid_category_value(self):
        _, is_valid, errors = validate_llm_response(_valid_response(category="unknown"))
        assert is_valid is False
        assert any("category" in e for e in errors)

    def test_urgency_too_low(self):
        _, is_valid, errors = validate_llm_response(_valid_response(urgency=0))
        assert is_valid is False
        assert any("urgency" in e for e in errors)

    def test_urgency_too_high(self):
        _, is_valid, errors = validate_llm_response(_valid_response(urgency=6))
        assert is_valid is False
        assert any("urgency" in e for e in errors)

    def test_empty_themes_array(self):
        _, is_valid, errors = validate_llm_response(_valid_response(themes=[]))
        assert is_valid is False
        assert any("themes" in e for e in errors)

    def test_too_many_themes(self):
        themes = ["a", "b", "c", "d", "e", "f"]
        _, is_valid, errors = validate_llm_response(_valid_response(themes=themes))
        assert is_valid is False
        assert any("themes" in e for e in errors)


class TestSemanticValidation:
    def test_urgency_5_with_negative_sentiment(self):
        output, is_valid, errors = validate_llm_response(
            _valid_response(urgency=5, sentiment="negative")
        )
        assert output is not None
        assert is_valid is True

    def test_urgency_5_with_urgent_sentiment(self):
        output, is_valid, errors = validate_llm_response(
            _valid_response(urgency=5, sentiment="urgent")
        )
        assert output is not None
        assert is_valid is True

    def test_urgency_5_with_positive_sentiment_fails(self):
        output, is_valid, errors = validate_llm_response(
            _valid_response(urgency=5, sentiment="positive")
        )
        assert output is not None
        assert is_valid is False
        assert any("urgency=5" in e for e in errors)

    def test_urgency_5_with_neutral_sentiment_fails(self):
        output, is_valid, errors = validate_llm_response(
            _valid_response(urgency=5, sentiment="neutral")
        )
        assert is_valid is False
        assert any("urgency=5" in e for e in errors)

    def test_empty_theme_string(self):
        _, is_valid, errors = validate_llm_response(_valid_response(themes=["login", "  "]))
        assert is_valid is False
        assert any("empty" in e for e in errors)

    def test_theme_too_long(self):
        long_theme = "a" * 51
        _, is_valid, errors = validate_llm_response(_valid_response(themes=[long_theme]))
        assert is_valid is False
        assert any("50 characters" in e for e in errors)

    def test_summary_too_short(self):
        _, is_valid, errors = validate_llm_response(_valid_response(summary="Short"))
        assert is_valid is False
        assert any("10 characters" in e for e in errors)

    def test_summary_too_long(self):
        long_summary = "A" * 501
        _, is_valid, errors = validate_llm_response(_valid_response(summary=long_summary))
        assert is_valid is False
        assert any("500 characters" in e for e in errors)


class TestAllSentiments:
    @pytest.mark.parametrize("sentiment", ["positive", "negative", "neutral", "mixed", "urgent"])
    def test_valid_sentiment(self, sentiment):
        output, is_valid, errors = validate_llm_response(_valid_response(sentiment=sentiment))
        assert output is not None
        # urgency 3 with any sentiment is fine
        assert is_valid is True


class TestAllCategories:
    @pytest.mark.parametrize(
        "category",
        ["bug", "feature_request", "complaint", "praise", "question", "suggestion"],
    )
    def test_valid_category(self, category):
        output, is_valid, errors = validate_llm_response(_valid_response(category=category))
        assert output is not None
        assert is_valid is True
