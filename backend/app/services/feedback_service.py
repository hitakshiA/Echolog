import math

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.domain.enums import FeedbackSource, FeedbackStatus
from app.domain.errors import InvalidStatusTransitionError, NotFoundError
from app.domain.models import Analysis, FeedbackItem
from app.domain.state_machine import get_allowed_transitions, is_valid_transition
from app.schemas.feedback import FeedbackFilters


class FeedbackService:
    def __init__(self, session: Session):
        self.session = session

    def create(self, content: str, source: FeedbackSource | None = None) -> FeedbackItem:
        item = FeedbackItem(content=content, source=source, status=FeedbackStatus.NEW)
        self.session.add(item)
        self.session.commit()
        return item

    def bulk_create(
        self, items: list[dict[str, str | FeedbackSource | None]]
    ) -> list[FeedbackItem]:
        feedback_items = []
        for item_data in items:
            item = FeedbackItem(
                content=item_data["content"],
                source=item_data.get("source"),
                status=FeedbackStatus.NEW,
            )
            self.session.add(item)
            feedback_items.append(item)
        self.session.commit()
        return feedback_items

    def list(self, filters: FeedbackFilters) -> dict:
        query = self.session.query(FeedbackItem)

        if filters.status:
            query = query.filter(FeedbackItem.status == filters.status)

        if filters.search:
            query = query.filter(FeedbackItem.content.ilike(f"%{filters.search}%"))

        needs_analysis_join = (
            filters.category
            or filters.sentiment
            or filters.urgency_min > 1
            or filters.urgency_max < 5
        )
        if needs_analysis_join:
            query = query.join(
                Analysis,
                (Analysis.feedback_item_id == FeedbackItem.id)
                & (
                    Analysis.id
                    == self.session.query(func.max(Analysis.id))
                    .filter(Analysis.feedback_item_id == FeedbackItem.id)
                    .correlate(FeedbackItem)
                    .scalar_subquery()
                ),
            )

            if filters.category:
                query = query.filter(Analysis.category == filters.category)
            if filters.sentiment:
                query = query.filter(Analysis.sentiment == filters.sentiment)
            if filters.urgency_min > 1:
                query = query.filter(Analysis.urgency >= filters.urgency_min)
            if filters.urgency_max < 5:
                query = query.filter(Analysis.urgency <= filters.urgency_max)

        total = query.count()

        if filters.sort_by == "urgency":
            if not needs_analysis_join:
                query = query.outerjoin(
                    Analysis,
                    (Analysis.feedback_item_id == FeedbackItem.id)
                    & (
                        Analysis.id
                        == self.session.query(func.max(Analysis.id))
                        .filter(Analysis.feedback_item_id == FeedbackItem.id)
                        .correlate(FeedbackItem)
                        .scalar_subquery()
                    ),
                )
            order_col = Analysis.urgency
        else:
            order_col = FeedbackItem.created_at

        if filters.sort_order == "desc":
            query = query.order_by(order_col.desc())
        else:
            query = query.order_by(order_col.asc())

        offset = (filters.page - 1) * filters.per_page
        items = query.offset(offset).limit(filters.per_page).all()
        total_pages = math.ceil(total / filters.per_page) if total > 0 else 1

        return {
            "items": items,
            "total": total,
            "page": filters.page,
            "per_page": filters.per_page,
            "total_pages": total_pages,
        }

    def get(self, item_id: int) -> FeedbackItem:
        item = self.session.get(FeedbackItem, item_id)
        if not item:
            raise NotFoundError("FeedbackItem", item_id)
        return item

    def update_status(self, item_id: int, new_status: FeedbackStatus) -> FeedbackItem:
        item = self.get(item_id)
        current = FeedbackStatus(item.status)

        if not is_valid_transition(current, new_status):
            allowed = get_allowed_transitions(current)
            raise InvalidStatusTransitionError(
                current=current.value,
                requested=new_status.value,
                allowed=[s.value for s in allowed],
            )

        item.status = new_status
        self.session.commit()
        return item

    def update_note(self, item_id: int, note: str) -> FeedbackItem:
        item = self.get(item_id)
        item.note = note
        self.session.commit()
        return item

    def delete(self, item_id: int) -> None:
        item = self.get(item_id)
        self.session.delete(item)
        self.session.commit()
