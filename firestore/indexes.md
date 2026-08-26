# Firestore Indexes — Member 4

Firestore auto-creates single-field indexes. The composite indexes below are
required for the queries Member 4's backend and frontend hooks run. If the
main project already has an `firestore.indexes.json`, merge these entries in
rather than replacing the file.

## `incidents`

1. **Priority queue, filtered by status**
   - `status` (Ascending), `priorityScore` (Descending)
   - Used by: `GET /api/incidents?status=...` and `useIncidents({status})`

2. **Priority queue, filtered by severity**
   - `severity` (Ascending), `priorityScore` (Descending)
   - Used by: `GET /api/incidents?severity=...` and `useIncidents({severity})`

3. **Post-disaster report scoping (optional, only if `eventId` is used)**
   - `eventId` (Ascending), `priorityScore` (Descending)

## `incidents/{incidentId}/history` (subcollection)

No composite index needed — `orderBy('timestamp', 'desc')` on a single
field is covered by Firestore's automatic indexing.

## `postDisasterReports`

1. **Latest report lookup**
   - `generatedAt` (Descending)
   - Single-field, auto-indexed — listed here for completeness since
     `getLatestReport` relies on it under load.

## How to add these

If deploying via the Firebase CLI, add to (or create) `firestore.indexes.json`
at the project root:

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
    },
    {
      "collectionGroup": "incidents",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "severity", "order": "ASCENDING" },
        { "fieldPath": "priorityScore", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Then run `firebase deploy --only firestore:indexes`. Alternatively, Firestore
will surface a direct "create this index" link in the console/error logs the
first time each query runs — either path works for a one-day hackathon
timeline.
