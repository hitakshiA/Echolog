from flask import Blueprint
from sqlalchemy import func

from app.domain.models import Analysis, FeedbackItem
from app.extensions import db

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/summary", methods=["GET"])
def get_summary():
    total_feedback = db.session.query(func.count(FeedbackItem.id)).scalar() or 0

    # Subquery for latest analysis per feedback item
    latest_analysis_sq = (
        db.session.query(
            Analysis.feedback_item_id,
            func.max(Analysis.id).label("max_id"),
        )
        .group_by(Analysis.feedback_item_id)
        .subquery()
    )

    latest_analyses = (
        db.session.query(Analysis)
        .join(latest_analysis_sq, Analysis.id == latest_analysis_sq.c.max_id)
        .all()
    )

    total_analyzed = len(latest_analyses)

    # Distributions
    sentiment_distribution: dict[str, int] = {}
    category_distribution: dict[str, int] = {}
    status_distribution: dict[str, int] = {}
    urgency_sum = 0

    for a in latest_analyses:
        sentiment_distribution[a.sentiment] = sentiment_distribution.get(a.sentiment, 0) + 1
        category_distribution[a.category] = category_distribution.get(a.category, 0) + 1
        urgency_sum += a.urgency

    # Status distribution from feedback items
    status_rows = (
        db.session.query(FeedbackItem.status, func.count(FeedbackItem.id))
        .group_by(FeedbackItem.status)
        .all()
    )
    for status, count in status_rows:
        status_distribution[status] = count

    average_urgency = round(urgency_sum / total_analyzed, 2) if total_analyzed > 0 else 0

    # Urgency trend (daily buckets)
    urgency_trend_rows = (
        db.session.query(
            func.date(Analysis.created_at).label("date"),
            func.avg(Analysis.urgency).label("avg_urgency"),
        )
        .join(latest_analysis_sq, Analysis.id == latest_analysis_sq.c.max_id)
        .group_by(func.date(Analysis.created_at))
        .order_by(func.date(Analysis.created_at))
        .all()
    )

    urgency_trend = [
        {"date": str(row.date), "avg_urgency": round(float(row.avg_urgency), 2)}
        for row in urgency_trend_rows
    ]

    return {
        "total_feedback": total_feedback,
        "total_analyzed": total_analyzed,
        "sentiment_distribution": sentiment_distribution,
        "category_distribution": category_distribution,
        "average_urgency": average_urgency,
        "urgency_trend": urgency_trend,
        "status_distribution": status_distribution,
    }
