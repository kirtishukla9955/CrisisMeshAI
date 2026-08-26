# DEPENDENCIES.md — Member 4

Only what's needed for the Authority Dashboard + Post-Disaster AI Agent.
Everything below is already in the project's chosen stack (React, Express,
Firebase) except `recharts`, which is the one new dependency this module
introduces for data visualization.

## Frontend (add to the main project's `frontend` package)

```bash
npm install recharts firebase
```

| Package | Why |
|---|---|
| `recharts` | Severity donut, category bar, response-time chart (`components/charts/*`). Lightweight, no other charting lib is added. |
| `firebase` | Firestore client SDK + Firebase Auth client SDK — required if not already installed for Member 1/2's modules. If already present, skip. |

No UI component library is added — components are hand-built with Tailwind
to match the existing project stack exactly as specified in the brief.

## Backend (add to the main project's `backend` package)

```bash
npm install firebase-admin express
```

| Package | Why |
|---|---|
| `firebase-admin` | Firestore/Auth server SDK. Likely already installed by whoever bootstraps the main server — **do not install a second, conflicting version**; check `package.json` first. |
| `express` | Already required by the project's chosen backend stack — only listed here for completeness if setting up a fresh service. |

No AI SDK package is required — `ai/postDisasterAgent/agent.js` calls the
Anthropic API directly via the built-in `fetch`, avoiding an extra
dependency (Node 18+ has global `fetch`). If the main project targets an
older Node version, either upgrade Node or add `node-fetch` and adjust the
import in `agent.js`.

## Nothing else

No PDF library is added by default (`REPORT EXPORT` in the brief is marked
optional/P1). If PDF export is implemented later, evaluate `pdfkit` or the
project's existing `pdf` tooling rather than adding a second PDF dependency.
