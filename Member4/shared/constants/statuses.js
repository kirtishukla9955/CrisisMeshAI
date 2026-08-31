/**
 * CrisisMesh AI — Shared canonical constants (Round 2 / Final Build Guide)
 * Owned by: Member 4, but this is the cross-team source of truth for the
 * `incidents` status/confidence/tag enums. Members 1-3 should import from
 * here rather than redefining these values.
 *
 * SOURCE OF TRUTH: "CrisisMesh AI — Full-Stack Build Guide — Round 2"
 * (docx). Where the Round 1 project brief disagreed with this guide, this
 * file follows the guide.
 */

// ---------------------------------------------------------------------------
// Incident status — exactly 4 states per the final guide. Round 1 had extra
// states (under_review, assigned, escalated, rejected) that no longer exist.
// See shared/normalizeIncident.js for how legacy data maps onto these.
// ---------------------------------------------------------------------------
const INCIDENT_STATUS = Object.freeze({
  NEW: 'new',
  ACKNOWLEDGED: 'acknowledged',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
});

const INCIDENT_STATUS_LABELS = Object.freeze({
  [INCIDENT_STATUS.NEW]: 'New',
  [INCIDENT_STATUS.ACKNOWLEDGED]: 'Acknowledged',
  [INCIDENT_STATUS.IN_PROGRESS]: 'In Progress',
  [INCIDENT_STATUS.RESOLVED]: 'Resolved',
});

// Linear forward-only flow per the guide: new -> acknowledged -> in_progress
// -> resolved. No lateral/escalation states exist in the canonical contract.
const STATUS_TRANSITIONS = Object.freeze({
  [INCIDENT_STATUS.NEW]: [INCIDENT_STATUS.ACKNOWLEDGED],
  [INCIDENT_STATUS.ACKNOWLEDGED]: [INCIDENT_STATUS.IN_PROGRESS],
  [INCIDENT_STATUS.IN_PROGRESS]: [INCIDENT_STATUS.RESOLVED],
  [INCIDENT_STATUS.RESOLVED]: [],
});

// ---------------------------------------------------------------------------
// AI confidence — a categorical enum in the final guide, NOT a 0-1 float.
// (Round 1 code used `aiConfidence: number`. That's gone.)
// ---------------------------------------------------------------------------
const CONFIDENCE = Object.freeze({
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  FALLBACK_ONLY: 'fallback_only',
});

const CONFIDENCE_LABELS = Object.freeze({
  [CONFIDENCE.HIGH]: 'High',
  [CONFIDENCE.MEDIUM]: 'Medium',
  [CONFIDENCE.LOW]: 'Low',
  [CONFIDENCE.FALLBACK_ONLY]: 'Fallback Only',
});

// Confidence levels that should visually/functionally read as "needs a
// second look," independent of the explicit needsHumanReview flag.
const LOW_SIGNAL_CONFIDENCE = Object.freeze([CONFIDENCE.LOW, CONFIDENCE.FALLBACK_ONLY]);

const SCORING_METHOD = Object.freeze({
  AI: 'ai',
  RULE_BASED_FALLBACK: 'rule_based_fallback',
});

// ---------------------------------------------------------------------------
// Severity is NOT a stored field in the final incident contract. It's
// derived from priorityScore. Keep the thresholds in one place so the
// backend (for insight_reports breakdowns) and frontend (for badges) agree.
// ---------------------------------------------------------------------------
const SEVERITY_THRESHOLDS = Object.freeze({
  CRITICAL_MIN: 80, // 80-100
  HIGH_MIN: 50,      // 50-79
  // below HIGH_MIN => moderate
});

const SEVERITY = Object.freeze({
  CRITICAL: 'critical',
  HIGH: 'high',
  MODERATE: 'moderate',
});

/** @param {number} priorityScore 0-100 @returns {'critical'|'high'|'moderate'} */
function deriveSeverity(priorityScore) {
  const score = typeof priorityScore === 'number' ? priorityScore : 0;
  if (score >= SEVERITY_THRESHOLDS.CRITICAL_MIN) return SEVERITY.CRITICAL;
  if (score >= SEVERITY_THRESHOLDS.HIGH_MIN) return SEVERITY.HIGH;
  return SEVERITY.MODERATE;
}

// ---------------------------------------------------------------------------
// Report/incident tags — owned by Member 1's report schema, mirrored here
// because incidents inherit `primaryTag` from their clustered reports.
// Note: "road_blocked" replaces the Round 1 "infrastructure" tag.
// ---------------------------------------------------------------------------
const TAG = Object.freeze({
  FLOOD: 'flood',
  INJURY: 'injury',
  TRAPPED: 'trapped',
  FOOD_WATER: 'food_water',
  MEDICAL: 'medical',
  ROAD_BLOCKED: 'road_blocked',
  OTHER: 'other',
});

const TAG_LABELS = Object.freeze({
  [TAG.FLOOD]: 'Flood',
  [TAG.INJURY]: 'Injury',
  [TAG.TRAPPED]: 'Trapped',
  [TAG.FOOD_WATER]: 'Food / Water',
  [TAG.MEDICAL]: 'Medical',
  [TAG.ROAD_BLOCKED]: 'Road Blocked',
  [TAG.OTHER]: 'Other',
});

// ---------------------------------------------------------------------------
// Report source — unchanged in spirit from Round 1, values confirmed
// against Member 1's Round 2 "reports" schema.
// ---------------------------------------------------------------------------
const REPORT_SOURCE = Object.freeze({
  APP: 'app',
  OFFLINE_SYNC: 'offline_sync',
  SMS: 'sms',
});

const REPORT_STATUS = Object.freeze({
  NEW: 'new',
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',
});

module.exports = {
  INCIDENT_STATUS,
  INCIDENT_STATUS_LABELS,
  STATUS_TRANSITIONS,
  CONFIDENCE,
  CONFIDENCE_LABELS,
  LOW_SIGNAL_CONFIDENCE,
  SCORING_METHOD,
  SEVERITY,
  SEVERITY_THRESHOLDS,
  deriveSeverity,
  TAG,
  TAG_LABELS,
  REPORT_SOURCE,
  REPORT_STATUS,
};
