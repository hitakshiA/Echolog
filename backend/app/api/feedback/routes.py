from flask import Blueprint, request
from pydantic import ValidationError

from app.domain.errors import InvalidStatusTransitionError, NotFoundError
from app.domain.models import FeedbackItem
from app.extensions import db
from app.schemas.analysis import AnalysisResponse
from app.schemas.feedback import (
    BulkCreateFeedbackRequest,
    CreateFeedbackRequest,
    FeedbackFilters,
    UpdateNoteRequest,
    UpdateStatusRequest,
)
from app.schemas.feedback_response import FeedbackItemResponse, PaginatedFeedbackResponse
from app.services.feedback_service import FeedbackService

feedback_bp = Blueprint("feedback", __name__)


def _service() -> FeedbackService:
    return FeedbackService(db.session)


def _serialize_item(item: FeedbackItem) -> dict:
    latest = None
    if item.latest_analysis:
        a = item.latest_analysis
        latest = AnalysisResponse(
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

    return FeedbackItemResponse(
        id=item.id,
        content=item.content,
        source=item.source,
        status=item.status,
        note=item.note,
        latest_analysis=latest,
        created_at=item.created_at,
        updated_at=item.updated_at,
    ).model_dump(mode="json")


@feedback_bp.route("", methods=["GET"])
def list_feedback():
    try:
        filters = FeedbackFilters(**request.args.to_dict())
    except ValidationError as e:
        return {"error": {"code": "VALIDATION_ERROR", "message": str(e)}}, 422

    result = _service().list(filters)
    items = [_serialize_item(item) for item in result["items"]]

    return PaginatedFeedbackResponse(
        items=items,
        total=result["total"],
        page=result["page"],
        per_page=result["per_page"],
        total_pages=result["total_pages"],
    ).model_dump(mode="json")


@feedback_bp.route("", methods=["POST"])
def create_feedback():
    try:
        body = CreateFeedbackRequest(**request.get_json())
    except ValidationError as e:
        return {"error": {"code": "VALIDATION_ERROR", "message": str(e)}}, 422

    item = _service().create(content=body.content, source=body.source)
    return _serialize_item(item), 201


@feedback_bp.route("/bulk", methods=["POST"])
def bulk_create_feedback():
    try:
        body = BulkCreateFeedbackRequest(**request.get_json())
    except ValidationError as e:
        return {"error": {"code": "VALIDATION_ERROR", "message": str(e)}}, 422

    items_data = [{"content": i.content, "source": i.source} for i in body.items]
    items = _service().bulk_create(items_data)
    return [_serialize_item(item) for item in items], 201


@feedback_bp.route("/<int:item_id>", methods=["GET"])
def get_feedback(item_id: int):
    try:
        item = _service().get(item_id)
    except NotFoundError:
        return {
            "error": {"code": "NOT_FOUND", "message": f"Feedback item {item_id} not found"}
        }, 404

    return _serialize_item(item)


@feedback_bp.route("/<int:item_id>/status", methods=["PATCH"])
def update_status(item_id: int):
    try:
        body = UpdateStatusRequest(**request.get_json())
    except ValidationError as e:
        return {"error": {"code": "VALIDATION_ERROR", "message": str(e)}}, 422

    try:
        item = _service().update_status(item_id, body.status)
    except NotFoundError:
        return {
            "error": {"code": "NOT_FOUND", "message": f"Feedback item {item_id} not found"}
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

    return _serialize_item(item)


@feedback_bp.route("/<int:item_id>/note", methods=["PATCH"])
def update_note(item_id: int):
    try:
        body = UpdateNoteRequest(**request.get_json())
    except ValidationError as e:
        return {"error": {"code": "VALIDATION_ERROR", "message": str(e)}}, 422

    try:
        item = _service().update_note(item_id, body.note)
    except NotFoundError:
        return {
            "error": {"code": "NOT_FOUND", "message": f"Feedback item {item_id} not found"}
        }, 404

    return _serialize_item(item)


@feedback_bp.route("/<int:item_id>", methods=["DELETE"])
def delete_feedback(item_id: int):
    try:
        _service().delete(item_id)
    except NotFoundError:
        return {
            "error": {"code": "NOT_FOUND", "message": f"Feedback item {item_id} not found"}
        }, 404

    return "", 204
