# API.md — Member 4 Endpoints (Round 2)

All endpoints require `Authorization: Bearer <Firebase ID token>` for an
authenticated authority user (see `backend/middleware/authMiddleware.js`).
Base path assumed: `/api` — adjust if the main project mounts differently.
Every response listed below reflects the currently implemented code, not
an aspirational design — if this drifts from the code, the code wins and
this file needs updating.

---

## `GET /api/incidents`

Retrieve authority-visible incidents, sorted by `priorityScore` descending.
Every returned incident has already passed through
`shared/normalizeIncident.js` — canonical fields only, regardless of the
underlying document's actual shape.

**Query params:** `status` (optional) — one of `new`, `acknowledged`,
`in_progress`, `resolved`.

**Response `200`:**
```json
{
  "incidents": [
    {
      "incidentId": "CRS-2001",
      "centerLocation": { "lat": 26.9124, "lng": 75.7873 },
      "reportIds": ["RPT-4001", "RPT-4002"],
      "reportCount": 2,
      "primaryTag": "trapped",
      "severitySummary": "Family of four trapped on rooftop...",
      "priorityScore": 92,
      "confidence": "high",
      "scoringMethod": "ai",
      "neededSkills": ["swimming", "medical"],
      "status": "new",
      "needsHumanReview": false,
      "suggestedVolunteers": [{ "volunteerId": "VOL-201", "name": "Rescue Team Alpha" }],
      "updatedAt": "...",
      "severity": "critical"
    }
  ],
  "count": 1
}
```

---

## `GET /api/incidents/:id`

Retrieve one incident, its reports (fetched via `reportIds`, not a query),
and details for any suggested volunteers.

**Response `200`:**
```json
{
  "incident": { "incidentId": "CRS-2001", "...": "..." },
  "reports": [
    { "reportId": "RPT-4001", "source": "app", "text": "...", "tag": "trapped", "...": "..." }
  ],
  "suggestedVolunteerDetails": [
    { "volunteerId": "VOL-201", "name": "Rescue Team Alpha", "skills": ["swimming", "medical"], "...": "..." }
  ]
}
```

**Errors:** `404` incident not found.

---

## `PATCH /api/incidents/:id/status`

Update incident status. This is the **only** incident field Member 4 may
write. Validates the transition against the canonical forward-only flow
(`new → acknowledged → in_progress → resolved`) — no skipping states, no
moving backward, no legacy status values accepted.

**Request:**
```json
{ "status": "acknowledged", "note": "Rescue team dispatched." }
```
`note` is optional and, if present, is recorded on the audit event only —
it is never written onto the incident document.

**Response `200`:** `{ "incident": { "...": "..." } }`

**Errors:**
- `400` invalid/missing `status`
- `404` incident not found
- `409` illegal transition (skip, backward move, or repeat), body includes
  `allowedNextStatuses`

**Example:**
```bash
curl -X PATCH https://api.example.com/api/incidents/CRS-2001/status \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"acknowledged","note":"Rescue team dispatched."}'
```

---

## `POST /api/incidents/:id/notes`

Append an authority note as an audit event. Does not change status and
does not write any field onto the incident document.

**Request:** `{ "note": "Follow-up call placed to reporter." }`
**Response `201`:** `{ "incident": { "...": "..." } }`
**Errors:** `400` empty/oversized note, `404` not found.

---

## `POST /api/incidents/:id/confirm-volunteer`

Authority confirms one of Member 3's `suggestedVolunteers` entries as the
actual assignment. Recorded as an audit event (`type: "volunteer_confirmed"`)
— **does not write to the incident document**, since Member 4 does not own
a volunteer-assignment field on `incidents` (see `shared/DATA_CONTRACT.md`).

**Request:** `{ "volunteerId": "VOL-201", "volunteerName": "Rescue Team Alpha" }`
**Response `200`:** `{ "incident": { "...": "..." } }`
**Errors:** `400` missing `volunteerId`, `404` incident not found.

---

## `GET /api/incidents/:id/history`

Full audit trail for one incident, most recent first.

**Response `200`:**
```json
{
  "events": [
    { "id": "...", "type": "status_change", "fromStatus": "new", "toStatus": "acknowledged", "actorName": "District Authority", "timestamp": "..." }
  ],
  "count": 1
}
```

---

## `POST /api/post-disaster/report`

Generate a new insight report via the AI agent, with automatic rule-based
fallback on any AI failure (see `ai/postDisasterAgent/README.md`). Writes
to the canonical `insight_reports` collection.

**Request:** `{ "from": "2026-08-01T00:00:00.000Z", "to": "2026-08-29T00:00:00.000Z" }`
Both fields are optional ISO date strings; defaults to the last 30 days if
omitted.

Only **resolved** incidents whose derived resolution time falls inside the
period are included. Incidents whose resolution time can't be determined
are excluded from the count, not guessed into it — the response includes
`excludedForUnknownResolution` so this is visible, not silent.

**Response `201`:**
```json
{
  "report": {
    "reportGenId": "...",
    "generatedAt": "...",
    "periodCovered": { "from": "...", "to": "..." },
    "totalIncidents": 2,
    "worstHitAreas": [{ "areaName": "Zone 26.91, 75.79", "incidentCount": 1 }],
    "avgResponseTimeMinutes": 80,
    "slowestResponseAreas": ["Zone 26.95, 75.82"],
    "summaryText": "...",
    "generatedBy": "ai",
    "keyFindings": ["..."],
    "recommendations": ["..."],
    "dataAnalyzed": { "reportsAnalyzed": 2, "incidentsAnalyzed": 2 },
    "excludedForUnknownResolution": 0,
    "generatedByAuthorityId": "..."
  }
}
```

**Errors:**
- `400` `from` after `to`, or no resolved incidents exist yet, or none fall
  within a determinable resolution time in the requested period.
- This endpoint never returns a 5xx because of an *AI* failure — AI
  failures degrade to `generatedBy: "rule_based_fallback"` inside a `201`
  response. A `5xx` here means a genuine server/database problem.

---

## `GET /api/post-disaster/report/latest`

Fetch the most recently generated report.

**Response `200`:** `{ "report": { "...": "..." } }` or `{ "report": null }` if none exist yet.

---

## `GET /api/post-disaster/report/:id`

Fetch a specific stored report by id. **Errors:** `404` not found.

---

## Changes from Round 1

- `PATCH /api/incidents/:id/status` no longer accepts `authorityNote` as an
  incident field — renamed to `note`, and it now only ever writes to audit
  history.
- `POST /api/incidents/:id/assign` is **removed**. Replaced by
  `POST /api/incidents/:id/confirm-volunteer`, which is audit-only and does
  not mutate the incident document (Round 1's version wrote
  `assignedResponderId`/`Name` fields that have no home in the Round 2
  contract).
- `listIncidents` no longer supports a `severity` query filter —
  `severity` isn't a stored field in Round 2; filter by `priorityScore`
  range client-side if needed.
- `POST /api/post-disaster/report` request body changed from
  `{ eventId }` to `{ from, to }`.
- Response collection is `insight_reports`, not `postDisasterReports`.
