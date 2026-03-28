import json

from pydantic import ValidationError

from app.domain.enums import Sentiment
from app.schemas.analysis import AnalysisOutput

ANALYSIS_SYSTEM_PROMPT = """
You are a customer feedback analyst. Your job is to extract structured
insights from raw customer feedback text.

You MUST respond with a JSON object matching this exact schema:
{
  "sentiment": one of ["positive","negative","neutral","mixed","urgent"],
  "category": one of ["bug","feature_request","complaint","praise",
                       "question","suggestion"],
  "urgency": integer 1-5 (1=low, 5=critical),
  "themes": array of 1-5 keyword strings (each under 50 chars),
  "suggested_action": one sentence describing the recommended next step,
  "summary": 2-3 sentence plain language summary of the feedback
}

Rules:
- Respond ONLY with the JSON object. No markdown, no explanation.
- If the feedback is ambiguous, use "neutral" sentiment and "question"
  category.
- Urgency 5 is reserved for: data loss, security issues, service outages.
- Urgency 1 is for: minor suggestions, cosmetic issues, general praise.
- themes should be concrete nouns/phrases, not abstract concepts.
- suggested_action should be actionable: "Fix the login timeout" not
  "Look into the issue".
""".strip()


def validate_llm_response(raw_text: str) -> tuple[AnalysisOutput | None, bool, list[str]]:
    """Validate LLM response through a three-step pipeline.

    Returns:
        (parsed_output, is_valid, errors)
    """
    errors: list[str] = []

    # Step 1: JSON parse
    try:
        parsed = json.loads(raw_text)
    except (json.JSONDecodeError, TypeError) as e:
        return None, False, [f"LLM did not return valid JSON: {e}"]

    # Step 2: Pydantic schema validation
    try:
        output = AnalysisOutput.model_validate(parsed)
    except ValidationError as e:
        for err in e.errors():
            field = ".".join(str(loc) for loc in err["loc"])
            errors.append(f"{field}: {err['msg']}")
        return None, False, errors

    # Step 3: Semantic validation
    semantic_errors = _semantic_checks(output)
    if semantic_errors:
        errors.extend(semantic_errors)

    is_valid = len(errors) == 0
    return output, is_valid, errors


def _semantic_checks(output: AnalysisOutput) -> list[str]:
    errors: list[str] = []

    # Urgency 5 only with negative or urgent sentiment
    if output.urgency == 5 and output.sentiment not in (Sentiment.NEGATIVE, Sentiment.URGENT):
        errors.append(
            f"urgency=5 is only valid with negative or urgent sentiment, got '{output.sentiment}'"
        )

    # Themes must not be empty strings
    for i, theme in enumerate(output.themes):
        if not theme.strip():
            errors.append(f"themes[{i}]: theme must not be empty")
        if len(theme) > 50:
            errors.append(f"themes[{i}]: theme must be under 50 characters")

    # Summary length check (10-500 chars)
    if len(output.summary) < 10:
        errors.append("summary: must be at least 10 characters")
    if len(output.summary) > 500:
        errors.append("summary: must be under 500 characters")

    return errors
