# Firestore Collections — Member 4 Reference (Round 2)

SOURCE OF TRUTH: "CrisisMesh AI — Full-Stack Build Guide — Round 2". This
documents every collection Member 4's module reads or writes. See
`shared/schemas/incidentSchema.js` for JSDoc typedefs and
`shared/DATA_CONTRACT.md` for ownership/dependency details.

## `incidents/{incidentId}`

**Owner:** Member 3 writes everything except `status`, which is
Member-4-owned.

| Field | Type | Owner | Notes |
|---|---|---|---|
| `incidentId` | string | Member 3 | e.g. `"CRS-2001"` |
| `centerLocation` | map `{lat, lng}` | Member 2/3 | |
| `reportIds` | array\<string\> | Member 1/3 | reports are looked up via this array, not a FK on the report |
| `reportCount` | number | Member 3 | |
| `primaryTag` | string | Member 1/3 | `flood`\|`injury`\|`trapped`\|`food_water`\|`medical`\|`road_blocked`\|`other` |
| `severitySummary` | string | Member 3 | AI-generated one-liner |
| `priorityScore` | number | Member 3 | 0–100. Severity (critical/high/moderate) is derived from this, not stored |
| `confidence` | string | Member 3 | `high`\|`medium`\|`low`\|`fallback_only` |
| `scoringMethod` | string | Member 3 | `ai`\|`rule_based_fallback` |
| `neededSkills` | array\<string\> | Member 3 | |
| `status` | string | **Member 4** | `new`\|`acknowledged`\|`in_progress`\|`resolved`, forward-only transitions |
| `needsHumanReview` | boolean | Member 3 | explicit flag; Member 4 also treats `low`/`fallback_only` confidence as a review signal |
| `suggestedVolunteers` | array\<map\> | Member 3 | Member 4 only displays + records confirmation as an audit event, never overwrites this array |
| `updatedAt` | Timestamp | shared | Member 4 bumps this on every status write |

## `incidents/{incidentId}/history/{eventId}` — subcollection

**Owner: Member 4.** One document per audit event. This is also where
authority notes and volunteer-assignment confirmations live — Member 4
does not add extra top-level fields to the incident document for these.

| Field | Type | Notes |
|---|---|---|
| `id` | string | doc id |
| `incidentId` | string | parent incident |
| `type` | string | `status_change` \| `note` \| `volunteer_confirmed` \| `insight_report_generated` |
| `fromStatus` / `toStatus` | string \| null | only set for `status_change` |
| `actorId` / `actorName` | string | authority uid/name |
| `note` | string \| null | |
| `timestamp` | Timestamp | server timestamp |

## `reports/{reportId}`

**Owner: Member 1.** Read-only for Member 4. **No `incidentId` field** —
looked up via `incident.reportIds[]`.

| Field | Type | Notes |
|---|---|---|
| `reportId` | string | |
| `source` | string | `app`\|`offline_sync`\|`sms` |
| `reporterId` / `reporterPhone` | string \| null | |
| `text` | string \| null | |
| `mediaUrls` | array\<string\> | |
| `location` | map \| null | |
| `locationText` | string \| null | |
| `tag` | string | same enum as `incident.primaryTag` |
| `isEmergency` | boolean | |
| `status` | string | `new`\|`reviewed`\|`resolved` |
| `createdAt` | Timestamp \| null | used by Member 4 as a "when this started" proxy — see `ai/postDisasterAgent/README.md` |
| `syncedAt` | Timestamp \| null | |

## `volunteers/{volunteerId}`

**Owner: Member 3.** Read-only for Member 4, only accessed to display
details for a `suggestedVolunteers` entry.

| Field | Type |
|---|---|
| `volunteerId` | string |
| `name` | string |
| `phone` | string |
| `skills` | array\<string\> |
| `location` | map `{lat, lng}` |
| `isVerified` | boolean |
| `isAvailable` | boolean |
| `createdAt` | Timestamp |

## `insight_reports/{reportGenId}`

**Owner: Member 4.** Canonical Round 2 collection name — **replaces Round
1's `postDisasterReports`**, which is retired. Do not write to the old
collection name.

| Field | Type | Notes |
|---|---|---|
| `reportGenId` | string | |
| `generatedAt` | Timestamp | |
| `periodCovered` | map `{from: Timestamp, to: Timestamp}` | |
| `totalIncidents` | number | |
| `worstHitAreas` | array\<`{areaName, incidentCount}`\> | |
| `avgResponseTimeMinutes` | number \| null | |
| `slowestResponseAreas` | array\<string\> | |
| `summaryText` | string | |
| `generatedBy` | string | extension field: `ai`\|`rule_based_fallback` |
| `keyFindings` | array\<string\> | extension field |
| `recommendations` | array\<string\> | extension field |
| `dataAnalyzed` | map `{reportsAnalyzed, incidentsAnalyzed}` | extension field |
| `excludedForUnknownResolution` | number | extension field — incidents excluded from the period because a resolution time couldn't be determined |
| `generatedByAuthorityId` | string | extension field |

## If the existing repo's schema differs

Inspect the actual documents in Firestore before assuming this doc is
accurate for a given deployment. `shared/normalizeIncident.js` is built to
tolerate drift from Round 1 field names, but any *new* drift should be
fixed by updating this document and the normalizer together, not by adding
ad-hoc field-name guesses elsewhere in the codebase.
