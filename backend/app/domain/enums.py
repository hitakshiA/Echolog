from enum import StrEnum


class FeedbackStatus(StrEnum):
    NEW = "new"
    ANALYZING = "analyzing"
    ANALYZED = "analyzed"
    ANALYSIS_FAILED = "analysis_failed"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class FeedbackSource(StrEnum):
    APP_REVIEW = "app_review"
    SUPPORT_TICKET = "support_ticket"
    SURVEY = "survey"
    SLACK = "slack"
    EMAIL = "email"
    OTHER = "other"


class Sentiment(StrEnum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"
    MIXED = "mixed"
    URGENT = "urgent"


class AnalysisCategory(StrEnum):
    BUG = "bug"
    FEATURE_REQUEST = "feature_request"
    COMPLAINT = "complaint"
    PRAISE = "praise"
    QUESTION = "question"
    SUGGESTION = "suggestion"
