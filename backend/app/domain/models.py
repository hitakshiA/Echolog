from datetime import datetime

from sqlalchemy import CheckConstraint, ForeignKey, Index, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.domain.enums import AnalysisCategory, FeedbackSource, FeedbackStatus, Sentiment
from app.extensions import db


class FeedbackItem(db.Model):
    __tablename__ = "feedback_items"
    __table_args__ = (
        Index("idx_status", "status"),
        Index("idx_created_at", "created_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    source: Mapped[str | None] = mapped_column(
        SAEnum(FeedbackSource, native_enum=False, length=50),
        nullable=True,
    )
    status: Mapped[str] = mapped_column(
        SAEnum(FeedbackStatus, native_enum=False, length=20),
        nullable=False,
        default=FeedbackStatus.NEW,
    )
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    analyses: Mapped[list["Analysis"]] = relationship(
        back_populates="feedback_item",
        cascade="all, delete-orphan",
        order_by="Analysis.created_at.desc()",
    )

    @property
    def latest_analysis(self) -> "Analysis | None":
        return self.analyses[0] if self.analyses else None


class Analysis(db.Model):
    __tablename__ = "analyses"
    __table_args__ = (
        Index("idx_feedback_item_id", "feedback_item_id"),
        Index("idx_analysis_created_at", "created_at"),
        CheckConstraint("urgency >= 1 AND urgency <= 5", name="ck_urgency_range"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    feedback_item_id: Mapped[int] = mapped_column(
        ForeignKey("feedback_items.id", ondelete="CASCADE"),
        nullable=False,
    )
    sentiment: Mapped[str] = mapped_column(
        SAEnum(Sentiment, native_enum=False, length=20),
        nullable=False,
    )
    category: Mapped[str] = mapped_column(
        SAEnum(AnalysisCategory, native_enum=False, length=30),
        nullable=False,
    )
    urgency: Mapped[int] = mapped_column(nullable=False)
    themes: Mapped[dict] = mapped_column(db.JSON, nullable=False)
    suggested_action: Mapped[str] = mapped_column(Text, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    raw_llm_response: Mapped[str] = mapped_column(Text, nullable=False)
    model: Mapped[str] = mapped_column(nullable=False)
    tokens_used: Mapped[int] = mapped_column(nullable=False)
    latency_ms: Mapped[int] = mapped_column(nullable=False)
    cost_cents: Mapped[float] = mapped_column(nullable=False)
    is_valid: Mapped[bool] = mapped_column(nullable=False)
    validation_errors: Mapped[dict | None] = mapped_column(db.JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=datetime.utcnow)

    feedback_item: Mapped["FeedbackItem"] = relationship(back_populates="analyses")
