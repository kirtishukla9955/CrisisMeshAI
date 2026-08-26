/**
 * CrisisMesh AI — Shared status/category constants
 * Owned by: Member 4 (Authority Dashboard + Post-Disaster AI Agent)
 * Canonical enums for incident status/category so nothing drifts between
 * modules. Members 1-3 should import from here rather than redefining.
 */

const INCIDENT_STATUS = Object.freeze({
  NEW: "new",
  UNDER_REVIEW: "under_review",
  ASSIGNED: "assigned",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  ESCALATED: "escalated",
  REJECTED: "rejected",
});

const INCIDENT_STATUS_LABELS = Object.freeze({
  [INCIDENT_STATUS.NEW]: "New",
  [INCIDENT_STATUS.UNDER_REVIEW]: "Under Review",
  [INCIDENT_STATUS.ASSIGNED]: "Assigned",
  [INCIDENT_STATUS.IN_PROGRESS]: "In Progress",
  [INCIDENT_STATUS.RESOLVED]: "Resolved",
  [INCIDENT_STATUS.ESCALATED]: "Escalated",
  [INCIDENT_STATUS.REJECTED]: "Rejected / Invalid",
});

// Valid forward transitions — enforced by the backend validator so the
// frontend cannot push an incident into an illegal state.
const STATUS_TRANSITIONS = Object.freeze({
  [INCIDENT_STATUS.NEW]: [INCIDENT_STATUS.UNDER_REVIEW, INCIDENT_STATUS.REJECTED, INCIDENT_STATUS.ESCALATED],
  [INCIDENT_STATUS.UNDER_REVIEW]: [INCIDENT_STATUS.ASSIGNED, INCIDENT_STATUS.ESCALATED, INCIDENT_STATUS.REJECTED],
  [INCIDENT_STATUS.ASSIGNED]: [INCIDENT_STATUS.IN_PROGRESS, INCIDENT_STATUS.ESCALATED],
  [INCIDENT_STATUS.IN_PROGRESS]: [INCIDENT_STATUS.RESOLVED, INCIDENT_STATUS.ESCALATED],
  [INCIDENT_STATUS.ESCALATED]: [INCIDENT_STATUS.ASSIGNED, INCIDENT_STATUS.IN_PROGRESS, INCIDENT_STATUS.RESOLVED],
  [INCIDENT_STATUS.RESOLVED]: [],
  [INCIDENT_STATUS.REJECTED]: [],
});

const SEVERITY = Object.freeze({
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
});

// Matches Member 1's quick-tag system from the project brief.
const INCIDENT_CATEGORY = Object.freeze({
  FLOOD: "flood",
  INJURY: "injury",
  TRAPPED: "trapped",
  FOOD_WATER: "food_water",
  MEDICAL: "medical",
  INFRASTRUCTURE: "infrastructure",
  OTHER: "other",
});

const REPORT_SOURCE = Object.freeze({
  APP: "app",
  SMS: "sms",
  OFFLINE_SYNC: "offline_sync",
});

const AI_CONFIDENCE_THRESHOLD = {
  LOW: 0.6, // below this -> low-confidence -> human review queue
};

module.exports = {
  INCIDENT_STATUS,
  INCIDENT_STATUS_LABELS,
  STATUS_TRANSITIONS,
  SEVERITY,
  INCIDENT_CATEGORY,
  REPORT_SOURCE,
  AI_CONFIDENCE_THRESHOLD,
};
