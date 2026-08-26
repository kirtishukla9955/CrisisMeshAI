# TESTING.md — Member 4

## What was actually tested in this package (before integration)

Because this package was built in an isolated sandbox with no live Firebase
project, no browser, and no real Anthropic API key, testing here was
limited to **static verification**, not runtime/end-to-end testing:

- ✅ Every backend/shared/AI-agent `.js` file passes `node --check` (valid
  JS syntax, no parse errors).
- ✅ Every frontend `.js`/`.jsx` file passes an `esbuild` syntax/JSX parse
  check (valid JSX, no syntax errors, correct import/export shape).
- ✅ `demo/seed-data/incidents.seed.json` validated as well-formed JSON.
- ✅ `demo/seed-data/seed.js` passes a syntax check.
- ✅ Manual review of every file against the project brief's field/endpoint
  requirements (status enum, endpoint paths, schema shape, human-in-the-loop
  UI requirements).

## What still needs to be tested once integrated (real environment required)

These require a real Firebase project, a running Express server, a browser,
and (for full AI testing) a real `ANTHROPIC_API_KEY` — none of which exist
in the build sandbox. Use this as your integration test checklist:

### Authentication
- [ ] Authority login issues a Firebase ID token with `role: "authority"` claim
- [ ] `requireAuthority` middleware accepts a valid token and rejects a missing/expired one

### Dashboard loading
- [ ] Command Center loads and KPI tiles reflect real Firestore counts (not zero/placeholder)
- [ ] `useIncidents` listener updates live when an incident's `priorityScore` or `status` changes in Firestore

### Incident detail
- [ ] `GET /api/incidents/:id` returns the incident + its reports
- [ ] Raw reports panel renders source badges correctly for `app`/`sms`/`offline_sync`

### Status update
- [ ] `PATCH /api/incidents/:id/status` succeeds for a valid transition
- [ ] Returns `409` for an invalid transition (e.g. `resolved` → `new`)
- [ ] Critical-severity incidents show the confirmation dialog before resolving/rejecting

### Audit trail
- [ ] Every status change, note, and assignment appears in
      `incidents/{id}/history` and renders in both `IncidentTimeline` and `AuditHistory`

### AI report generation
- [ ] `POST /api/post-disaster/report` with a valid `ANTHROPIC_API_KEY` and real incident data returns `generatedBy: "ai"` with a schema-valid report
- [ ] Temporarily unsetting `ANTHROPIC_API_KEY` (or pointing at an invalid key) still returns `201` with `generatedBy: "rule_based_fallback"` — confirms the no-silent-failure guarantee
- [ ] Manually forcing an invalid JSON response (e.g. mock the fetch) confirms schema validation catches it and falls back correctly

### Human review queue
- [ ] Incidents with `aiConfidence < 0.6` or `aiFallbackUsed: true` appear in the Review Queue tab

### UI states
- [ ] Loading skeletons show while incidents/report are fetching
- [ ] Error state renders if the Firestore listener errors out
- [ ] "ALL CLEAR" empty state renders when there are zero incidents
- [ ] Toast notifications appear on successful/failed status updates

### Responsiveness
- [ ] Dashboard is usable at tablet width (per brief §31); desktop is the primary target

### Security
- [ ] No API keys appear in any frontend bundle or browser network tab
- [ ] `.env` is git-ignored in the integrated repo

## Suggested lightweight automated tests (not included, recommended)

If time allows post-integration, the highest-value additions would be:

1. **`ai/postDisasterAgent/schema.test.js`** — unit tests for
   `validatePostDisasterReport` against a few valid/invalid fixtures (fast,
   no network required).
2. **`ai/postDisasterAgent/fallback.test.js`** — unit test that
   `generateFallbackReport` never throws and always returns all required
   fields, given an empty or partial `datasetSummary`.
3. **`backend/validators/incidentValidators.test.js`** — unit tests for
   `validateStatusUpdate`'s transition-checking logic.

These three are pure functions with no Firestore/network dependency, so
they can run in CI without any live credentials — a good fit for a
one-day hackathon timeline where full integration/e2e tests aren't
realistic.
