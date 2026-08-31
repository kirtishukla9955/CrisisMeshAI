# Firestore Indexes — Member 4 (Round 2)

Firestore auto-creates single-field indexes. The composite indexes below
are required for the queries Member 4's backend runs. Merge these into the
main project's `firestore.indexes.json` rather than replacing the file.

## `incidents`

1. **Priority queue, filtered by status**
   - `status` (Ascending), `priorityScore` (Descending)
   - Used by: `GET /api/incidents?status=...`

2. **Resolved incidents, for post-disaster report generation**
   - `status` (Ascending) — single-field, auto-indexed. The current query
     (`where('status', '==', 'resolved')`, no additional orderBy) does not
     need a composite index, but is listed here because it's the
     highest-volume query in the AI report pipeline and worth watching as
     incident volume grows.

## `incidents/{incidentId}/history` (subcollection)

No composite index needed — the queries here use `orderBy('timestamp', ...)`
on a single field, covered by Firestore's automatic indexing.

## `insight_reports`

1. **Latest report lookup**
   - `generatedAt` (Descending)
   - Single-field, auto-indexed — listed for completeness since
     `getLatestReport` relies on it under load.

## How to add these

```json
{
  "indexes": [
    {
      "collectionGroup": "incidents",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "priorityScore", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Then `firebase deploy --only firestore:indexes`. Alternatively, Firestore
surfaces a direct "create this index" link in the console/error logs the
first time each query runs — either path works for a hackathon timeline.

## Change from Round 1

Round 1 also had a `severity` (Ascending) + `priorityScore` (Descending)
composite index. `severity` is no longer a stored field in Round 2 (it's
derived from `priorityScore` at read time — see
`shared/normalizeIncident.js`), so that index is no longer needed and can
be removed if present.
