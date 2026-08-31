import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { CONFIDENCE_LABELS, CONFIDENCE_STYLES, SCORING_METHOD_LABELS } from '../utils/constants';

/**
 * The visible carrier of the guide's human-in-the-loop AI safety
 * requirement (Phase 14-15). `confidence` is a categorical enum
 * ("high"|"medium"|"low"|"fallback_only"), not a float — read directly
 * from a normalized incident, never derived here.
 */
export default function AIConfidenceBadge({ confidence, scoringMethod, needsHumanReview = false, compact = false }) {
  if (needsHumanReview) {
    return (
      <span
        className="cm-mono inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium"
        style={{ color: 'var(--cm-warning)', background: 'var(--cm-moderate-bg)', borderColor: 'var(--cm-warning)55' }}
      >
        <AlertTriangle size={12} aria-hidden="true" />
        HUMAN REVIEW REQUIRED
      </span>
    );
  }

  const style = CONFIDENCE_STYLES[confidence] || CONFIDENCE_STYLES.medium;
  const { Icon } = style;
  const methodLabel = scoringMethod ? SCORING_METHOD_LABELS[scoringMethod] : null;

  return (
    <span
      className="cm-mono inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium"
      style={{ color: style.color, background: style.bg, borderColor: `${style.color}55` }}
    >
      <Icon size={12} aria-hidden="true" />
      {CONFIDENCE_LABELS[confidence] || confidence} confidence
      {!compact && methodLabel && (
        <span className="text-[color:var(--cm-text-muted)] font-normal ml-1">· {methodLabel}</span>
      )}
    </span>
  );
}
