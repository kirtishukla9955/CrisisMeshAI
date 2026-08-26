# CrisisMesh AI — Member 4

**Authority Dashboard + Post-Disaster AI Agent**

## What this module does

The authority-facing side of CrisisMesh AI: a command-center dashboard for
disaster management authorities to see live incidents, review AI-generated
priority scores with visible confidence, act on incidents (assign, escalate,
resolve), and generate a structured post-disaster analytical report — with
a deterministic rule-based fallback whenever the AI call fails, so nothing
is ever silently lost.

Built as Member 4's slice of a 4-person, one-day hackathon MVP (see the
project brief). Consumes incident/report data produced by Members 1–3;
owns incident status, audit history, and post-disaster reporting.

## Tech stack

- Frontend: React + Tailwind CSS, Recharts for charts
- Backend: Node.js + Express.js
- Database: Firebase Firestore (+ Firebase Authentication)
- AI: Claude API (Anthropic), structured JSON output, rule-based fallback
- No other dependencies added beyond what's listed in `DEPENDENCIES.md`

## Folder structure

```
CrisisMesh-Member4/
├── README.md                     (this file)
├── INTEGRATION_GUIDE.md          start here to integrate into the main repo
├── API.md                        endpoint reference
├── DEPENDENCIES.md
├── TESTING.md
├── INTEGRATION_CHECKLIST.md
├── ENV.example
├── frontend/
│   ├── package.json               dependencies this slice adds (recharts; react/firebase as peer deps)
│   └── authority/                 pages, components, services, hooks, utils, styles
├── backend/
│   ├── package.json               dependencies this slice adds (express, firebase-admin)
│   └── routes, controllers, services, middleware, validators, utils
├── ai/postDisasterAgent/         agent.js, prompts.js, schema.js, fallback.js, README.md
├── firestore/                    collections.md, indexes.md, security-rules-snippet.txt
├── shared/                       schemas/, constants/, DATA_CONTRACT.md
├── demo/seed-data/               DEMO DATA ONLY — see its own note below
└── screenshots/                  see NOTE.md — not included, see why
```

## How to run it (standalone, for review before integration)

This package is a *slice* of a larger app. `frontend/package.json` and
`backend/package.json` exist to document exactly which dependencies this
slice needs (see `DEPENDENCIES.md`) — they are reference manifests to merge
into the main project's existing `package.json` files, not standalone apps
to `npm install && npm start` in isolation (there's no server entry file or
bundler config here by design). To sanity-check the code before
integrating:

```bash
# Syntax-check backend/shared/ai files
node --check backend/**/*.js

# Syntax-check frontend files (requires esbuild, installed on demand)
npx esbuild frontend/authority/**/*.jsx --bundle=false --outfile=/dev/null
```

Both were run during development of this package — see `TESTING.md` for
exactly what was and wasn't verified this way.

Once integrated into the main project (see `INTEGRATION_GUIDE.md`), run it
with whatever the main project's existing scripts are, typically:
```bash
npm install
npm run dev
```

## How to integrate

Read `INTEGRATION_GUIDE.md` in full before copying anything — it has an
exact file-by-file destination table and the specific lines to add to the
main project's existing server bootstrap and frontend router.

## APIs

See `API.md`. Summary: `GET/PATCH /api/incidents*`,
`POST/GET /api/post-disaster/report*`.

## Environment variables

See `ENV.example`. Needs `ANTHROPIC_API_KEY` (AI report generation) and the
standard Firebase Admin credentials.

## Firestore collections

See `firestore/collections.md`. Member 4 reads the shared `incidents` and
`reports` collections (owned by Members 1–3) and owns
`incidents/{id}/history` and `postDisasterReports`.

## AI architecture

See `ai/postDisasterAgent/README.md`. Short version: aggregate incident data
→ Claude API with a JSON-only system prompt → schema validation → on any
failure (timeout, bad JSON, invalid schema, missing API key), fall through
to a deterministic rule-based report generator. The dashboard always shows
which path produced a given report.

## Demo data

`demo/seed-data/incidents.seed.json` + `seed.js` — clearly marked demo-only,
6 realistic incidents across the categories in the brief (trapped, medical,
food/water, infrastructure, flood). Do not run `seed.js` against a
production project.

## Honesty note on testing and screenshots

This package was built and syntax-validated in an isolated development
sandbox with **no live Firebase project, no browser, and no real Anthropic
API key available** — see `TESTING.md` for the precise list of what was
checked (all files pass syntax/lint checks; JSON seed data validated) versus
what still needs verification once wired into a real Firebase project
(end-to-end auth flow, live Firestore listeners, the actual AI call, and
visual QA of the dashboard in a browser). Screenshots are not included for
the same reason — capturing them requires a running app with real data,
which only the integrator's environment can provide. `screenshots/NOTE.md`
explains what to capture and how, once the module is live.
