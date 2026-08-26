// Mirrors shared/constants/statuses.js. Kept as a plain JS copy (rather than
// importing across the frontend/backend boundary) so this package has no
// build-time dependency on the backend folder. If the main repo already
// shares constants across a monorepo boundary, prefer importing from
// shared/constants/statuses.js instead and delete the duplication below.

export const INCIDENT_STATUS = {
  NEW: 'new',
  UNDER_REVIEW: 'under_review',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  ESCALATED: 'escalated',
  REJECTED: 'rejected',
};

export const STATUS_LABELS = {
  new: 'New',
  under_review: 'Under Review',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  escalated: 'Escalated',
  rejected: 'Rejected / Invalid',
};

export const STATUS_STYLES = {
  new: { color: '#7DD3FC', bg: 'rgba(125, 211, 252, 0.12)' },
  under_review: { color: '#FCD34D', bg: 'rgba(252, 211, 77, 0.12)' },
  assigned: { color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.12)' },
  in_progress: { color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)' },
  resolved: { color: '#34D399', bg: 'rgba(52, 211, 153, 0.12)' },
  escalated: { color: '#FB7185', bg: 'rgba(251, 113, 133, 0.14)' },
  rejected: { color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.12)' },
};

export const SEVERITY_STYLES = {
  critical: { color: '#FB7185', bg: 'rgba(251, 113, 133, 0.16)', label: 'Critical' },
  high: { color: '#FB923C', bg: 'rgba(251, 146, 60, 0.14)', label: 'High' },
  medium: { color: '#FCD34D', bg: 'rgba(252, 211, 77, 0.12)', label: 'Medium' },
  low: { color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)', label: 'Low' },
};

export const CATEGORY_LABELS = {
  flood: 'Flood',
  injury: 'Injury',
  trapped: 'Trapped',
  food_water: 'Food / Water',
  medical: 'Medical',
  infrastructure: 'Infrastructure',
  other: 'Other',
};

export const SOURCE_LABELS = {
  app: 'APP',
  sms: 'SMS',
  offline_sync: 'OFFLINE SYNC',
};

export const AI_CONFIDENCE_LOW_THRESHOLD = 0.6;

export const STATUS_TRANSITIONS = {
  new: ['under_review', 'rejected', 'escalated'],
  under_review: ['assigned', 'escalated', 'rejected'],
  assigned: ['in_progress', 'escalated'],
  in_progress: ['resolved', 'escalated'],
  escalated: ['assigned', 'in_progress', 'resolved'],
  resolved: [],
  rejected: [],
};
