from datetime import datetime

from pydantic import BaseModel, Field

from app.domain.enums import AnalysisCategory, Sentiment


class AnalysisOutput(BaseModel):
    """Schema for validating LLM output."""

    sentiment: Sentiment
    category: AnalysisCategory
    urgency: int = Field(ge=1, le=5)
    themes: list[str] = Field(min_length=1, max_length=5)
    suggested_action: str = Field(min_length=1)
    summary: str = Field(min_length=1)


class AnalysisResponse(BaseModel):
    id: int
    sentiment: Sentiment
    category: AnalysisCategory
    urgency: int
    themes: list[str]
    suggested_action: str
    summary: str
    model: str
    tokens_used: int
    latency_ms: int
    cost_cents: float
    is_valid: bool
    validation_errors: list[str] | None
    created_at: datetime
