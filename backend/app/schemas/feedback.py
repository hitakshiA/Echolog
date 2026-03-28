from typing import Literal

from pydantic import BaseModel, Field

from app.domain.enums import AnalysisCategory, FeedbackSource, FeedbackStatus, Sentiment


class CreateFeedbackRequest(BaseModel):
    content: str = Field(min_length=10, max_length=10000)
    source: FeedbackSource | None = None


class BulkCreateFeedbackRequest(BaseModel):
    items: list[CreateFeedbackRequest] = Field(min_length=1, max_length=50)


class UpdateStatusRequest(BaseModel):
    status: FeedbackStatus


class UpdateNoteRequest(BaseModel):
    note: str = Field(max_length=2000)


class FeedbackFilters(BaseModel):
    status: FeedbackStatus | None = None
    category: AnalysisCategory | None = None
    sentiment: Sentiment | None = None
    urgency_min: int = Field(default=1, ge=1, le=5)
    urgency_max: int = Field(default=5, ge=1, le=5)
    search: str | None = Field(default=None, max_length=200)
    sort_by: Literal["created_at", "urgency"] = "created_at"
    sort_order: Literal["asc", "desc"] = "desc"
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=100)
