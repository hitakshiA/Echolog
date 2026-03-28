# AGENTS.md — EchoLog AI Coding Instructions

## Architecture Rules (NEVER VIOLATE)

1. **Three layers**: Routes → Services → Models. Never skip a layer.
2. **Routes** parse via Pydantic, call service, return Pydantic response. NO business logic.
3. **Services** are plain classes. NO Flask imports. Receive db session as argument.
4. **Models** use SQLAlchemy 2.0 `Mapped[]` + `mapped_column()`. NO legacy `Column()`.
5. **Pydantic v2** validates every API request AND every LLM response.
6. **Zod schemas** mirror Pydantic exactly. Same fields, same constraints.
7. **TanStack Query** for all server state. NO Redux, NO Zustand.
8. **structlog** for logging. NO `print()`.
9. **NO raw SQL** — use SQLAlchemy ORM.
10. **NO `any` types** in TypeScript.
11. **NO hardcoded secrets** — use env vars.

## Project Structure

```
backend/
  app/
    __init__.py          # create_app() factory
    config.py            # Dev/Test/Prod configs
    extensions.py        # db, migrate instances
    domain/
      enums.py           # FeedbackStatus, FeedbackSource, Sentiment, AnalysisCategory
      models.py          # FeedbackItem, Analysis (SQLAlchemy 2.0)
      errors.py          # NotFoundError, InvalidStatusTransition, etc.
      state_machine.py   # VALID_TRANSITIONS, is_valid_transition()
    schemas/
      feedback.py        # Request schemas
      analysis.py        # AnalysisOutput, AnalysisResponse
      feedback_response.py  # FeedbackItemResponse, PaginatedFeedbackResponse
    services/
      feedback_service.py
      analysis_service.py
      llm_service.py
      validation_service.py
    api/
      feedback/routes.py
      analysis/routes.py
      analytics/routes.py
    common/
      error_handlers.py
      middleware.py
      logging.py
  tests/
    unit/
    integration/
    conftest.py
    factories.py
frontend/
  src/
    api/               # Fetch wrapper + TanStack Query hooks
    schemas/           # Zod schemas (mirror Pydantic)
    types/             # TypeScript interfaces
    components/ui/     # Button, Badge, Card, Modal, Input, Select, Textarea
    components/layout/ # AppShell, Navbar
    features/
      dashboard/       # StatsBar, FilterBar, FeedbackTable, AddFeedbackModal
      detail/          # FeedbackDetailPage, ActionBar, AnalysisPanel
      analytics/       # SentimentDonut, CategoryBar, UrgencyTrend
```

## Code Style

- Python: Ruff for linting + formatting, line length 100
- TypeScript: ESLint + strict mode, no `any`
- Commit format: `<type>: <short description>` (feat, fix, test, docs, refactor, chore)
- One feature per commit

## Testing

- All tests use mocked LLM (never real API calls)
- pytest for backend, Vitest + React Testing Library for frontend
- Backend coverage target: 85%+ on services/
- Frontend coverage target: 70%+ on features/

## Forbidden Patterns

- NO `print()` — use structlog
- NO `Column()` — use `mapped_column()`
- NO business logic in routes
- NO Flask imports in services
- NO raw SQL queries
- NO `any` in TypeScript
- NO Redux or Zustand
