# CrisisMesh AI — Member 4 (Round 2)

**Authority Dashboard + Post-Disaster AI Agent**

SOURCE OF TRUTH: "CrisisMesh AI — Full-Stack Build Guide — Round 2." This
package implements Member 4's slice against that guide, not the Round 1
project brief — see `shared/DATA_CONTRACT.md` for what changed and why.

## What this is, in plain English

CrisisMesh AI collects disaster reports from citizens (app, SMS, offline
sync) and uses AI to cluster and prioritize them into incidents. Member 4
is the half of the app a district disaster-management authority actually
sits in front of: a command-center dashboard showing what's happening right
now, tools to acknowledge/progress/resolve incidents with a full audit
trail, and a second AI agent that turns a resolved period into a
plain-language after-action report for planning purposes.

The one idea that shapes every design decision here: **AI assists, it
never silently decides.** Every AI-derived value on screen — a priority
score, a confidence level, a post-disaster summary — is visibly labeled as
AI-generated or a deterministic rule-based fallback, and low-confidence or
fallback-scored incidents are automatically surfaced to a human review
queue rather than acted on autonomously.

### Why the fallback matters

The Post-Disaster AI Agent calls the Anthropic API to generate an
after-action report. That call can fail for ordinary reasons — no API key
configured, a timeout, a rate limit, a malformed response. If it does, the
dashboard does **not** show an error page or an empty report: it falls
back to a deterministic, non-AI report generator that computes the same
statistics (incident counts, worst-hit areas, response times) from the
same underlying data using plain arithmetic, and labels the result
"Rule-Based Fallback" so the authority always knows which path produced
what they're looking at. This is tested directly — `backend/tests/aiAgentNoApiKey.test.js`
deletes the API key and asserts the agent still returns a valid report.

## Tech stack

- Frontend: React + Tailwind CSS, `lucide-react` for icons, `recharts` for the one chart on the post-disaster report
- Backend: Node.js + Express.js
- Database: Firebase Firestore + Firebase Authentication
- AI: Claude API (Anthropic), structured JSON output, deterministic rule-based fallback
- Tests: Node's built-in `node:test` — zero new test-framework dependency

## Folder structure

```
CrisisMesh-Member4/
├── README.md                     (this file)
├── INTEGRATION_GUIDE.md          start here to integrate into the main repo
├── API.md                        endpoint reference, matches the code exactly
├── DEPENDENCIES.md
├── TESTING.md                    what's tested, what isn't, and why
├── INTEGRATION_CHECKLIST.md
├── ENV.example
├── scripts/validate.js           cross-platform static validation (see TESTING.md)
├── frontend/authority/
│   ├── package.json               recharts + lucide-react (react/firebase as peer deps)
│   ├── pages/                     CommandCenterPage, IncidentDetailsPage, PostDisasterPage
│   ├── components/                21 components — dashboard, incident detail, post-disaster report
│   ├── hooks/                     useIncidents, useIncident, useAlertsFeed, usePostDisasterReport
│   ├── services/                  api.js, incidentService.js, reportService.js, authorityService.js
│   ├── utils/                     constants.js (canonical enums + UI styling), formatters.js
│   └── styles/theme.css           design tokens: navy base, red/orange/yellow severity
├── backend/
│   ├── package.json               express + firebase-admin
│   ├── routes/ controllers/ services/ middleware/ validators/ utils/
│   └── tests/                     44 tests, node:test, zero new dependencies
├── ai/postDisasterAgent/          agent.js, prompts.js, schema.js, fallback.js, README.md
├── firestore/                     collections.md, indexes.md, security-rules-snippet.txt
├── shared/
│   ├── constants/statuses.js      canonical status/confidence/tag enums — THE source of truth
│   ├── normalizeIncident.js       THE read-boundary adapter — legacy-to-canonical mapping lives here ONLY
│   ├── schemas/incidentSchema.js  JSDoc typedefs
│   └── DATA_CONTRACT.md           who owns what field, across all 4 members
└── demo/seed-data/                6 incidents, 7 reports, 3 volunteers, seeded audit history — DEMO DATA ONLY
```

## Member 4 Integration Boundaries

This is the part that matters most for the rest of the team. Member 4
**reads** `incidents`, `reports`, and `volunteers` (all owned by other
members) and **writes** only `incidents.status`, the
`incidents/{id}/history` audit subcollection, and `insight_reports`. It
never generates a priority score, clusters a report, matches a volunteer,
or renders a map — those stay entirely inside Members 1–3's code.

