# Live Monitoring Dashboard

React + TypeScript real-time monitoring dashboard built for the Suadeo front-end technical assessment.

## Stack

| Library | Why |
|---|---|
| **Vite** | Fast React + TS tooling (`npm run dev`) |
| **React 18+/19** + **TypeScript** | Required assessment stack (functional components + hooks) |
| **recharts** | Live time-series chart without custom SVG plumbing |
| **@tanstack/react-virtual** | Virtualizes the events list so large buffers stay smooth |

No API keys or secrets are used. The live source is a **simulated stream** (`StreamClient`) that emits continuous events, including occasional malformed payloads and connection drops.

## Quick start

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## What to try

- **Pause / Resume** — feed freezes correctly while paused; KPIs/list stay consistent.
- **Severity + time window** — filters apply over the bounded in-memory buffer.
- **Buffer size / throttle** — tune memory cap and UI update batching (bonus controls).
- **Simulate drop** — triggers reconnect with exponential backoff and a visible status.

## Architecture

```
src/
  components/     # Presentation only (memoized where useful)
  hooks/          # useLiveStream — React state + throttled batching
  services/       # StreamClient — connection lifecycle outside UI
  types/          # Shared TypeScript contracts
  utils/          # Validation (security) + helpers
```

## Performance decisions

- Incoming events land in a **pending queue** and flush on a **throttle interval** (default 100ms) so React does not re-render on every message.
- In-memory buffer is **capped** (default 500; configurable 50–2000).
- Chart animation is disabled; list rows are **virtualized**.
- Hot widgets are wrapped in `React.memo`; derived KPIs/filters use `useMemo`.

## Security decisions

- Every payload passes `validateStreamEvent` before use; invalid messages are dropped.
- Text is sanitized (markup / dangerous characters stripped); **no `dangerouslySetInnerHTML`**.
- Error UI uses generic messages — no internal reconnect details leaked.
- No tokens/secrets in client code, logs, or URLs.
