# Shared Data Contract — Member 4

Exactly what Member 4's Authority Dashboard + Post-Disaster AI Agent
**expects to receive** from Members 1–3, and what it **produces** for the
rest of the app. Goal: no integration surprises.

## What Member 4 expects from Member 1 (Report Submission + Offline/SMS Intake)

Reports written to `reports/{reportId}` with at minimum:
- `incidentId` (string) — so Member 4 can group reports under an incident
- `text` (string)
- `source` (string) — `"app" | "sms" | "offline_sync"`, used for the source badges in the incident detail view
- `reporterType` (string)
- `hasMedia` (boolean)
- `createdAt` (Timestamp)

If reports are not yet clustered into an incident at write time, Member 4's
raw-reports panel simply won't show them until `incidentId` is populated by
Member 3's clustering step. That's expected — Member 4 does not perform
clustering itself.

## What Member 4 expects from Member 2 (Live Crisis Map + Geo-clustering)

On the `incidents` document:
- `location` — `{lat, lng}`
- `locationLabel` — human-readable area name (e.g. `"Ward 14, Jaipur"`), used everywhere in the dashboard and in the post-disaster report's `hardestHitAreas` ranking

Member 4 does **not** render its own map inside the incident detail page by
default — it displays `locationLabel` and coordinates as text and defers to
Member 2's Leaflet component if/when it's wired in (see
`INTEGRATION_GUIDE.md` §"Optional map embed").

## What Member 4 expects from Member 3 (AI Prioritization Agent + Volunteer Matching)

On the `incidents` document:
- `severity` — one of `critical | high | medium | low`
- `priorityScore` — 0–100
- `aiConfidence` — 0–1
- `aiFallbackUsed` — boolean, true when Member 3's own rule-based fallback (not Member 4's post-disaster fallback — a separate mechanism) scored the incident
- `category` — one of the quick-tag values
- `reportCount`, `reportIds`

From the volunteer-matching feature, optionally:
- `assignedResponderId` / `assignedResponderName` if Member 3's matching
  suggests a responder before an authority manually assigns one. Member 4's
  `POST /api/incidents/:id/assign` endpoint can overwrite these — last
  write wins, and every assignment is audit-logged either way.

## What Member 4 produces for the rest of the app

- `incidents.status` — the canonical status field. **Members 1–3 should
  treat this as read-only** once Member 4's module is integrated; only the
  Authority Dashboard changes it, via validated transitions
  (`shared/constants/statuses.js` → `STATUS_TRANSITIONS`).
- `incidents.authorityNote`, `incidents.assignedResponderId/Name`,
  `incidents.lastActionBy`, `incidents.updatedAt` — authority-side fields.
- `incidents/{id}/history/*` — full audit trail, readable by any module that
  wants to show "last authority action" elsewhere in the app.
- `postDisasterReports/*` — generated analytics, consumable by anyone
  building a summary/export view outside Member 4's own pages.

## Fields Member 4 explicitly does NOT own or mutate

- Report content, clustering, or deduplication (Member 1/3)
- Priority scoring or AI confidence generation for individual incidents
  (Member 3 — Member 4 only *displays* and *reacts to* these values)
- Map rendering, hotspot heatmaps, or geo-clustering (Member 2)
- Volunteer skill-matching logic (Member 3)

If any of these fields need to change shape, that's a cross-team schema
change — update this file and `firestore/collections.md` together so the
contract stays in sync.