- **Member 1 (report intake)** — Member 4 reads `reports` documents
  (via `incident.reportIds[]`, not a foreign key) to show raw reports on
  the incident detail page and to derive response-time statistics. Member
  4 never writes to `reports` and never duplicates the Quick Report form —
  `components/QuickReportPanel.jsx` is a UI shell that calls
  `onOpenQuickReport()`, a prop Member 1's real intake flow is expected to
  provide at integration time. Until that's wired up, the panel shows a
  clearly-labeled "not connected" state instead of pretending to submit
  a report.

- **Member 2 (live map)** — Member 4 reads `incident.centerLocation` to
  plot incidents but does not implement any map rendering itself.
  `components/LiveCrisisMap.jsx` is an integration boundary: pass Member
  2's actual Leaflet component in via the `MapComponent` prop and it
  renders that; without it, the component renders a plainly-labeled
  non-geographic placeholder (schematic dot positions, not a real
  projection) so it can never be mistaken for a live map.

- **Member 3 (AI prioritization + volunteer matching)** — Member 4 reads
  every AI-derived incident field (`priorityScore`, `confidence`,
  `scoringMethod`, `severitySummary`, `neededSkills`, `suggestedVolunteers`)
  and never writes any of them. The one exception that looks like it might
  cross this line but doesn't: `POST /api/incidents/:id/confirm-volunteer`
  lets an authority confirm one of Member 3's suggestions — but this only
  writes an audit event (`type: "volunteer_confirmed"`), never a field on
  the incident document itself. Member 3's `suggestedVolunteers` array is
  never overwritten by Member 4.

See `shared/DATA_CONTRACT.md` for the field-by-field ownership table this
summary is based on.

## How to run it (standalone, for review before integration)

This package is a *slice* of a larger app — `frontend/package.json` and
`backend/package.json` exist to document dependencies precisely, not to
`npm start` a standalone app (there's no server entry file or bundler
config here by design). To validate the code before integrating:

```bash
cd backend
npm install          # or npm ci, using the committed package-lock.json
npm test              # runs all 44 backend tests (node:test)
npm run check          # runs scripts/validate.js — cross-platform, see below
```

`scripts/validate.js` is a single Node script (no shell glob dependency,
so it behaves identically on macOS/Linux/Windows) that checks JS syntax,
JSON validity, the full test suite, and (best-effort) a frontend bundle
resolve. See `TESTING.md` for exactly what it does and doesn't prove.

## How to integrate

Read `INTEGRATION_GUIDE.md` in full before copying anything.

## APIs

See `API.md`. `GET/PATCH /api/incidents*`, `POST /api/incidents/:id/notes`,
`POST /api/incidents/:id/confirm-volunteer`,
`POST/GET /api/post-disaster/report*`.

## Environment variables

See `ENV.example` — `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` (optional),
standard Firebase Admin credentials, `VITE_API_BASE_URL`.

## Firestore collections

See `firestore/collections.md`. Reads `incidents`, `reports`, `volunteers`
(all owned by other members). Owns `incidents/{id}/history` and
`insight_reports` — the canonical post-disaster collection name in Round 2
(the Round 1 name `postDisasterReports` is retired).

## AI architecture

See `ai/postDisasterAgent/README.md`. Aggregate resolved-incident data →
Claude API with an 8-second timeout and a JSON-only system prompt →
schema validation → on any failure at any step, fall through to a
deterministic rule-based generator. The dashboard always shows which path
produced a given report.

## Demo data

`demo/seed-data/*.seed.json` + `seed.js` — 6 incidents (critical, high,
moderate severities; new/acknowledged/in_progress/resolved statuses;
AI-scored and fallback-scored examples), 7 reports, 3 volunteers, and
seeded audit history for the two resolved incidents so post-disaster
response-time calculations have real data to work with. Every incident and
report in this seed data normalizes with zero legacy-mapping warnings
(verified by `backend/tests/seedData.test.js`) — it's fully canonical, not
carried over from Round 1. Do not run `seed.js` against a production
project.

## Honesty note on testing

This package was built and validated in a sandbox with **no live Firebase
project, no browser, and no real Anthropic API key**. Everything in this
README about "44 tests passing" or "the bundle resolves cleanly" refers to
static analysis and unit tests, not a running application. See
`TESTING.md` for the exact, itemized breakdown of what was verified by
automated tests versus what still requires a real Firebase project, a real
Anthropic API key, or manual browser testing before this ships.
