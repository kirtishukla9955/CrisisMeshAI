# Post-Disaster AI Agent (Round 2)

Turns resolved incidents from a disaster response period into a
plain-language operational review, stored in the canonical
**`insight_reports`** collection. This is "Post-Disaster AI Agent" from the
Full-Stack Build Guide, Round 2.

**The AI does not make final emergency decisions.** It only generates an
analytical report from data Member 4 has already aggregated. A human
authority reads and acts on it.

## Pipeline

1. **Input data** — `backend/controllers/postDisasterController.js` reads
   incidents where `status === "resolved"`, normalizes each via
   `shared/normalizeIncident.js`, and for each one:
   - fetches its reports via `incident.reportIds[]` (batched `getAll`) to
     find the earliest `report.createdAt` — the closest thing to a
     "when this started" timestamp, since the canonical incident schema
     has no `createdAt` field of its own;
   - fetches its audit history and finds the earliest
     `status_change` event with `toStatus === "resolved"` (falling back to
     the incident's own `updatedAt` if no such event exists) as the
     resolution timestamp;
   - computes `responseTimeMinutes = resolutionTime - earliestReportTime`,
     or `null` if either timestamp is unavailable — **never invented**.
   - derives a coarse area label from `centerLocation` via
     `shared/normalizeIncident.js#deriveAreaLabel()`, since the canonical
     contract has no place-name field (see the limitation note there).

   Only incidents whose derived resolution time falls inside the requested
   `{from, to}` period are included; incidents with an undeterminable
   resolution time are excluded from the period-filtered set rather than
   guessed into it.

2. **Preprocessing** — `agent.js#buildDatasetSummary()` reduces the
   enriched incident list into a small, privacy-safe aggregate (counts by
   area, counts by tag, average response time overall and per-area). No
   report text, no reporter identifiers, and no incident IDs are ever sent
   to the LLM provider.

3. **LLM prompt** — `prompts.js` builds a system prompt (hard rules: no
   invented stats, no assumptions, JSON-only, area names are coordinate
   zones not real place names) and a user prompt containing the aggregate,
   the period, and the exact output schema.

4. **Structured output** — the model is instructed to return JSON only,
   matching the canonical `insight_reports` shape plus Member 4's
   documented extension fields (`keyFindings`, `recommendations`).

5. **Validation** — `schema.js#validateInsightReport()` checks every
   required field's presence and type. Invalid output is treated as a
   failure and never reaches Firestore or the frontend.

6. **Failure handling** — `agent.js#callClaude()` wraps the API call in a
   try/catch with an **8-second hard timeout** via `AbortController` (kept
   short so the live demo stays responsive). Every documented failure mode
   is caught by the same path: missing `ANTHROPIC_API_KEY`, timeout,
   network error, non-2xx response, malformed JSON, schema validation
   failure, or any other unexpected shape.

7. **Rule-based fallback** — `fallback.js#generateFallbackInsightReport()`
   deterministically builds a report from the same aggregate using simple
   counts and averages (no LLM). Tagged `generatedBy: "rule_based_fallback"`
   so it's never confused with an AI-generated report. **This path has zero
   AI dependency and is exercised in tests with no API key present** — see
   `TESTING.md`.

8. **Firestore storage** — the controller writes the result to
   `insight_reports/{reportGenId}`, adding `reportGenId`, `generatedAt`,
   and `periodCovered` (computed by the controller, not the AI).

9. **Frontend consumption** — (wired in a later phase) will fetch the
   stored report and show an "AI Generated" or "Rule-Based Fallback" badge
   based on `generatedBy`.

## Why a coarse aggregate, not raw documents, goes to the LLM

Three reasons: (1) cost/latency — an 8-second timeout budget doesn't allow
sending hundreds of raw documents; (2) privacy — reporter identifiers and
free-text report content never need to leave Member 4's backend for this
report to be useful; (3) the prompt's hard-rule instruction set is far
easier to enforce against a small, well-defined aggregate than an unbounded
blob of citizen-submitted free text.

## Model configuration

The model is read from `process.env.ANTHROPIC_MODEL`, defaulting to a
current Claude model if unset — never hardcoded in a way that blocks
swapping providers or model versions. See `ENV.example`.

## Known limitation: response time and area names

The canonical `incidents` contract does not include `createdAt` or a
place-name field. This agent derives both from data Member 4 legitimately
has access to (report timestamps, its own audit history, coordinate
rounding) rather than inventing them — but these are documented
approximations, not authoritative fields. If Member 1 adds a
`locationText` value to reports or Member 2 exposes reverse-geocoded place
names, prefer wiring those in over `deriveAreaLabel()`'s coordinate zones.
