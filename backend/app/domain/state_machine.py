from app.domain.enums import FeedbackStatus

VALID_TRANSITIONS: dict[FeedbackStatus, list[FeedbackStatus]] = {
    FeedbackStatus.NEW: [FeedbackStatus.ANALYZING],
    FeedbackStatus.ANALYZING: [FeedbackStatus.ANALYZED, FeedbackStatus.ANALYSIS_FAILED],
    FeedbackStatus.ANALYZED: [
        FeedbackStatus.IN_PROGRESS,
        FeedbackStatus.RESOLVED,
        FeedbackStatus.DISMISSED,
    ],
    FeedbackStatus.ANALYSIS_FAILED: [FeedbackStatus.ANALYZING],
    FeedbackStatus.IN_PROGRESS: [FeedbackStatus.RESOLVED, FeedbackStatus.DISMISSED],
    FeedbackStatus.RESOLVED: [FeedbackStatus.IN_PROGRESS],
    FeedbackStatus.DISMISSED: [FeedbackStatus.NEW],
}


def is_valid_transition(current: FeedbackStatus, requested: FeedbackStatus) -> bool:
    return requested in VALID_TRANSITIONS.get(current, [])


def get_allowed_transitions(current: FeedbackStatus) -> list[FeedbackStatus]:
    return VALID_TRANSITIONS.get(current, [])
