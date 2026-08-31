# Shared Data Contract — Member 4 (Round 2)

SOURCE OF TRUTH: "CrisisMesh AI — Full-Stack Build Guide — Round 2". This
document describes exactly what Member 4's Authority Dashboard +
Post-Disaster AI Agent expects from Members 1–3, and what it produces for
the rest of the app. Where this disagrees with the Round 1 project brief,
this document (and the guide it follows) wins. See also the "Member 4
Integration Boundaries" section in `README.md` for a narrative summary of
the same information aimed at the rest of the team.

## Migration note: Round 1 → Round 2 contract

Round 1 demo data and the first Member 4 build used a different shape —
different status enum, a numeric `aiConfidence`, a `location`/`locationLabel`
pair instead of `centerLocation`, `category` instead of `primaryTag`, and a
`postDisasterReports` collection instead of `insight_reports`. That data is
**not migrated in place** — `shared/normalizeIncident.js` reads whatever
shape is actually in Firestore and reshapes it into the canonical form at
read time, without mutating the underlying documents. See that file's
header comment for the full legacy → canonical field mapping and the
rationale for not running a destructive migration. Demo seed data has been
fully rebuilt in the canonical shape (`demo/seed-data/*.seed.json`).

## What Member 4 expects from Member 1 (`reports`)

Read-only. Canonical fields Member 4 actually uses:
- `reportId`, `source` (`app`/`offline_sync`/`sms`), `text`, `location`,
  `createdAt` — used for the raw-reports panel and, critically, as the
  proxy for "when this incident started" in post-disaster response-time
  calculations (see `ai/postDisasterAgent/README.md`).
- Reports are looked up via `incident.reportIds[]` — **reports do not carry
  an `incidentId` foreign key** in Round 2. If Member 1's real
  implementation does include one, that's fine (harmless extra field) but
  Member 4 does not rely on it.

## What Member 4 expects from Member 2 (map/geo)

Round 2 dropped the `locationLabel` field — incidents only carry
`centerLocation: {lat, lng}`. Member 4 does not depend on Member 2 for a
human-readable place name; where one is needed (post-disaster
`worstHitAreas`), Member 4 derives a coarse coordinate-based zone label
itself (`shared/normalizeIncident.js#deriveAreaLabel`), documented as an
approximation. If Member 2's map component exposes real reverse-geocoded
area names, that's a natural future upgrade — not a Round 2 dependency.

Member 4 does not build its own map. The dashboard (Phase 9+) will define
an integration boundary component that Member 2's actual Leaflet map is
injected into.

## What Member 4 expects from Member 3 (`incidents`, `volunteers`)

**Owner of the `incidents` document** (all fields except `status`):
`incidentId`, `centerLocation`, `reportIds`, `reportCount`, `primaryTag`,
`severitySummary`, `priorityScore` (0–100), `confidence`
(`high`/`medium`/`low`/`fallback_only`), `scoringMethod`
(`ai`/`rule_based_fallback`), `neededSkills`, `needsHumanReview`,
`suggestedVolunteers`.

**Owner of `volunteers`**: `volunteerId`, `name`, `phone`, `skills`,
`location`, `isVerified`, `isAvailable`. Member 4 reads this collection
only to display details for a `suggestedVolunteers` entry — never writes
to it, never re-implements matching.

## What Member 4 produces for the rest of the app

- **`incidents.status`** — the only incident field Member 4 is
  contractually allowed to write, via validated forward-only transitions
  (`new → acknowledged → in_progress → resolved`). Members 1–3 should
  treat this field as Member-4-owned once integrated.
- **`incidents/{id}/history/*`** — the full audit trail. Every status
  change, authority note, and volunteer-assignment confirmation is
  recorded here as an event — **not** as additional fields on the incident
  document. This is deliberate: Member 4 does not want to introduce fields
  like `authorityNote` or `assignedResponderId` onto a document it doesn't
  fully own, since the guide's canonical incident shape doesn't define
  them. Anything else in the app that wants to know "did an authority
  confirm a volunteer for this incident" should read the latest
  `volunteer_confirmed` event in this subcollection.
- **`insight_reports/*`** — post-disaster analytics, the canonical
  collection name per the Round 2 guide (replaces Round 1's
  `postDisasterReports`, which is retired — do not write to it).

## Fields Member 4 explicitly does NOT own or mutate

- Report content, clustering, or deduplication (Member 1/3)
- `priorityScore`, `confidence`, `scoringMethod`, `severitySummary`,
  `neededSkills`, `suggestedVolunteers` — all Member 3-generated. Member 4
  only displays and reacts to these values.
- Map rendering, hotspot heatmaps, or geo-clustering (Member 2)
- Volunteer skill-matching logic (Member 3) — Member 4's
  `POST /api/incidents/:id/confirm-volunteer` only records that an
  authority reviewed and confirmed one of Member 3's suggestions; it does
  not generate suggestions.

## Known limitation: filtering legacy data

`incidentService.listIncidents({status})` filters server-side with a
Firestore `where('status', '==', ...)` query using canonical status
values. If a document in Firestore still holds a legacy status value
(e.g. `"under_review"`), that server-side filter won't match it even
though `normalizeIncident()` would map it correctly once read. This only
matters for genuinely stale, never-migrated documents — new writes from
Member 3 or Member 4 always use canonical values. Flagging this rather
than silently leaving it undocumented.

If cross-team schema changes are ever needed, update this file and
`firestore/collections.md` together so the contract stays in sync.
