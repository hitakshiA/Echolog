import structlog
from sqlalchemy.orm import Session

from app.domain.enums import FeedbackStatus
from app.domain.errors import LLMError, NotFoundError
from app.domain.models import Analysis, FeedbackItem
from app.domain.state_machine import is_valid_transition
from app.services.llm_service import LLMService
from app.services.validation_service import ANALYSIS_SYSTEM_PROMPT, validate_llm_response

logger = structlog.get_logger()


class AnalysisService:
    def __init__(self, session: Session, llm_service: LLMService):
        self.session = session
        self.llm_service = llm_service

    def analyze(self, feedback_item_id: int) -> Analysis:
        item = self.session.get(FeedbackItem, feedback_item_id)
        if not item:
            raise NotFoundError("FeedbackItem", feedback_item_id)

        current_status = FeedbackStatus(item.status)
        if not is_valid_transition(current_status, FeedbackStatus.ANALYZING):
            from app.domain.errors import InvalidStatusTransitionError
            from app.domain.state_machine import get_allowed_transitions

            raise InvalidStatusTransitionError(
                current=current_status.value,
                requested=FeedbackStatus.ANALYZING.value,
                allowed=[s.value for s in get_allowed_transitions(current_status)],
            )

        # Transition to analyzing
        item.status = FeedbackStatus.ANALYZING
        self.session.commit()

        try:
            llm_response = self.llm_service.call(ANALYSIS_SYSTEM_PROMPT, item.content)
        except LLMError as e:
            logger.error("analysis_llm_error", feedback_item_id=feedback_item_id, error=str(e))
            item.status = FeedbackStatus.ANALYSIS_FAILED
            analysis = Analysis(
                feedback_item_id=feedback_item_id,
                sentiment="neutral",
                category="question",
                urgency=1,
                themes=[],
                suggested_action="LLM call failed",
                summary=f"Analysis failed: {e}",
                raw_llm_response="",
                model="unknown",
                tokens_used=0,
                latency_ms=0,
                cost_cents=0.0,
                is_valid=False,
                validation_errors=[str(e)],
            )
            self.session.add(analysis)
            self.session.commit()
            return analysis

        output, is_valid, errors = validate_llm_response(llm_response.raw_text)

        if output and is_valid:
            item.status = FeedbackStatus.ANALYZED
            analysis = Analysis(
                feedback_item_id=feedback_item_id,
                sentiment=output.sentiment,
                category=output.category,
                urgency=output.urgency,
                themes=output.themes,
                suggested_action=output.suggested_action,
                summary=output.summary,
                raw_llm_response=llm_response.raw_text,
                model=llm_response.model,
                tokens_used=llm_response.tokens_used,
                latency_ms=llm_response.latency_ms,
                cost_cents=llm_response.cost_cents,
                is_valid=True,
                validation_errors=None,
            )
        elif output and not is_valid:
            # Parsed but semantic validation failed — still save with warnings
            item.status = FeedbackStatus.ANALYZED
            analysis = Analysis(
                feedback_item_id=feedback_item_id,
                sentiment=output.sentiment,
                category=output.category,
                urgency=output.urgency,
                themes=output.themes,
                suggested_action=output.suggested_action,
                summary=output.summary,
                raw_llm_response=llm_response.raw_text,
                model=llm_response.model,
                tokens_used=llm_response.tokens_used,
                latency_ms=llm_response.latency_ms,
                cost_cents=llm_response.cost_cents,
                is_valid=False,
                validation_errors=errors,
            )
        else:
            # Complete parse failure
            item.status = FeedbackStatus.ANALYSIS_FAILED
            analysis = Analysis(
                feedback_item_id=feedback_item_id,
                sentiment="neutral",
                category="question",
                urgency=1,
                themes=[],
                suggested_action="Re-analyze this feedback",
                summary="Analysis failed due to invalid LLM response",
                raw_llm_response=llm_response.raw_text,
                model=llm_response.model,
                tokens_used=llm_response.tokens_used,
                latency_ms=llm_response.latency_ms,
                cost_cents=llm_response.cost_cents,
                is_valid=False,
                validation_errors=errors,
            )

        logger.info(
            "analysis_completed",
            feedback_item_id=feedback_item_id,
            is_valid=analysis.is_valid,
            status=item.status,
            model=analysis.model,
            tokens_used=analysis.tokens_used,
            latency_ms=analysis.latency_ms,
            cost_cents=analysis.cost_cents,
        )

        self.session.add(analysis)
        self.session.commit()
        return analysis

    def get_latest(self, feedback_item_id: int) -> Analysis | None:
        item = self.session.get(FeedbackItem, feedback_item_id)
        if not item:
            raise NotFoundError("FeedbackItem", feedback_item_id)
        return item.latest_analysis

    def get_history(self, feedback_item_id: int) -> list[Analysis]:
        item = self.session.get(FeedbackItem, feedback_item_id)
        if not item:
            raise NotFoundError("FeedbackItem", feedback_item_id)
        return list(item.analyses)
