import React from 'react';
import { SEVERITY_STYLES } from '../utils/constants';

/**
 * Severity (critical/high/moderate) is DERIVED from priorityScore, never a
 * stored field — pass the already-derived `severity` from a normalized
 * incident (incident.severity), not a raw Firestore field.
 * The priority score itself is rendered prominently per the guide.
 */
export default function SeverityBadge({ priorityScore, severity, size = 'md' }) {
  const style = SEVERITY_STYLES[severity] || SEVERITY_STYLES.moderate;
  const { Icon } = style;
  const dims = size === 'lg' ? 'w-16 h-16 text-2xl' : 'w-12 h-12 text-lg';

  return (
    <div className="flex items-center gap-3">
      <div
        className={`cm-mono ${dims} flex items-center justify-center rounded-full font-semibold shrink-0`}
        style={{ color: style.color, background: style.bg, border: `2px solid ${style.color}55` }}
        title={`Priority score ${priorityScore}`}
      >
        {priorityScore ?? '—'}
      </div>
      <div>
        <div
          className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: style.color }}
        >
          <Icon size={13} aria-hidden="true" />
          {style.label}
        </div>
        <div className="text-[11px] text-[color:var(--cm-text-muted)]">Priority {priorityScore ?? '—'}/100</div>
      </div>
    </div>
  );
}
