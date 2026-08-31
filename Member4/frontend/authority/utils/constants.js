// Mirrors shared/constants/statuses.js (Round 2 canonical enums). Kept as a
// plain ES-module copy rather than importing across the frontend/backend
// boundary — this file adds UI-specific concerns (colors, icon components)
// that don't belong in the shared, framework-agnostic constants file. The
// *values* here (status/confidence/tag strings) must always match
// shared/constants/statuses.js exactly; shared/normalizeIncident.js (which
// IS imported directly by frontend hooks — see hooks/useIncidents.js) is
// the actual source of truth for what a canonical incident looks like.

import {
  CheckCircle2,
  Clock,
  PlayCircle,
  BadgeCheck,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Settings2,
} from 'lucide-react';

export const INCIDENT_STATUS = {
  NEW: 'new',
  ACKNOWLEDGED: 'acknowledged',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
};

export const STATUS_LABELS = {
  new: 'New',
  acknowledged: 'Acknowledged',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

// Color + icon + text for every status — color is never the only signal
// (Phase 21 accessibility requirement).
export const STATUS_STYLES = {
  new: { color: '#5aa9e6', bg: 'rgba(90, 169, 230, 0.14)', Icon: AlertTriangle },
  acknowledged: { color: '#a9bdcc', bg: 'rgba(169, 189, 204, 0.14)', Icon: BadgeCheck },
  in_progress: { color: '#e67e22', bg: 'rgba(230, 126, 34, 0.14)', Icon: PlayCircle },
  resolved: { color: '#34d399', bg: 'rgba(52, 211, 153, 0.14)', Icon: CheckCircle2 },
};

export const STATUS_TRANSITIONS = {
  new: ['acknowledged'],
  acknowledged: ['in_progress'],
  in_progress: ['resolved'],
  resolved: [],
};

export const STATUS_ACTION_LABELS = {
  acknowledged: 'Acknowledge',
  in_progress: 'Mark In Progress',
  resolved: 'Mark Resolved',
};

// Confidence is a categorical enum in Round 2, not a 0-1 float.
export const CONFIDENCE = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  FALLBACK_ONLY: 'fallback_only',
};

export const CONFIDENCE_LABELS = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  fallback_only: 'Fallback Only',
};

export const CONFIDENCE_STYLES = {
  high: { color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.12)', Icon: Sparkles },
  medium: { color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.10)', Icon: Sparkles },
  low: { color: '#f0c419', bg: 'rgba(240, 196, 25, 0.14)', Icon: AlertTriangle },
  fallback_only: { color: '#a9bdcc', bg: 'rgba(169, 189, 204, 0.12)', Icon: Settings2 },
};

export const LOW_SIGNAL_CONFIDENCE = ['low', 'fallback_only'];

export const SCORING_METHOD_LABELS = {
  ai: 'AI',
  rule_based_fallback: 'Rule-Based Fallback',
};

// Severity is DERIVED from priorityScore, never a stored field. Thresholds
// must match shared/constants/statuses.js exactly.
export const SEVERITY_THRESHOLDS = { CRITICAL_MIN: 80, HIGH_MIN: 50 };

export const SEVERITY_STYLES = {
  critical: { color: '#e0473a', bg: 'rgba(192, 57, 43, 0.16)', label: 'Critical', Icon: ShieldAlert },
  high: { color: '#e67e22', bg: 'rgba(230, 126, 34, 0.14)', label: 'High', Icon: AlertTriangle },
  moderate: { color: '#f0c419', bg: 'rgba(240, 196, 25, 0.14)', label: 'Moderate', Icon: Clock },
};

/** @param {number} priorityScore @returns {'critical'|'high'|'moderate'} */
export function deriveSeverity(priorityScore) {
  const score = typeof priorityScore === 'number' ? priorityScore : 0;
  if (score >= SEVERITY_THRESHOLDS.CRITICAL_MIN) return 'critical';
  if (score >= SEVERITY_THRESHOLDS.HIGH_MIN) return 'high';
  return 'moderate';
}

export const TAG_LABELS = {
  flood: 'Flood',
  injury: 'Injury',
  trapped: 'Trapped',
  food_water: 'Food / Water',
  medical: 'Medical',
  road_blocked: 'Road Blocked',
  other: 'Other',
};

export const SOURCE_LABELS = {
  app: 'APP',
  offline_sync: 'OFFLINE SYNC',
  sms: 'SMS',
};
