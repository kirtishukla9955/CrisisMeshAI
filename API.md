# API.md — Member 4 Endpoints

All endpoints require `Authorization: Bearer <Firebase ID token>` for an
authenticated authority user (see `backend/middleware/authMiddleware.js`).
Base path assumed: `/api` — adjust if the main project mounts differently.

---

## `GET /api/incidents`

Retrieve authority-visible incidents, sorted by `priorityScore` descending.

**Auth:** required (authority)
**Query params:** `status` (optional), `severity` (optional)

**Response `200`:**
```json
{ "incidents": [ { "id": "CRS-1042", "title": "...", "...": "..." } ], "count": 1 }
```

**Errors:** `401` missing/invalid token.

---

## `GET /api/incidents/:id`

Retrieve one incident plus its raw reports.

**Response `200`:**
```json
{ "incident": { "id": "CRS-1042", "...": "..." }, "reports": [ { "id": "RPT-3001", "...": "..." } ] }
```

**Errors:** `404` incident not found.

---

## `PATCH /api/incidents/:id/status`

Update incident status. Validates the transition against
`STATUS_TRANSITIONS` (see `shared/constants/statuses.js`) before writing.

**Request:**
```json
{ "status": "in_progress", "authorityNote": "Rescue team dispatched." }
```

**Response `200`:**
```json
{ "incident": { "id": "CRS-1042", "status": "in_progress", "...": "..." } }
```

**Errors:**
- `400` invalid/missing `status`
- `404` incident not found
- `409` illegal transition (e.g. `resolved` → `new`), body includes
  `allowedNextStatuses`

**Example:**
```bash
curl -X PATCH https://api.example.com/api/incidents/CRS-1042/status \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"in_progress","authorityNote":"Rescue team dispatched."}'
```

---

## `POST /api/incidents/:id/notes`

Append an authority note without changing status.

**Request:** `{ "note": "Follow-up call placed to reporter." }`
**Response `201`:** `{ "incident": { "...": "..." } }`
**Errors:** `400` empty/oversized note, `404` not found.

---

## `POST /api/incidents/:id/assign`

Assign a responder (volunteer or rescue team) to an incident.

**Request:** `{ "responderId": "VOL-201", "responderName": "Rescue Team Alpha" }`
**Response `200`:** `{ "incident": { "...": "..." } }`
**Errors:** `400` missing `responderId`, `404` not found.

---

## `GET /api/incidents/:id/history`

Full audit trail for one incident, most recent first.

**Response `200`:**
```json
{ "events": [ { "id": "...", "type": "status_change", "fromStatus": "new", "toStatus": "under_review", "actorName": "District Authority", "timestamp": "..." } ], "count": 1 }
```

---

## `POST /api/post-disaster/report`

Generate a new post-disaster report via the AI agent (with automatic
rule-based fallback on failure — see `ai/postDisasterAgent/README.md`).

**Request:** `{ "eventId": "flood-2026-08" }` (optional — omit to analyze all current incidents)

**Response `201`:**
```json
{
  "report": {
    "id": "...",
    "generatedBy": "ai",
    "confidence": 0.92,
    "executiveSummary": "...",
    "impact": { "totalIncidents": 42, "criticalIncidents": 8, "affectedAreas": ["Ward 14", "Ward 8"] },
    "hardestHitAreas": ["Ward 14", "Ward 8"],
    "responsePerformance": { "averageResponseTimeMinutes": 34, "unresolvedCount": 5 },
    "incidentBreakdown": [ { "category": "flood", "count": 20 } ],
    "infrastructureImpact": ["roads", "electricity"],
    "keyFindings": ["..."],
    "recommendations": ["..."],
    "dataAnalyzed": { "reportsAnalyzed": 247, "incidentsAnalyzed": 42 },
    "generatedAt": "..."
  }
}
```

**Errors:** `400` no incidents to analyze. Note: this endpoint never
returns a 5xx due to an *AI* failure — AI failures degrade to
`generatedBy: "rule_based_fallback"` inside a `201` response, per the
project's no-silent-failure requirement. A `5xx` here means a genuine
server/database problem, not an AI problem.

---

## `GET /api/post-disaster/report/latest`

Fetch the most recently generated report (used as the dashboard default view).

**Response `200`:** `{ "report": { "...": "..." } }` or `{ "report": null }` if none exist yet.

---

## `GET /api/post-disaster/report/:id`

Fetch a specific stored report by id.

**Errors:** `404` not found.
