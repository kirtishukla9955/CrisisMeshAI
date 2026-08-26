/**
 * Shared Firestore document shapes (documentation-as-code).
 *
 * These are plain JSDoc typedefs, not a runtime ORM — deliberately no new
 * dependency for the shared stack. Members 1-3 should treat this as the
 * contract for what Member 4 reads and writes.
 *
 * Member 4 CONSUMES `incidents/{incidentId}` and `reports/{reportId}`
 * (produced by Members 1-3) and OWNS the `incidents/{id}/history`
 * subcollection and the `postDisasterReports/{id}` collection.
 *
 * See ../../firestore/collections.md for the full collection reference and
 * ../DATA_CONTRACT.md for exactly which fields each member is responsible
 * for populating.
 */

/** @typedef {Object} Incident
 * Produced by: Member 3's AI Prioritization Agent (clustering + scoring),
 * fed by raw reports from Member 1 and geo/cluster data from Member 2.
 * Mutated by: Member 4 (status, assignment, authority note).
 *
 * @property {string} id                        - e.g. "CRS-1042"
 * @property {string} title                      - e.g. "Trapped residents"
 * @property {string} category                   - one of INCIDENT_CATEGORY
 * @property {string} severity                   - one of SEVERITY
 * @property {number} priorityScore               - 0-100, from Member 3
 * @property {number} aiConfidence                 - 0-1, from Member 3
 * @property {boolean} aiFallbackUsed              - true if rule-based fallback scored this, not the LLM
 * @property {string} status                       - one of INCIDENT_STATUS (Member 4 owns transitions)
 * @property {{lat:number, lng:number}} location
 * @property {string} locationLabel                - e.g. "Ward 14, Jaipur" (Member 2)
 * @property {number} reportCount                  - clustered report count (Member 3)
 * @property {string[]} reportIds                  - ids into reports/ (Member 1/3)
 * @property {string|null} assignedResponderId      - volunteer/rescue team id (Member 3)
 * @property {string|null} assignedResponderName
 * @property {import('firebase-admin').firestore.Timestamp} createdAt
 * @property {import('firebase-admin').firestore.Timestamp} updatedAt
 * @property {string|null} authorityNote            - Member 4
 * @property {string|null} lastActionBy             - Member 4, authority user id
 */

/** @typedef {Object} Report
 * Produced by: Member 1 (app / offline / SMS intake). Read-only for Member 4.
 *
 * @property {string} id
 * @property {string} incidentId       - foreign key into incidents/
 * @property {string} text
 * @property {string} reporterType     - "citizen" | "verified_volunteer" | "authority"
 * @property {{lat:number, lng:number}|null} location
 * @property {boolean} hasMedia
 * @property {string} source           - one of REPORT_SOURCE
 * @property {import('firebase-admin').firestore.Timestamp} createdAt
 */

/** @typedef {Object} IncidentHistoryEvent
 * Owned by Member 4. One doc per audit event at
 * `incidents/{incidentId}/history/{eventId}`.
 *
 * @property {string} id
 * @property {string} incidentId
 * @property {string} type            - "status_change" | "assignment" | "note" | "ai_report_generated"
 * @property {string|null} fromStatus
 * @property {string|null} toStatus
 * @property {string} actorId         - authority user id
 * @property {string} actorName
 * @property {string|null} note
 * @property {import('firebase-admin').firestore.Timestamp} timestamp
 */

/** @typedef {Object} PostDisasterReport
 * Owned by Member 4. Doc at `postDisasterReports/{reportId}`.
 *
 * @property {string} id
 * @property {string} generatedBy       - "ai" | "rule_based_fallback"
 * @property {number} confidence        - 0-1
 * @property {string} executiveSummary
 * @property {Object} impact
 * @property {string[]} hardestHitAreas
 * @property {Object} responsePerformance
 * @property {Object[]} incidentBreakdown
 * @property {string[]} infrastructureImpact
 * @property {string[]} keyFindings
 * @property {string[]} recommendations
 * @property {{reportsAnalyzed:number, incidentsAnalyzed:number}} dataAnalyzed
 * @property {import('firebase-admin').firestore.Timestamp} generatedAt
 */

module.exports = {}; // JSDoc-only file; nothing to export at runtime.
