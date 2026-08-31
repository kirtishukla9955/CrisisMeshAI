# TESTING.md — Member 4 (Round 2)

This document separates four distinct categories, on purpose, because
conflating them is how "it works" claims go wrong:

- **✅ Automated/static** — actually run in this sandbox, with output shown below
- **🖥️ Local runtime (no credentials)** — would need a running Node process but no external service
- **🔑 Requires real Firebase credentials**
- **🔑 Requires a real Anthropic API key**
- **🌐 Requires a browser / manual visual verification**

**No browser exists in the environment this package was built in, and no
live Firebase project or Anthropic API key was available.** Every claim
below is scoped accordingly — nothing in this document should be read as
"the app has been run and works."

## ✅ Automated/static — actually executed, results below

Run via `node scripts/validate.js` from the package root, or `npm test` /
`npm run check` from `backend/`. Last actual run:

```
[1/4] Checking JS syntax on 24 files under backend/, ai/, shared/...
  All JS files parse cleanly.

[2/4] Checking JSON validity on 6 files...
  All JSON files are valid.

[3/4] Running backend test suite (node:test)...
  # tests 44
  # pass 44
  # fail 0

[4/4] (best-effort) Checking frontend bundles with esbuild, if available...
  Frontend bundle resolves cleanly.

VALIDATION PASSED.
```

`scripts/validate.js` was verified to actually fail when broken —
deliberately introduced a syntax error into a shared file, confirmed exit
code `1` and `VALIDATION FAILED`, then restored the file and confirmed
exit code `0` again. It is not a script that always reports success.

The 44 tests cover, as pure functions with no I/O:
- `shared/normalizeIncident.js` — every legacy → canonical mapping rule (11 tests)
- `backend/validators/incidentValidators.js` — every status-transition rule, including rejection of legacy status values (10 tests)
- `ai/postDisasterAgent/schema.js` — AI output validation, valid and malformed cases (8 tests)
- `ai/postDisasterAgent/fallback.js` — deterministic fallback generator, including empty/undefined input (4 tests)
- `ai/postDisasterAgent/agent.js` — **the critical one**: `ANTHROPIC_API_KEY` is explicitly deleted at the top of the test file, then the full agent is run end-to-end and asserted to still produce a schema-valid `rule_based_fallback` report (3 tests)
- `demo/seed-data/*.seed.json` — every seeded incident/report normalizes with **zero** legacy-mapping warnings, confirming the demo data is genuinely canonical, not carried over from Round 1 (8 tests)

Also verified this way: the frontend's entire page/component/hook/service
tree bundles with `esbuild` (ESM format, React/Firebase/recharts/lucide-react
marked external) with zero errors — this confirms every import resolves,
including the frontend's cross-boundary import of `shared/normalizeIncident.js`
(a CommonJS file imported from ES modules; esbuild's CJS interop was
specifically checked before relying on this pattern).

Also verified: `frontend/package-lock.json` and `backend/package-lock.json`
were regenerated via `npm install --package-lock-only` (no `node_modules`
written to disk) and confirmed to include `lucide-react` and remain valid
JSON.

## 🖥️ Local runtime (would need a running process, no external service required)

Not yet performed in this package, but doesn't require Firebase/Anthropic:
- Starting the Express server standalone and confirming it boots without
  throwing (would currently fail without a mocked or real
  `admin.initializeApp()`, since `firestoreService.js` deliberately throws
  a clear error if Firestore isn't initialized rather than failing silently)
- Running the demo seed script against the Firebase emulator suite instead
  of a real project

## 🔑 Requires real Firebase credentials

None of these have been tested:
- `admin.initializeApp()` actually connecting to a real Firestore project
- Any `incidentService.js` read/write actually hitting Firestore
- `authMiddleware.js` actually verifying a real Firebase ID token
- `demo/seed-data/seed.js` actually writing documents
- Firestore security rules (`firestore/security-rules-snippet.txt`)
  actually being enforced as written — rules syntax was reviewed by eye,
  not deployed and tested against the emulator

## 🔑 Requires a real Anthropic API key

- The **AI-generation success path** (`generatedBy: "ai"`) in
  `ai/postDisasterAgent/agent.js#callClaude()` — never executed. The
  fallback path (no key, or key present but call fails) **was** tested
  end-to-end; the happy path calling the real API was not, because no key
  exists in this environment.
- Whether the prompt in `prompts.js` actually produces schema-valid JSON
  from a real model call, versus just being validated as a reasonable
  prompt by inspection

## 🌐 Requires a browser / manual visual verification

**Nothing in this package has been visually verified.** No tool available
in this environment can render a multi-file, hook-driven, Firebase-backed
React app. Specifically untested:
- Whether the dashboard actually looks like the Round 2 mockup once
  rendered (layout was built to match it structurally — grid arrangement,
  column order, sidebar items — but pixel-level appearance is unverified)
- Color contrast in an actual browser (design tokens were chosen for
  reasonable contrast against the navy background, but no contrast-ratio
  tool was run)
- Responsive behavior at real tablet/mobile viewport widths (breakpoint
  classes are present and were reasoned through, but never rendered at
  those widths)
- Any click-through user flow (opening an incident, changing status,
  generating a report, confirming a volunteer) — these were verified as
  correct *code paths* (the right service function calls the right
  endpoint with the right payload) but never exercised by an actual click
- Keyboard navigation and focus order in practice
- The AI report generation loading-state animation sequence actually
  appearing correctly

## How to actually test this before shipping

1. `cd backend && npm install && npm test && npm run check` — confirms
   what's already been confirmed here, in your own environment.
2. Point `admin.initializeApp()` at a real (ideally emulator) Firebase
   project, run `npm run seed:demo`, and confirm the demo data appears in
   Firestore.
3. Start the Express server for real, integrated into the main project per
   `INTEGRATION_GUIDE.md`, and hit each endpoint in `API.md` with `curl`
   or Postman using a real Firebase ID token.
4. Set a real `ANTHROPIC_API_KEY`, generate a post-disaster report, and
   confirm `generatedBy: "ai"` with a coherent `summaryText`. Then remove
   the key and confirm it falls back cleanly — this half is already
   automated, but worth re-confirming against your real deployment.
5. Open the actual dashboard in a browser and go through the demo flow:
   Command Center → open a critical incident → acknowledge → in_progress
   → resolve (with confirmation dialog) → check the audit trail → generate
   a post-disaster report → print/export it.
