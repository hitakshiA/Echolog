import pytest

from app.domain.enums import FeedbackStatus
from app.domain.state_machine import (
    VALID_TRANSITIONS,
    get_allowed_transitions,
    is_valid_transition,
)


class TestValidTransitions:
    """Test every valid transition returns True."""

    def test_new_to_analyzing(self):
        assert is_valid_transition(FeedbackStatus.NEW, FeedbackStatus.ANALYZING) is True

    def test_analyzing_to_analyzed(self):
        assert is_valid_transition(FeedbackStatus.ANALYZING, FeedbackStatus.ANALYZED) is True

    def test_analyzing_to_analysis_failed(self):
        assert is_valid_transition(FeedbackStatus.ANALYZING, FeedbackStatus.ANALYSIS_FAILED) is True

    def test_analyzed_to_in_progress(self):
        assert is_valid_transition(FeedbackStatus.ANALYZED, FeedbackStatus.IN_PROGRESS) is True

    def test_analyzed_to_resolved(self):
        assert is_valid_transition(FeedbackStatus.ANALYZED, FeedbackStatus.RESOLVED) is True

    def test_analyzed_to_dismissed(self):
        assert is_valid_transition(FeedbackStatus.ANALYZED, FeedbackStatus.DISMISSED) is True

    def test_analysis_failed_to_analyzing(self):
        assert is_valid_transition(FeedbackStatus.ANALYSIS_FAILED, FeedbackStatus.ANALYZING) is True

    def test_in_progress_to_resolved(self):
        assert is_valid_transition(FeedbackStatus.IN_PROGRESS, FeedbackStatus.RESOLVED) is True

    def test_in_progress_to_dismissed(self):
        assert is_valid_transition(FeedbackStatus.IN_PROGRESS, FeedbackStatus.DISMISSED) is True

    def test_resolved_to_in_progress(self):
        assert is_valid_transition(FeedbackStatus.RESOLVED, FeedbackStatus.IN_PROGRESS) is True

    def test_dismissed_to_new(self):
        assert is_valid_transition(FeedbackStatus.DISMISSED, FeedbackStatus.NEW) is True


class TestInvalidTransitions:
    """Test every invalid transition returns False."""

    def test_new_to_resolved(self):
        assert is_valid_transition(FeedbackStatus.NEW, FeedbackStatus.RESOLVED) is False

    def test_new_to_analyzed(self):
        assert is_valid_transition(FeedbackStatus.NEW, FeedbackStatus.ANALYZED) is False

    def test_new_to_in_progress(self):
        assert is_valid_transition(FeedbackStatus.NEW, FeedbackStatus.IN_PROGRESS) is False

    def test_new_to_dismissed(self):
        assert is_valid_transition(FeedbackStatus.NEW, FeedbackStatus.DISMISSED) is False

    def test_analyzing_to_new(self):
        assert is_valid_transition(FeedbackStatus.ANALYZING, FeedbackStatus.NEW) is False

    def test_analyzing_to_resolved(self):
        assert is_valid_transition(FeedbackStatus.ANALYZING, FeedbackStatus.RESOLVED) is False

    def test_analyzed_to_new(self):
        assert is_valid_transition(FeedbackStatus.ANALYZED, FeedbackStatus.NEW) is False

    def test_analyzed_to_analyzing(self):
        assert is_valid_transition(FeedbackStatus.ANALYZED, FeedbackStatus.ANALYZING) is False

    def test_analysis_failed_to_resolved(self):
        assert is_valid_transition(FeedbackStatus.ANALYSIS_FAILED, FeedbackStatus.RESOLVED) is False

    def test_in_progress_to_new(self):
        assert is_valid_transition(FeedbackStatus.IN_PROGRESS, FeedbackStatus.NEW) is False

    def test_resolved_to_new(self):
        assert is_valid_transition(FeedbackStatus.RESOLVED, FeedbackStatus.NEW) is False

    def test_resolved_to_dismissed(self):
        assert is_valid_transition(FeedbackStatus.RESOLVED, FeedbackStatus.DISMISSED) is False

    def test_dismissed_to_resolved(self):
        assert is_valid_transition(FeedbackStatus.DISMISSED, FeedbackStatus.RESOLVED) is False

    def test_same_state_transition(self):
        assert is_valid_transition(FeedbackStatus.NEW, FeedbackStatus.NEW) is False


class TestGetAllowedTransitions:
    def test_new_allowed(self):
        allowed = get_allowed_transitions(FeedbackStatus.NEW)
        assert allowed == [FeedbackStatus.ANALYZING]

    def test_analyzing_allowed(self):
        allowed = get_allowed_transitions(FeedbackStatus.ANALYZING)
        assert set(allowed) == {FeedbackStatus.ANALYZED, FeedbackStatus.ANALYSIS_FAILED}

    def test_analyzed_allowed(self):
        allowed = get_allowed_transitions(FeedbackStatus.ANALYZED)
        assert set(allowed) == {
            FeedbackStatus.IN_PROGRESS,
            FeedbackStatus.RESOLVED,
            FeedbackStatus.DISMISSED,
        }

    def test_all_statuses_have_transitions(self):
        for status in FeedbackStatus:
            assert status in VALID_TRANSITIONS


class TestCompleteness:
    @pytest.mark.parametrize("status", list(FeedbackStatus))
    def test_every_status_in_transitions_map(self, status):
        """Every status should have an entry in VALID_TRANSITIONS."""
        assert status in VALID_TRANSITIONS

    @pytest.mark.parametrize("status", list(FeedbackStatus))
    def test_get_allowed_returns_list(self, status):
        result = get_allowed_transitions(status)
        assert isinstance(result, list)
