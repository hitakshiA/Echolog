from flask import Blueprint

from app.domain.errors import (
    InvalidStatusTransitionError,
    LLMConfigError,
    LLMError,
    NotFoundError,
)
from app.domain.models import Analysis, FeedbackItem
from app.extensions import db
from app.schemas.analysis import AnalysisResponse
from app.services.analysis_service import AnalysisService
from app.services.llm_service import LLMService

analysis_bp = Blueprint("analysis", __name__)


def _serialize_analysis(a: Analysis) -> dict:
    return AnalysisResponse(
        id=a.id,
        sentiment=a.sentiment,
        category=a.category,
        urgency=a.urgency,
        themes=a.themes,
        suggested_action=a.suggested_action,
        summary=a.summary,
        model=a.model,
        tokens_used=a.tokens_used,
        latency_ms=a.latency_ms,
        cost_cents=a.cost_cents,
        is_valid=a.is_valid,
        validation_errors=a.validation_errors,
        created_at=a.created_at,
    ).model_dump(mode="json")


@analysis_bp.route("/<int:feedback_id>/analyze", methods=["POST"])
def analyze_feedback(feedback_id: int):
    try:
        llm_service = LLMService()
    except LLMConfigError as e:
        return {
            "error": {
                "code": "LLM_CONFIG_ERROR",
                "message": str(e),
                "details": {},
            }
        }, 503

    service = AnalysisService(db.session, llm_service)

    try:
        analysis = service.analyze(feedback_id)
    except NotFoundError:
        return {
            "error": {
                "code": "NOT_FOUND",
                "message": f"Feedback item {feedback_id} not found",
                "details": {},
            }
        }, 404
    except InvalidStatusTransitionError as e:
        return {
            "error": {
                "code": "INVALID_STATUS_TRANSITION",
                "message": str(e),
                "details": {
                    "current": e.current,
                    "requested": e.requested,
                    "allowed": e.allowed,
                },
            }
        }, 422
    except LLMError as e:
        return {
            "error": {
                "code": "LLM_ERROR",
                "message": str(e),
                "details": {"provider": e.provider},
            }
        }, 502

    return _serialize_analysis(analysis)


@analysis_bp.route("/<int:feedback_id>/history", methods=["GET"])
def get_analysis_history(feedback_id: int):
    item = db.session.get(FeedbackItem, feedback_id)
    if not item:
        return {
            "error": {
                "code": "NOT_FOUND",
                "message": f"Feedback item {feedback_id} not found",
                "details": {},
            }
        }, 404

    analyses = (
        db.session.query(Analysis)
        .filter(Analysis.feedback_item_id == feedback_id)
        .order_by(Analysis.created_at.desc())
        .all()
    )

    return [_serialize_analysis(a) for a in analyses]
