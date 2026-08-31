/**
 * Shared Firestore document shapes — Round 2 canonical contract.
 *
 * SOURCE OF TRUTH: "CrisisMesh AI — Full-Stack Build Guide — Round 2".
 * These are plain JSDoc typedefs, not a runtime ORM. The actual
 * enforcement/compatibility logic lives in ../normalizeIncident.js — this
 * file is documentation only.
 *
 * Member 4 CONSUMES `incidents` (written by Member 3), `reports` (written
 * by Member 1), and `volunteers` (written by Member 3) — read-only for all
 * three. Member 4 OWNS `incidents.status` (the only incident field it may
 * write), the `incidents/{id}/history` audit subcollection, and the
 * `insight_reports` collection.
 */

/** @typedef {Object} Incident
 * Owner: Member 3 (writes centerLocation, reportIds, reportCount,
 * primaryTag, severitySummary, priorityScore, confidence, scoringMethod,
 * neededSkills, needsHumanReview, suggestedVolunteers).
 * Member 4 writes ONLY `status` (via validated transitions) and bumps
 * `updatedAt` when it does. Member 4 must not write any other field here.
 *
 * @property {string} incidentId
 * @property {{lat:number, lng:number}} centerLocation
 * @property {string[]} reportIds
 * @property {number} reportCount
 * @property {string} primaryTag        - "flood"|"injury"|"trapped"|"food_water"|"medical"|"road_blocked"|"other"
 * @property {string} severitySummary   - AI-generated one-line summary
 * @property {number} priorityScore     - 0-100
 * @property {string} confidence        - "high"|"medium"|"low"|"fallback_only"
 * @property {string} scoringMethod     - "ai"|"rule_based_fallback"
 * @property {string[]} neededSkills
 * @property {string} status            - "new"|"acknowledged"|"in_progress"|"resolved" — Member 4-owned
 * @property {boolean} needsHumanReview
 * @property {Array<Object>} suggestedVolunteers - Member 3's algorithmic suggestions; Member 4 only displays + confirms via audit event, never overwrites this array
 * @property {import('firebase-admin').firestore.Timestamp} updatedAt
 *
 * NOT stored, derived by shared/normalizeIncident.js at read time:
 * @property {string} severity - "critical"(80-100) | "high"(50-79) | "moderate"(<50), derived from priorityScore
 */

/** @typedef {Object} Report
 * Owner: Member 1. Read-only for Member 4. Looked up via
 * `incident.reportIds[]` — reports do NOT carry an `incidentId` foreign key
 * in the Round 2 contract (this differs from Round 1).
 *
 * @property {string} reportId
 * @property {string} source           - "app"|"offline_sync"|"sms"
 * @property {string|null} reporterId
 * @property {string|null} reporterPhone
 * @property {string|null} text
 * @property {string[]} mediaUrls
 * @property {{lat:number, lng:number}|null} location
 * @property {string|null} locationText
 * @property {string} tag              - same enum as incident.primaryTag
 * @property {boolean} isEmergency
 * @property {string} status           - "new"|"reviewed"|"resolved"
 * @property {import('firebase-admin').firestore.Timestamp|null} createdAt
 * @property {import('firebase-admin').firestore.Timestamp|null} syncedAt
 */

/** @typedef {Object} Volunteer
 * Owner: Member 3. Read-only for Member 4 — only read when displaying
 * `incident.suggestedVolunteers` details.
 *
 * @property {string} volunteerId
 * @property {string} name
 * @property {string} phone
 * @property {string[]} skills
 * @property {{lat:number, lng:number}} location
 * @property {boolean} isVerified
 * @property {boolean} isAvailable
 * @property {import('firebase-admin').firestore.Timestamp} createdAt
 */

/** @typedef {Object} IncidentHistoryEvent
 * Owner: Member 4 (new). One doc per audit event at
 * `incidents/{incidentId}/history/{eventId}`. This is also where authority
 * notes and volunteer-assignment confirmations live — Member 4 does not
 * add note/assignment fields to the incident document itself, to avoid
 * writing outside its contractually-owned `status` field.
 *
 * @property {string} id
 * @property {string} incidentId
 * @property {string} type            - "status_change" | "note" | "volunteer_confirmed" | "insight_report_generated"
 * @property {string|null} fromStatus
 * @property {string|null} toStatus
 * @property {string} actorId         - authority uid
 * @property {string} actorName
 * @property {string|null} note
 * @property {import('firebase-admin').firestore.Timestamp} timestamp
 */

/** @typedef {Object} InsightReport
 * Owner: Member 4 (new). Doc at `insight_reports/{reportGenId}`. This is
 * the CANONICAL post-disaster report collection per the Round 2 guide —
 * the Round 1 `postDisasterReports` collection has been retired (see
 * shared/DATA_CONTRACT.md for the migration note).
 *
 * Canonical fields (guide-defined):
 * @property {string} reportGenId
 * @property {import('firebase-admin').firestore.Timestamp} generatedAt
 * @property {{from: import('firebase-admin').firestore.Timestamp, to: import('firebase-admin').firestore.Timestamp}} periodCovered
 * @property {number} totalIncidents
 * @property {Array<{areaName: string, incidentCount: number}>} worstHitAreas
 * @property {number|null} avgResponseTimeMinutes
 * @property {string[]} slowestResponseAreas
 * @property {string} summaryText     - AI-generated (or fallback-generated) plain-language narrative
 *
 * Documented Member 4 EXTENSION fields (not in the guide's minimal shape,
 * additive only, never conflict with the fields above — see
 * ai/postDisasterAgent/schema.js):
 * @property {string} generatedBy     - "ai" | "rule_based_fallback"
 * @property {string[]} keyFindings
 * @property {string[]} recommendations
 * @property {{reportsAnalyzed:number, incidentsAnalyzed:number}} dataAnalyzed
 */

module.exports = {}; // JSDoc-only file; nothing to export at runtime.
