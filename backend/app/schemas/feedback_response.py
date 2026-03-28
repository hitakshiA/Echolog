from datetime import datetime

from pydantic import BaseModel

from app.domain.enums import FeedbackSource, FeedbackStatus
from app.schemas.analysis import AnalysisResponse


class FeedbackItemResponse(BaseModel):
    id: int
    content: str
    source: FeedbackSource | None
    status: FeedbackStatus
    note: str | None
    latest_analysis: AnalysisResponse | None
    created_at: datetime
    updated_at: datetime


class PaginatedFeedbackResponse(BaseModel):
    items: list[FeedbackItemResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
