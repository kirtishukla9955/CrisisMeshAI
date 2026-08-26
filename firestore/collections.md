# Firestore Collections — Member 4 Reference

This documents every collection Member 4's module reads or writes. It's the
compatibility contract with the shared CrisisMesh schema — **no competing
schema is introduced here.** See `shared/schemas/incidentSchema.js` for the
JSDoc field-level typedefs and `../shared/DATA_CONTRACT.md` for who
populates what.

## `incidents/{incidentId}`

**Owner:** shared — created by Member 3's AI Prioritization Agent, geo
fields populated with help from Member 2, status/audit fields owned by
Member 4.

| Field | Type | Required | Owner | Notes |
|---|---|---|---|---|
| `id` | string | yes | Member 3 | e.g. `"CRS-1042"` |
| `title` | string | yes | Member 3 | short human title |
| `category` | string | yes | Member 1/3 | one of `flood, injury, trapped, food_water, medical, infrastructure, other` |
| `severity` | string | yes | Member 3 | one of `critical, high, medium, low` |
| `priorityScore` | number | yes | Member 3 | 0–100 |
| `aiConfidence` | number | yes | Member 3 | 0–1 |
| `aiFallbackUsed` | boolean | yes | Member 3 | true if Member 3's rule-based fallback scored this incident |
| `status` | string | yes | **Member 4** | one of `new, under_review, assigned, in_progress, resolved, escalated, rejected` — Member 4 owns all transitions |
| `location` | map `{lat, lng}` | yes | Member 2 | |
| `locationLabel` | string | yes | Member 2 | e.g. `"Ward 14, Jaipur"` |
| `reportCount` | number | yes | Member 3 | clustered report count |
| `reportIds` | array\<string\> | yes | Member 1/3 | FKs into `reports/` |
| `assignedResponderId` | string \| null | no | **Member 4** | set via `POST /api/incidents/:id/assign` |
| `assignedResponderName` | string \| null | no | **Member 4** | |
| `createdAt` | Timestamp | yes | Member 3 | |
| `updatedAt` | Timestamp | yes | **Member 4** | bumped on every Member 4 mutation |
| `authorityNote` | string \| null | no | **Member 4** | |
| `lastActionBy` | string \| null | no | **Member 4** | authority uid |
| `eventId` | string | no | shared | optional, if the main schema scopes incidents to a named disaster event; used by the post-disaster report filter |

## `incidents/{incidentId}/history/{eventId}` — subcollection

**Owner: Member 4 (new).** One document per audit event.

| Field | Type | Notes |
|---|---|---|
| `id` | string | doc id |
| `incidentId` | string | parent incident |
| `type` | string | `status_change` \| `assignment` \| `note` \| `ai_report_generated` |
| `fromStatus` | string \| null | |
| `toStatus` | string \| null | |
| `actorId` | string | authority uid |
| `actorName` | string | |
| `note` | string \| null | |
| `timestamp` | Timestamp | server timestamp |

If the existing repository already has an audit/event collection for
incidents, prefer reusing that structure and adapt
`backend/services/auditService.js` accordingly — do not create a duplicate
audit mechanism.

## `reports/{reportId}`

**Owner: Member 1 (existing).** Member 4 is read-only here.

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `incidentId` | string | FK into `incidents/` |
| `text` | string | |
| `reporterType` | string | `citizen` \| `verified_volunteer` \| `authority` |
| `location` | map \| null | |
| `hasMedia` | boolean | |
| `source` | string | `app` \| `sms` \| `offline_sync` |
| `createdAt` | Timestamp | |

## `postDisasterReports/{reportId}`

**Owner: Member 4 (new).**

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `generatedBy` | string | `ai` \| `rule_based_fallback` |
| `confidence` | number | 0–1 |
| `executiveSummary` | string | |
| `impact` | map | see `shared/schemas/incidentSchema.js` |
| `hardestHitAreas` | array\<string\> | |
| `responsePerformance` | map | |
| `incidentBreakdown` | array\<map\> | `[{category, count}]` |
| `infrastructureImpact` | array\<string\> | |
| `keyFindings` | array\<string\> | |
| `recommendations` | array\<string\> | |
| `dataAnalyzed` | map | `{reportsAnalyzed, incidentsAnalyzed}` |
| `eventId` | string \| null | |
| `generatedAt` | Timestamp | |
| `generatedByAuthorityId` | string | |

## If the existing repo's schema differs

Per the integration rule in `INTEGRATION_GUIDE.md`: inspect the existing
`incidents` documents first. If field names differ (e.g. `locationLabel` vs
`areaName`), **adapt Member 4's read paths to match the existing schema**
rather than renaming shared fields — see `DATA_CONTRACT.md` for the minimal
set Member 4 actually depends on.
