# Post-Disaster AI Agent

Turns raw incident/report data from a disaster event into a plain-language
operational review for authorities. This is "AI Agent 2" from the project
brief (section 2.6 / 2.19).

**The AI does not make final emergency decisions.** It only generates an
analytical report. A human authority reads and acts on it.

## Pipeline

1. **Input data** — `backend/controllers/postDisasterController.js` reads
   all incidents (and their reports) for the current event from Firestore.
2. **Preprocessing** — `agent.js#buildDatasetSummary()` reduces the raw
   documents into a small, privacy-safe aggregate (counts by area, category,
   status, average response time). Raw citizen report text is never sent to
   the LLM provider.
3. **LLM prompt** — `prompts.js` builds a system prompt (hard rules: no
   invented stats, no assumptions, JSON-only) and a user prompt containing
   the aggregate and the exact output schema.
4. **Structured output** — the model is instructed to return JSON only,
   matching the shape in `prompts.js`.
5. **Validation** — `schema.js#validatePostDisasterReport()` checks every
   field's presence and type. Invalid output is treated as a failure.
6. **Confidence handling** — the model self-reports a `confidence` (0-1).
   The frontend shows a "Low confidence — human review recommended" banner
   below `AI_CONFIDENCE_THRESHOLD.LOW` (see `shared/constants/statuses.js`).
7. **Failure handling** — `agent.js` wraps the API call in a try/catch with
   a hard timeout (`REQUEST_TIMEOUT_MS`). Any error — network failure,
   non-2xx response, timeout, invalid JSON, or schema-validation failure —
   is caught and logged, and control falls through to step 8.
8. **Rule-based fallback** — `fallback.js#generateFallbackReport()`
   deterministically builds a report from the same aggregate using simple
   counts (no LLM). The returned object is tagged `generatedBy:
   "rule_based_fallback"` so it's never confused with an AI-generated report.
9. **Firestore storage** — the controller persists the result to
   `postDisasterReports/{id}` (see `firestore/collections.md`).
10. **Frontend consumption** — `frontend/authority/services/reportService.js`
    fetches the stored report; `PostDisasterReport.jsx` renders it and shows
    an "AI Generated" or "Rule-Based Fallback" badge based on `generatedBy`.

## Why a summary, not raw documents, goes to the LLM

Two reasons: (1) cost/latency — sending hundreds of raw report documents on
every generation is slow and expensive for a hackathon demo; (2) the
project's stated AI-safety instruction set (see `prompts.js`) is much easier
to enforce against a small, well-defined aggregate than an unbounded blob of
citizen-submitted free text.

## Extending this agent

If Member 3's clustering/scoring agent is reused as a reference, note that
this agent is intentionally simpler: it does not call any tools, does not
maintain conversation state, and produces one JSON object per call. Keep it
that way — statefulness here would undermine the "never a silent point of
failure" guarantee, since a stateful pipeline has more places to fail
invisibly.
