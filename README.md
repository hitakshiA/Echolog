# EchoLog

**AI-Powered Customer Feedback Triage**

EchoLog helps product teams collect, analyze, and act on customer feedback. Paste raw feedback, click Analyze, and get structured insights in seconds: sentiment, category, urgency, themes, and suggested actions. Runs entirely in the browser — no backend required.

**Live Demo**: [https://support-ticket-classification-triage.vercel.app](https://support-ticket-classification-triage.vercel.app)

## Quick Start

```bash
git clone https://github.com/hitakshiA/Echolog.git && cd Echolog/frontend
npm install && npm run dev
```

Open http://localhost:5173. Click the key icon in the navbar to add your OpenAI API key, then start adding and analyzing feedback.

## Architecture

This is a **frontend-only** application. All data is stored in the browser's localStorage. AI analysis calls GPT-5.4 nano directly from the browser via the OpenAI API.

```
frontend/
  src/
    store/           # localStorage persistence, state machine, OpenAI calls
    api/             # TanStack Query hooks (feedback, analysis, analytics)
    schemas/         # Zod validation schemas
    types/           # TypeScript interfaces
    components/ui/   # Button, Badge, Card, Modal, Input, Select, Textarea
    components/layout/ # AppShell, Navbar (with API key management)
    features/
      dashboard/     # StatsBar, FilterBar, FeedbackTable, AddFeedbackModal
      detail/        # FeedbackDetailPage, ActionBar, AnalysisPanel
      analytics/     # SentimentDonut, CategoryBar, UrgencyTrend
```

### How It Works

1. User pastes customer feedback and selects a source
2. Feedback is saved to localStorage with status `new`
3. User clicks **Analyze** — the app calls GPT-5.4 nano directly
4. LLM response is validated through a 3-step pipeline:
   - **JSON Parse** — catch non-JSON responses
   - **Schema Validation** — check field types, enums, constraints
   - **Semantic Checks** — urgency=5 only with negative/urgent sentiment, non-empty themes, summary length
5. Results are saved and displayed: sentiment, category, urgency, themes, suggested action, summary

### State Machine

Every feedback item follows a strict lifecycle:

```
new → analyzing → analyzed → in_progress → resolved
                           → dismissed → new (reopen)
                  analysis_failed → analyzing (retry)
```

Invalid transitions are blocked at the store level.

### Validation

| Boundary | Tool | What it catches |
|----------|------|----------------|
| Frontend forms | Zod + react-hook-form | Invalid types, missing fields, length constraints |
| LLM output | Zod + semantic checks | Bad JSON, wrong enums, urgency out of range, empty themes |

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 19 + TypeScript (strict) | UI framework |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| Typography | DM Sans + Instrument Serif | Body + display fonts |
| State | TanStack Query v5 | Server state management |
| Persistence | localStorage | Client-side data storage |
| AI Model | GPT-5.4 nano | Feedback analysis ($0.20/1M input, $1.25/1M output) |
| Forms | react-hook-form + Zod | Client-side validation |
| Charts | recharts | Analytics visualizations |
| Testing | Vitest + React Testing Library | 34 frontend tests |
| Build | Vite 8 | Dev server + production bundler |
| Hosting | Vercel | Static deployment |

## Testing

```bash
cd frontend && npx vitest run    # 34 tests
```

All tests pass. No real API calls — analysis flow is tested via mocked responses.

## Deployment

The app is deployed on Vercel as a static site. The OpenAI API key can be:
- Set via the key icon in the navbar (stored in localStorage)
- Baked into the build via `VITE_OPENAI_API_KEY` environment variable on Vercel
